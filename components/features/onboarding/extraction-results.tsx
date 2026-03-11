"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeParseResult } from "@/lib/validations/resume";

interface ExtractionResultsProps {
  parsedData: ResumeParseResult | null;
  onComplete: () => void;
}

export function ExtractionResults({
  parsedData,
  onComplete: _onComplete,
}: ExtractionResultsProps) {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const skills = parsedData?.skills || [];
  const targetRole = parsedData?.targetRole || "Software Engineer";

  const handleStartMatches = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Call the pending profile API
      const res = await fetch("/api/profile/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          targetRole,
          skills,
          yearsOfExperience: parsedData?.yearsOfExperience,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }

      // 2. Show success state and redirect
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = `/signin?message=signup_success&email=${encodeURIComponent(
          email
        )}`;
      }, 3000);
    } catch (err: any) {
      console.error("Profile save error:", err);
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative mt-8 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8"
    >
      {/* Success Overlay */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 p-6 text-center backdrop-blur-sm"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-[#0f172a]">Profile Created!</h3>
          <p className="mt-2 text-sm text-[#475569]">
            We&apos;ve started finding job matches for you.
            <br />
            Check your email to sign in and see them!
          </p>
          <p className="mt-4 text-[11px] font-medium tracking-wider text-[#94a3b8] uppercase">
            Redirecting to login...
          </p>
        </motion.div>
      )}
      <div className="mb-6">
        <h2 className="font-mono text-[11px] font-bold tracking-[1.5px] text-[#94a3b8] uppercase">
          AI Extraction Results
        </h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#475569]">
            Target Role
          </label>
          <input
            id="targetRole"
            type="text"
            defaultValue={targetRole}
            readOnly
            className="h-11 w-full rounded-lg border-none bg-[#f8fafc] px-4 text-sm font-medium text-[#0f172a] focus:ring-2 focus:ring-[#0ea5e9]/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#475569]">
            Detected Skills
          </label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-[#0ea5e9]/20 bg-[#0ea5e9]/10 px-2.5 py-1 text-xs font-medium text-[#0ea5e9]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="my-6 h-px w-full bg-[#e2e8f0]" />

        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#475569]">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm transition-all focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-center text-xs font-medium text-red-500">
            {error}
          </p>
        )}

        <button
          onClick={handleStartMatches}
          disabled={loading || !email}
          className={cn(
            "relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
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

        <p className="text-center text-xs text-[#94a3b8]">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </motion.div>
  );
}
