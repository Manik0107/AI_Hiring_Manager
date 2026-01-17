import { Link } from "react-router-dom";
import { Clock, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewCardProps {
  id: string;
  candidateName: string;
  role: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "registered";
  score?: number;
  date: string;
  duration?: string;
}

const statusConfig = {
  registered: {
    label: "Registered",
    className: "status-badge-neutral",
  },
  pending: {
    label: "Pending",
    className: "status-badge-neutral",
  },
  in_progress: {
    label: "In Progress",
    className: "status-badge-info",
  },
  completed: {
    label: "Completed",
    className: "status-badge-success",
  },
  cancelled: {
    label: "Cancelled",
    className: "status-badge-error",
  },
};

export function InterviewCard({
  id,
  candidateName,
  role,
  status,
  score,
  date,
  duration,
}: InterviewCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <Link
      to={`/interview/${id}/results`}
      className="card-interactive p-4 flex items-center gap-4 group"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
        <User className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-foreground truncate">
            {candidateName}
          </h3>
          <span className={cn("status-badge", statusInfo.className)}>
            {statusInfo.label}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{role}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {date}
          </span>
          {duration && <span>{duration}</span>}
        </div>
      </div>

      {/* Score (if completed) */}
      {status === "completed" && score !== undefined && (
        <div className="text-right shrink-0">
          <div
            className={cn(
              "text-2xl font-bold",
              score >= 80
                ? "score-high"
                : score >= 60
                  ? "score-medium"
                  : "score-low"
            )}
          >
            {score}
          </div>
          <div className="text-xs text-muted-foreground">Score</div>
        </div>
      )}

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
    </Link>
  );
}
