import { cn } from "@/lib/utils";
import { Check, Brain, Code, Mic } from "lucide-react";

interface RoundIndicatorProps {
  currentRound: number;
  completedRounds: number[];
}

const rounds = [
  { id: 1, title: "Aptitude", icon: Brain },
  { id: 2, title: "DSA", icon: Code },
  { id: 3, title: "Interview", icon: Mic },
];

export function RoundIndicator({ currentRound, completedRounds }: RoundIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {rounds.map((round, index) => {
        const isCompleted = completedRounds.includes(round.id);
        const isCurrent = currentRound === round.id;
        const Icon = round.icon;

        return (
          <div key={round.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all",
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {round.title}
              </span>
            </div>
            {index < rounds.length - 1 && (
              <div
                className={cn(
                  "w-8 md:w-16 h-0.5 mx-2",
                  completedRounds.includes(round.id) ? "bg-emerald-500" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
