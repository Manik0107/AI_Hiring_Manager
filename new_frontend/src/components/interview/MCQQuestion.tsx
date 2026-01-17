import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface MCQQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: Option[];
  selectedAnswer: string | null;
  onSelectAnswer: (optionId: string) => void;
  showResult?: boolean;
  correctAnswer?: string;
}

export function MCQQuestion({
  questionNumber,
  totalQuestions,
  question,
  options,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  correctAnswer,
}: MCQQuestionProps) {
  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full",
                i + 1 === questionNumber
                  ? "bg-primary"
                  : i + 1 < questionNumber
                  ? "bg-emerald-500"
                  : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="p-6 rounded-xl bg-muted/50 border border-border">
        <p className="text-lg font-medium text-foreground leading-relaxed">
          {question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = showResult && option.id === correctAnswer;
          const isWrong = showResult && isSelected && option.id !== correctAnswer;

          return (
            <button
              key={option.id}
              onClick={() => !showResult && onSelectAnswer(option.id)}
              disabled={showResult}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left",
                isCorrect
                  ? "border-emerald-500 bg-emerald-50"
                  : isWrong
                  ? "border-red-500 bg-red-50"
                  : isSelected
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              )}
            >
              <span
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                  isCorrect
                    ? "bg-emerald-500 text-white"
                    : isWrong
                    ? "bg-red-500 text-white"
                    : isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm",
                  isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {option.text}
              </span>
              {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
