"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/hooks/use-user";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "./score-badge";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { z } from "zod";

const matchSchema = z.object({
  id: z.string().uuid(),
  job_title: z.string(),
  company: z.string(),
  score: z.number().min(0).max(100),
  apply_url: z.string().url().nullable().or(z.string().length(0).nullable()),
  created_at: z.string(),
});

const matchesSchema = z.array(matchSchema);

type Match = z.infer<typeof matchSchema>;

export function MatchHistory() {
  const { user, isLoading: isUserLoading } = useUser();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const supabase = createClient();

  const fetchMatches = async () => {
    if (!user) {
      if (!isUserLoading) setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("matches")
        .select("id, job_title, company, score, apply_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching matches:", error);
      } else if (data) {
        // Strictly use Zod for schema validation across the entire stack
        const validatedData = matchesSchema.safeParse(data);
        if (validatedData.success) {
          setMatches(validatedData.data);
        } else {
          console.error("Match data validation failed:", validatedData.error);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching matches:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user, isUserLoading, supabase]);

  const handleSearchNow = async () => {
    if (isTriggering) return;
    setIsTriggering(true);

    try {
      const response = await fetch("/api/match/trigger", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to trigger search");
      }

      await fetchMatches();
    } catch (err: any) {
      console.error("Manual search error:", err);
      alert(`Search failed: ${err.message}`);
    } finally {
      setIsTriggering(false);
    }
  };

  if (isLoading || isUserLoading) {
    return <MatchHistorySkeleton />;
  }

  if (!user) return null;

  return (
    <Card className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-muted-foreground font-mono text-[11px] font-bold tracking-[1.5px] uppercase">
            MATCH HISTORY
          </div>
          <span className="text-[12px] font-medium text-slate-400">
            Last 5 delivered jobs
          </span>
        </div>
        <button
          onClick={handleSearchNow}
          disabled={isTriggering}
          className="flex h-9 items-center gap-2 rounded-lg bg-sky-500 px-4 text-[13px] font-semibold text-white transition-all hover:bg-sky-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isTriggering ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <span className="text-lg leading-none">✨</span>
              <span>Search Now</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-[1fr_160px_100px] px-3.5 pb-2 font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          <span>ROLE</span>
          <span>COMPANY</span>
          <span className="text-right">SCORE</span>
        </div>

        {matches.length > 0 ? (
          matches.map((match) => (
            <div
              key={match.id}
              className="group grid grid-cols-[1fr_160px_100px] items-center rounded-lg px-3.5 py-3 transition-colors hover:bg-sky-50"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {match.apply_url ? (
                  <Link
                    href={match.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-slate-900 transition-colors hover:text-sky-600"
                  >
                    {match.job_title}
                    <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </Link>
                ) : (
                  <span className="truncate text-[14px] font-semibold text-slate-900">
                    {match.job_title}
                  </span>
                )}
              </div>
              <span className="truncate text-[13px] text-slate-500">
                {match.company}
              </span>
              <div className="flex justify-end">
                <ScoreBadge score={match.score} />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-2 text-2xl">🔍</div>
            <p className="text-[14px] font-medium text-slate-500">
              No matches have been delivered yet.
            </p>
            <p className="mt-1 text-[12px] text-slate-400">
              We&apos;ll notify you as soon as we find a match!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function MatchHistorySkeleton() {
  return (
    <Card className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_160px_100px] px-3.5">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto h-3 w-10" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_160px_100px] items-center px-3.5 py-3"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <div className="flex justify-end">
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
