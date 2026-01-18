import { Link, useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  User,
  Clock,
  Calendar,
  Sparkles,
  Brain,
  Code,
  Mic,
  Trophy,
  Target,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AnalysisSection } from "@/components/dashboard/AnalysisSection";
import { GrantReattemptDialog } from "@/components/admin/GrantReattemptDialog";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RoundData {
  title: string;
  score: number | null;
  raw_score: number | null;
  total_questions?: number;
  passed: boolean | null;
  status: string;
}

interface ResultsData {
  candidate_id: number;
  candidate_name: string;
  email: string;
  role: string;
  application_date: string | null;
  current_round: number;
  overall_status: string;
  overall_score: number | null;
  recommendation: string | null;
  can_reattempt: boolean;
  current_attempt_number: number;
  rounds: {
    round_1: RoundData;
    round_2: RoundData;
    round_3: RoundData;
  };
}

const recommendationConfig = {
  "Recommended to Hire": {
    label: "Recommended to Hire",
    sublabel: "Passed all rounds with strong scores",
    icon: Trophy,
    className: "bg-emerald-500 text-white",
    iconClass: "text-white",
    bgClass: "bg-emerald-50 border-emerald-200",
  },
  "Consider for Next Steps": {
    label: "Consider for Next Steps",
    sublabel: "Review performance before deciding",
    icon: AlertCircle,
    className: "bg-amber-500 text-white",
    iconClass: "text-white",
    bgClass: "bg-amber-50 border-amber-200",
  },
  "Not Recommended": {
    label: "Not Recommended",
    sublabel: "Did not meet minimum requirements",
    icon: XCircle,
    className: "bg-red-500 text-white",
    iconClass: "text-white",
    bgClass: "bg-red-50 border-red-200",
  },
};

