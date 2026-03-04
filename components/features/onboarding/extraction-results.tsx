"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtractionResultsProps {
  onComplete: () => void;
}

export function ExtractionResults({ onComplete }: ExtractionResultsProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const skills = [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "AWS",
    "PostgreSQL",
    "REST API",
    "Agile",
  ];

  const handleStartMatches = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Set mock user cookie for prototype bypass
      document.cookie = `sb-mock-user=${encodeURIComponent(email)}; path=/; max-age=3600`;
      setLoading(false);
      onComplete();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="border-border bg-card mt-8 overflow-hidden rounded-2xl border p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-muted-foreground font-mono text-[11px] font-bold tracking-[0.15em] uppercase">
          AI Extraction Results
        </h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-muted-foreground mb-2 block text-xs font-semibold">
            Target Role
          </label>
          <input
            type="text"
            defaultValue="Senior Software Engineer"
            className="border-input bg-muted/30 w-full rounded-lg border px-3.5 py-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-3 block text-xs font-semibold">
            Detected Skills
          </label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-md border border-sky-500/10 bg-sky-500/5 px-2.5 py-1 text-xs font-medium text-sky-600"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-border/60 h-px" />

        <div>
          <label className="text-muted-foreground mb-2 block text-xs font-semibold">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-input bg-muted/30 w-full rounded-lg border px-3.5 py-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleStartMatches}
          disabled={loading || !email}
          className={cn(
            "relative w-full overflow-hidden rounded-lg bg-linear-to-r from-sky-500 to-emerald-500 py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
            loading && "cursor-wait"
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Creating your profile...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Start Receiving Matches
              <Check className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
