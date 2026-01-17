import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalysisData {
    key_strengths: string[];
    areas_to_improve: string[];
    summary: string;
    // Optional detailed metrics
    detailed_scores?: {
        communication?: number;
        technical_knowledge?: number;
        problem_solving?: number;
        cultural_fit?: number;
    };
}

interface RoundScoreCardProps {
    title: string;
    score: number | null;
    correctAnswers?: string;
    status: "passed" | "failed" | null;
}

interface AnalysisSectionProps {
    analysis: AnalysisData;
    rounds?: {
        round_1?: { score: number | null; raw_score: number | null; total_questions?: number; passed: boolean | null };
        round_2?: { score: number | null; raw_score: number | null; total_questions?: number; passed: boolean | null };
        round_3?: { score: number | null; passed: boolean | null };
    };
}

function RoundScoreCard({ title, score, correctAnswers, status }: RoundScoreCardProps) {
    return (
        <Card className="p-6 bg-white border border-border">
            <div className="text-center">
                <div className={cn(
                    "text-5xl font-bold mb-2",
                    score && score >= 80 ? "text-emerald-600" :
                        score && score >= 60 ? "text-amber-600" :
                            "text-red-600"
                )}>
                    {score !== null ? `${score}%` : "N/A"}
                </div>
                {correctAnswers && (
                    <p className="text-sm text-muted-foreground mb-4">{correctAnswers}</p>
                )}
                {status && (
                    <div className={cn(
                        "inline-block px-6 py-2 rounded-full text-sm font-medium",
                        status === "passed" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                        {status === "passed" ? "Passed" : "Failed"}
                    </div>
                )}
            </div>
        </Card>
    );
}

function DetailedScoreCard({
    score,
    correctAnswers,
    status,
    detailedScores
}: {
    score: number | null;
    correctAnswers?: string;
    status: "passed" | "failed" | null;
    detailedScores?: {
        communication?: number;
        technical_knowledge?: number;
        problem_solving?: number;
        cultural_fit?: number;
    };
}) {
    return (
        <Card className="p-6 bg-white border border-border">
            <div className="text-center mb-6">
                <div className={cn(
                    "text-5xl font-bold mb-2",
                    score && score >= 80 ? "text-emerald-600" :
                        score && score >= 60 ? "text-amber-600" :
                            "text-red-600"
                )}>
                    {score !== null ? `${score}%` : "N/A"}
                </div>
                {correctAnswers && (
                    <p className="text-sm text-muted-foreground mb-4">{correctAnswers}</p>
                )}
            </div>

            {detailedScores && Object.keys(detailedScores).length > 0 && (
                <div className="space-y-2.5 mb-4">
                    {detailedScores.communication !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Communication</span>
                            <span className="font-semibold text-foreground">{detailedScores.communication}%</span>
                        </div>
                    )}
                    {detailedScores.technical_knowledge !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Technical Knowledge</span>
                            <span className="font-semibold text-foreground">{detailedScores.technical_knowledge}%</span>
                        </div>
                    )}
                    {detailedScores.problem_solving !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Problem Solving</span>
                            <span className="font-semibold text-foreground">{detailedScores.problem_solving}%</span>
                        </div>
                    )}
                    {detailedScores.cultural_fit !== undefined && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Cultural Fit</span>
                            <span className="font-semibold text-foreground">{detailedScores.cultural_fit}%</span>
                        </div>
                    )}
                </div>
            )}

            {status && (
                <div className={cn(
                    "w-full py-2 rounded-full text-sm font-medium text-center",
                    status === "passed" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                    {status === "passed" ? "Passed" : "Failed"}
                </div>
            )}
        </Card>
    );
}

export function AnalysisSection({ analysis, rounds }: AnalysisSectionProps) {
    return (
        <div className="space-y-6">
            {/* Key Strengths & Areas to Develop - Side by Side */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Key Strengths */}
                <Card className="p-6 bg-white border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Key Strengths</h3>
                    </div>
                    <ul className="space-y-2.5">
                        {analysis.key_strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                                <span>{strength}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Areas to Develop */}
                <Card className="p-6 bg-white border border-border">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Areas to Develop</h3>
                    </div>
                    <ul className="space-y-2.5">
                        {analysis.areas_to_improve.map((area, index) => (
                            <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                                <span>{area}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            {/* AI Summary */}
            <Card className="p-6 bg-white border border-border">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">AI Summary</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.summary}
                </p>
            </Card>
        </div>
    );
}
