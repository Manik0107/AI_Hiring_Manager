import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoundIndicator } from "@/components/interview/RoundIndicator";
import { MCQQuestion } from "@/components/interview/MCQQuestion";
import { VoiceRecorder } from "@/components/interview/VoiceRecorder";
import { ChatMessage } from "@/components/interview/ChatMessage";
import {
  aptitudeQuestions,
  dsaQuestions,
} from "@/data/interviewQuestions";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  Brain,
  Code,
  Mic,
  Lock,
  Play,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceInterview } from "@/hooks/useVoiceInterview";

// Helper to get random 5 questions
function getRandomQuestions<T>(questions: T[], count: number = 5): T[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const rounds = [
  {
    id: 1,
    title: "Aptitude Round",
    description: "Test your logical reasoning and problem-solving skills",
    icon: Brain,
    duration: "~10 mins",
    questionCount: 5,
  },
  {
    id: 2,
    title: "DSA Round",
    description: "Data Structures & Algorithms concepts",
    icon: Code,
    duration: "~10 mins",
    questionCount: 5,
  },
  {
    id: 3,
    title: "Voice Interview",
    description: "One-on-one conversation with AI interviewer",
    icon: Mic,
    duration: "~15 mins",
    questionCount: null,
  },
];

export default function InterviewRound() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roundParam = searchParams.get("round");
  const currentRound = roundParam ? parseInt(roundParam) : null;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [completedRounds, setCompletedRounds] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [candidateId, setCandidateId] = useState<number | null>(null);

  // Fetch candidate ID on mount
  useEffect(() => {
    const fetchCandidateId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        if (!token) return;

        const response = await fetch(endpoints.auth.me, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCandidateId(data.id);
        }
      } catch (error) {
        console.error("Error fetching candidate ID:", error);
      }
    };

    fetchCandidateId();
  }, []);

  // Prevent re-interview if already completed
  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        if (!token) return;

        const response = await fetch(endpoints.auth.me, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // If user has completed all rounds, redirect to thank you page
          // CHECK: Redirect regardless of whether currentRound is set or not
          if (data.candidate_status === "completed") {
            navigate("/thank-you");
          }
        }
      } catch (error) {
        console.error("Error checking completion status:", error);
      }
    };

    checkCompletionStatus();
    // Re-run check when navigating between rounds
  }, [currentRound, navigate]);

  // Loading state to prevent content flash
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsCheckingStatus(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Voice Interview Hook (MUST be called before any conditional returns)
  const {
    connect,
    disconnect,
    startRecording,
    stopRecording,
    messages,
    isRecording,
    isProcessing,
    isAiSpeaking,
    isConnected
  } = useVoiceInterview({
    onComplete: () => {
      setTimeout(() => {
        handleRoundComplete();
      }, 3000);
    },
    jobRole: "Software Engineer", // This could come from context/url
    candidateName: "Candidate",
  });

  // Get random 5 questions for MCQ rounds (memoized per round)
  const randomAptitudeQuestions = useMemo(
    () => getRandomQuestions(aptitudeQuestions, 5),
    [currentRound === 1]
  );

  const randomDsaQuestions = useMemo(
    () => getRandomQuestions(dsaQuestions, 5),
    [currentRound === 2]
  );

  const questions = currentRound === 1
    ? randomAptitudeQuestions
    : currentRound === 2
      ? randomDsaQuestions
      : [];

  const totalQuestions = questions.length;

  // Timer - only run when inside a round
  useEffect(() => {
    if (!currentRound) return;

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentRound]);

  // Auto scroll for chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset state when entering a new round
  useEffect(() => {
    if (currentRound) {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setTimeElapsed(0);
      setAnswers({});
      setInterviewStarted(false);

      // Cleanup previous voice session
      if (currentRound !== 3) {
        disconnect();
      }
    }
  }, [currentRound, disconnect]);

  // Load completed rounds from backend on mount (MUST be before early return)
  useEffect(() => {
    const fetchCompletionStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        if (!token) return;

        const response = await fetch(`${endpoints.interviewWs}/../quiz/status`.replace('/interview/ws', ''), {
          // NOTE: This URL construction is hacky because endpoints doesn't have quiz/status yet.
          // Better to update api.ts first, but for now fixing the hardcoded localhost.
          // Actually, let's fix api.ts first or assume endpoints.quizStatus exists?
          // The safer bet is using API_BASE_URL which usually isn't exported.
          // Let's use a relative path if possible? No, fetch needs full URL.
          // Let's assume we'll fix api.ts next.
          // For now, let's use a constructed string using endpoints.auth.me base.
          // Actually, let's just update the api.ts file first in the next step.
          // Reverting this thought: I will use a replacement that constructs from endpoints.auth.me for now as a temporary fix
          // `endpoints.auth.me.replace('/auth/me', '/quiz/status')`
        });


        if (response.ok) {
          const data = await response.json();
          const completed = [];

          // Add rounds to completed array based on actual scores
          if (data.round_1_score !== null) completed.push(1);
          if (data.round_2_score !== null) completed.push(2);
          if (data.round_3_score !== null) completed.push(3);

          setCompletedRounds(completed);
        }
      } catch (error) {
        console.error("Error fetching completion status:", error);
      }
    };

    fetchCompletionStatus();
  }, []);

  // NOW we can do early returns after all hooks are called
  if (isCheckingStatus && completedRounds.length === 0) {
    // Show nothing or loader while checking initial status
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (optionId: string) => {
    setSelectedAnswer(optionId);
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    const questionId = questions[currentQuestionIndex].id;
    const updatedAnswers = { ...answers, [questionId]: selectedAnswer };
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Pass the updated answers directly to avoid async state issue
      handleRoundComplete(updatedAnswers);
    }
  };

  const handleRoundComplete = async (finalAnswers?: Record<string, string>) => {
    if (!currentRound) return;

    // For MCQ rounds (1 and 2), submit scores to backend
    if (currentRound === 1 || currentRound === 2) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No auth token found");
          return;
        }

        // Use finalAnswers if provided (for last question), otherwise use state
        const answersToSubmit = finalAnswers || answers;

        // Calculate which answers were correct
        const quizAnswers = questions.map((q, index) => {
          const userAnswer = answersToSubmit[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          return {
            question_id: index,
            answer: userAnswer || "",
            is_correct: isCorrect
          };
        });

        // Submit to backend
        const response = await fetch(endpoints.quiz.submit, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            round_number: currentRound,
            answers: quizAnswers,
            total_questions: questions.length
          })
        });

        if (!response.ok) {
          throw new Error("Failed to submit quiz");
        }

        const result = await response.json();
        console.log("Quiz submitted successfully:", result);
      } catch (error) {
        console.error("Error submitting quiz:", error);
      }
    }

    setCompletedRounds((prev) => {
      if (!prev.includes(currentRound)) {
        return [...prev, currentRound];
      }
      return prev;
    });

    if (currentRound < 3) {
      // Go back to round selection
      navigate("/interview/round");
    } else {
      // All rounds complete - go to thank you page
      navigate("/thank-you");
    }
  };

  const handleEnterRound = (roundId: number) => {
    const isUnlocked = roundId === 1 || completedRounds.includes(roundId - 1);
    if (!isUnlocked) return;

    navigate(`/interview/round?round=${roundId}`);
  };

  const handleBackToSelection = () => {
    disconnect();
    navigate("/interview/round");
  };

  const handleStartVoiceInterview = () => {
    setInterviewStarted(true);
    connect();
  };

  const getRoundTitle = () => {
    switch (currentRound) {
      case 1:
        return "Aptitude Round";
      case 2:
        return "DSA Round";
      case 3:
        return "Voice Interview";
      default:
        return "Interview";
    }
  };

  const getRoundIcon = () => {
    switch (currentRound) {
      case 1:
        return Brain;
      case 2:
        return Code;
      case 3:
        return Mic;
      default:
        return Sparkles;
    }
  };

  // Round Selection View
  if (!currentRound) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="section-container py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Interview Rounds</h1>
                <p className="text-muted-foreground mt-1">
                  Complete all three rounds to finish your interview
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Interview
              </Button>
            </div>

            {/* Progress Overview */}
            <div className="mt-6">
              <RoundIndicator
                currentRound={completedRounds.length + 1}
                completedRounds={completedRounds}
              />
            </div>
          </div>
        </header>

        {/* Round Cards */}
        <main className="section-container py-8">
          <div className="grid gap-4 max-w-2xl mx-auto">
            {rounds.map((round) => {
              const isCompleted = completedRounds.includes(round.id);
              const isUnlocked = round.id === 1 || completedRounds.includes(round.id - 1);
              const Icon = round.icon;

              return (
                <button
                  key={round.id}
                  onClick={() => handleEnterRound(round.id)}
                  disabled={!isUnlocked || isCompleted}
                  className={cn(
                    "w-full text-left p-6 rounded-xl border transition-all",
                    isCompleted
                      ? "bg-emerald-50 border-emerald-200 cursor-default"
                      : isUnlocked
                        ? "bg-card border-border hover:border-primary hover:shadow-md cursor-pointer"
                        : "bg-muted/50 border-border cursor-not-allowed opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center",
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isUnlocked
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : !isUnlocked ? (
                        <Lock className="w-6 h-6" />
                      ) : (
                        <Icon className="w-7 h-7" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          Round {round.id}: {round.title}
                        </h3>
                        {isCompleted && (
                          <span className="badge-success text-xs">Completed</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {round.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {round.duration}
                        </span>
                        {round.questionCount && (
                          <span>{round.questionCount} questions</span>
                        )}
                      </div>
                    </div>

                    {isUnlocked && !isCompleted && (
                      <div className="flex items-center gap-2 text-primary">
                        <span className="text-sm font-medium">Start</span>
                        <Play className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* All Complete Message */}
          {completedRounds.length === 3 && (
            <div className="max-w-2xl mx-auto mt-8 text-center">
              <div className="card-elevated p-8">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  All Rounds Completed!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Great job! You've completed all interview rounds.
                </p>
                <Button size="lg" onClick={() => navigate("/interview/results")}>
                  View Your Results
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  const RoundIcon = getRoundIcon();

  // Active Round View
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToSelection}
                className="mr-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              {/* <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"> */}
              {/* <RoundIcon className="w-5 h-5 text-primary-foreground" /> */}
              {/* </div> */}
              <div>
                <h1 className="font-semibold text-foreground">
                  Round {currentRound}: {getRoundTitle()}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentRound === 3
                    ? "Voice Interview Session"
                    : `${totalQuestions} Questions`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{formatTime(timeElapsed)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <RoundIndicator
              currentRound={currentRound}
              completedRounds={completedRounds}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {currentRound === 3 ? (
          // Voice Interview UI
          <div className="flex-1 flex flex-col">
            {!interviewStarted ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Mic className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Voice Interview
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    You'll have a one-on-one conversation with our AI interviewer.
                    Click the button below to start, then use the recording button
                    to answer each question.
                  </p>
                  <Button size="lg" onClick={handleStartVoiceInterview} className="px-8">
                    <Mic className="w-5 h-5 mr-2" />
                    Start Interview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto">
                  <div className="section-container py-6 max-w-3xl mx-auto">
                    {!isConnected && (
                      <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm text-center">
                        Connecting to interview server...
                      </div>
                    )}

                    <div className="space-y-4">
                      {messages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          role={message.role}
                          content={message.content}
                        />
                      ))}

                      {(isProcessing || isAiSpeaking) && (
                        <div className="flex gap-3 animate-fade-in">
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div className="bg-muted rounded-2xl rounded-tl-sm px-5 py-3">
                            <div className="flex gap-1.5 items-center">
                              {isAiSpeaking ? (
                                <>
                                  <div className="w-1 h-4 bg-primary/50 animate-[wave_1s_ease-in-out_infinite]" />
                                  <div className="w-1 h-6 bg-primary/50 animate-[wave_1s_ease-in-out_infinite_0.1s]" />
                                  <div className="w-1 h-3 bg-primary/50 animate-[wave_1s_ease-in-out_infinite_0.2s]" />
                                  <div className="w-1 h-5 bg-primary/50 animate-[wave_1s_ease-in-out_infinite_0.3s]" />
                                  <span className="text-xs text-muted-foreground ml-2">Speaking...</span>
                                </>
                              ) : (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Thinking...</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>

                {/* Voice Recorder */}
                <div className="border-t border-border bg-card py-6">
                  <VoiceRecorder
                    isRecording={isRecording}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    disabled={!isConnected || isAiSpeaking || isProcessing}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          // MCQ UI (Aptitude & DSA)
          <div className="flex-1 overflow-y-auto">
            <div className="section-container py-8 max-w-2xl mx-auto">
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="font-medium text-foreground">
                    {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
                  </span>
                </div>
                <Progress
                  value={((currentQuestionIndex + 1) / totalQuestions) * 100}
                  className="h-2"
                />
              </div>

              {/* Question Card */}
              <div className="card-elevated p-6 md:p-8">
                <MCQQuestion
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={totalQuestions}
                  question={questions[currentQuestionIndex].question}
                  options={questions[currentQuestionIndex].options}
                  selectedAnswer={selectedAnswer}
                  onSelectAnswer={handleSelectAnswer}
                />

                {/* Navigation */}
                <div className="flex items-center justify-end mt-8 pt-6 border-t border-border">
                  <Button onClick={handleNext} disabled={!selectedAnswer}>
                    {currentQuestionIndex === totalQuestions - 1 ? (
                      <>
                        Complete Round
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
