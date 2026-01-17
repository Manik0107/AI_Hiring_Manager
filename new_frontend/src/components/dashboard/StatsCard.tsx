import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  icon: LucideIcon;
}

export function StatsCard({ title, value, change, icon: Icon }: StatsCardProps) {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent-foreground" />
        </div>
        {change && (
          <span
            className={cn(
              "text-sm font-medium",
              change.value >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {change.value >= 0 ? "+" : ""}
            {change.value}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
        {change && (
          <p className="text-xs text-muted-foreground mt-0.5">{change.label}</p>
        )}
      </div>
    </div>
  );
}
