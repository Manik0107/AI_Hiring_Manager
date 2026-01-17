import { cn } from "@/lib/utils";
import { Sparkles, User } from "lucide-react";

interface ChatMessageProps {
  role: "ai" | "user";
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        role === "user" && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          role === "ai"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {role === "ai" ? (
          <Sparkles className="w-5 h-5" />
        ) : (
          <User className="w-5 h-5" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-5 py-3",
          role === "ai"
            ? "bg-muted text-foreground rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        )}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        {timestamp && (
          <p
            className={cn(
              "text-xs mt-1",
              role === "ai" ? "text-muted-foreground" : "text-primary-foreground/70"
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