export default function InterviewResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchResults();
    checkUserRole();
  }, [id]);

  const checkUserRole = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.role === "admin");
    }
  };

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/interview/${id}/results`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      setResults(data);

      // Fetch analysis if admin and interview is completed
      if (data.overall_status === "completed") {
        fetchAnalysis();
      }

      // Always fetch attempt history to show in accordion
      fetchAttemptHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttemptHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/admin/candidate/${id}/attempts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAttemptHistory(data.attempts || []);
      }
    } catch (err) {
      console.error("Failed to fetch attempt history:", err);
    }
  };

  const fetchAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/interview/${id}/analysis`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (err) {
      console.error("Failed to fetch analysis:", err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || "Results not found"}</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const recConfig =
    recommendationConfig[
    (results.recommendation as keyof typeof recommendationConfig) ||
    "Not Recommended"
    ];

  const rounds = [
    {
      id: 1,
      title: results.rounds.round_1.title,
      icon: Brain,
      score: results.rounds.round_1.score,
      correct: results.rounds.round_1.raw_score,
      total: results.rounds.round_1.total_questions,
      status: results.rounds.round_1.passed ? "passed" : ("failed" as const),
    },
    {
      id: 2,
      title: results.rounds.round_2.title,
      icon: Code,
      score: results.rounds.round_2.score,
      correct: results.rounds.round_2.raw_score,
      total: results.rounds.round_2.total_questions,
      status: results.rounds.round_2.passed ? "passed" : ("failed" as const),
    },
    {
      id: 3,
      title: results.rounds.round_3.title,
      icon: Mic,
      score: results.rounds.round_3.score,
      status: results.rounds.round_3.passed ? "passed" : ("failed" as const),
    },
  ].filter((round) => round.score !== null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold text-lg text-foreground">
                  Interview Results
                </h1>
                <p className="text-sm text-muted-foreground">
                  {results.candidate_name} • {results.role}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="section-container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Decision Banner */}
          {results.overall_score !== null && (
            <div
              className={cn(
                "rounded-2xl p-6 md:p-8 mb-8 border",
                recConfig.bgClass
              )}
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center",
                    recConfig.className
                  )}
                >
                  <recConfig.icon className={cn("w-10 h-10", recConfig.iconClass)} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {recConfig.label}
                  </h2>
                  <p className="text-muted-foreground">{recConfig.sublabel}</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-foreground mb-1">
                    {results.overall_score}%
                  </div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
              </div>
            </div>
          )}

          {/* Candidate Info */}
          <div className="card-elevated p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {results.candidate_name}
                    </h3>
                    <p className="text-muted-foreground mb-3">{results.role}</p>
                  </div>
                  {isAdmin && results.overall_status !== "registered" && (
                    <GrantReattemptDialog
                      candidateId={results.candidate_id}
                      candidateName={results.candidate_name}
                      currentAttemptNumber={results.current_attempt_number}
                      onSuccess={() => {
                        fetchResults();
                        fetchAttemptHistory();
                      }}
                    />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(results.application_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Status: {results.overall_status}
                  </span>
                  {isAdmin && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Attempt:</span> {results.current_attempt_number}
                    </span>
                  )}
                </div>
                {isAdmin && results.can_reattempt && (
                  <div className="mt-3 p-2 bg-amber-100 border border-amber-300 rounded-lg">
                    <p className="text-xs text-amber-900 font-medium">
                      ⚠️ Re-attempt access granted
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attempt History Section */}
          {isAdmin && attemptHistory.length > 0 && (
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                {attemptHistory.length > 1 ? "Attempt History" : "Current Attempt"}
              </h3>
              <Accordion type="single" collapsible className="space-y-3">
                {attemptHistory.map((attempt: any, index: number) => (
                  <AccordionItem value={`attempt-${index}`} key={index} className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            Attempt {attempt.attempt_number}
                          </span>
                          {attempt.is_current && (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        {attempt.overall_score !== null && (
                          <span
                            className={cn(
                              "text-2xl font-bold",
                              attempt.overall_score >= 70
                                ? "text-emerald-600"
                                : attempt.overall_score >= 50
                                  ? "text-amber-600"
                                  : "text-red-600"
                            )}
                          >
                            {Math.round(attempt.overall_score)}%
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2">
                      {/* Performance Overview Cards */}
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {/* Aptitude Card */}
                        <Card className="p-4 bg-white border border-border">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-2">Aptitude Test</p>
                            <div className={cn(
                              "text-3xl font-bold mb-1",
                              attempt.round_1_score !== null && attempt.round_1_score * 20 >= 80 ? "text-emerald-600" :
                                attempt.round_1_score !== null && attempt.round_1_score * 20 >= 60 ? "text-amber-600" :
                                  "text-red-600"
                            )}>
                              {attempt.round_1_score !== null ? `${attempt.round_1_score * 20}%` : "N/A"}
                            </div>
                            {attempt.round_1_score !== null && (
                              <p className="text-xs text-muted-foreground mb-2">{attempt.round_1_score}/5 correct</p>
                            )}
                            {attempt.round_1_score !== null && (
                              <div className={cn(
                                "inline-block px-3 py-1 rounded-full text-xs font-medium",
                                attempt.round_1_score >= 3 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                              )}>
                                {attempt.round_1_score >= 3 ? "Passed" : "Failed"}
                              </div>
                            )}
                          </div>
                        </Card>

                        {/* DSA Card */}
                        <Card className="p-4 bg-white border border-border">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-2">DSA Assessment</p>
                            <div className={cn(
                              "text-3xl font-bold mb-1",
                              attempt.round_2_score !== null && attempt.round_2_score * 20 >= 80 ? "text-emerald-600" :
                                attempt.round_2_score !== null && attempt.round_2_score * 20 >= 60 ? "text-amber-600" :
                                  "text-red-600"
                            )}>
                              {attempt.round_2_score !== null ? `${attempt.round_2_score * 20}%` : "N/A"}
                            </div>
                            {attempt.round_2_score !== null && (
                              <p className="text-xs text-muted-foreground mb-2">{attempt.round_2_score}/5 correct</p>
                            )}
                            {attempt.round_2_score !== null && (
                              <div className={cn(
                                "inline-block px-3 py-1 rounded-full text-xs font-medium",
                                attempt.round_2_score >= 3 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                              )}>
                                {attempt.round_2_score >= 3 ? "Passed" : "Failed"}
                              </div>
                            )}
                          </div>
                        </Card>

                        {/* Voice Interview Card */}
                        <Card className="p-4 bg-white border border-border">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-2">Voice Interview</p>
                            <div className={cn(
                              "text-3xl font-bold mb-1",
                              attempt.round_3_score !== null && attempt.round_3_score >= 80 ? "text-emerald-600" :
                                attempt.round_3_score !== null && attempt.round_3_score >= 60 ? "text-amber-600" :
                                  "text-red-600"
                            )}>
                              {attempt.round_3_score !== null ? `${Math.round(attempt.round_3_score)}%` : "N/A"}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">&nbsp;</p>
                            {attempt.round_3_score !== null && (
                              <div className={cn(
                                "inline-block px-3 py-1 rounded-full text-xs font-medium",
                                attempt.round_3_score >= 60 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                              )}>
                                {attempt.round_3_score >= 60 ? "Passed" : "Failed"}
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>

                      {/* Recommendation */}
                      {attempt.recommendation && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium text-foreground">
                            Recommendation: {attempt.recommendation}
                          </span>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          )}

          {/* Admin-Only Analysis Section */}
          {isAdmin && analysis && !analysisLoading && (
            <AnalysisSection
              analysis={analysis}
              rounds={{
                round_1: results.rounds.round_1,
                round_2: results.rounds.round_2,
                round_3: results.rounds.round_3,
              }}
            />
          )}

          {isAdmin && analysisLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading analysis...</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-border">
            <Button variant="outline" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div >
      </main >
    </div >
  );
}
