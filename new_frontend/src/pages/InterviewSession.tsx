import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Send,
  Clock,
  Sparkles,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: Date;
}

const mockQuestions = [
  "Hello! I'm your AI interviewer. Let's start with a brief introduction. Can you tell me about your background and what interests you about this role?",
  "Great! Can you walk me through a challenging technical problem you've solved recently? What was your approach?",
  "How do you typically handle disagreements with team members about technical decisions?",
  "Tell me about a time when you had to learn a new technology quickly. How did you approach it?",
  "What questions do you have about our team or the role?",
];

export default function InterviewSession() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const totalQuestions = mockQuestions.length;
  const progress = (currentQuestion / totalQuestions) * 100;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial AI message
  useEffect(() => {
    setTimeout(() => {
      addAIMessage(mockQuestions[0]);
    }, 1000);
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const addAIMessage = (content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          content,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
      },
    ]);
    setInput("");

    // Check if interview is complete
    if (currentQuestion >= totalQuestions - 1) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "ai",
            content:
              "Thank you for your time today! That concludes our interview. You'll receive your evaluation shortly.",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
        setIsComplete(true);
      }, 1500);
    } else {
      // Next question
      setCurrentQuestion((prev) => prev + 1);
      setTimeout(() => {
        addAIMessage(mockQuestions[currentQuestion + 1]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="section-container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-sm text-foreground">
                  Interview in Progress
                </h1>
                <p className="text-xs text-muted-foreground">
                  Senior Frontend Engineer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Progress */}
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Question {Math.min(currentQuestion + 1, totalQuestions)} of{" "}
                  {totalQuestions}
                </span>
                <Progress value={progress} className="w-24 h-2" />
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {formatTime(timeElapsed)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="section-container py-6 max-w-3xl mx-auto">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === "ai"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {message.role === "ai" ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "ai"
                        ? "bg-muted text-foreground rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse" />
                      <span
                        className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card">
          <div className="section-container py-4 max-w-3xl mx-auto">
            {isComplete ? (
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Interview Complete</span>
                </div>
                <Button onClick={() => navigate("/interview/1/results")}>
                  View Results
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Type your response..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                  className="flex-1 h-11"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="h-11 w-11"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
