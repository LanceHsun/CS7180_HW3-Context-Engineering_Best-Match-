"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  // Score badges color-coded: green ≥ 90%, blue ≥ 80%, amber < 80%
  const getScoreStyles = (score: number) => {
    if (score >= 90) {
      return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
    }
    if (score >= 80) {
      return "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100";
    }
    return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100";
  };

  const getDotStyles = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 80) return "bg-sky-500";
    return "bg-amber-500";
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[12px] font-bold shadow-none transition-colors",
        getScoreStyles(score),
        className
      )}
    >
      <div className={cn("h-1.5 w-1.5 rounded-full", getDotStyles(score))} />
      {score}%
    </Badge>
  );
}
