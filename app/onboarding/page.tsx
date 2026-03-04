"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ScanLine } from "@/components/features/ScanLine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, FileText, UploadCloud } from "lucide-react";
import { ResumeParseResult } from "@/lib/validations/resume";

export default function OnboardingPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [parsedData, setParsedData] = useState<ResumeParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be less than 10MB.");
      return;
    }

    setError(null);
    setScanning(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume");
      }

      setParsedData(data.data);
      setParsed(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during parsing.");
    } finally {
      setScanning(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleContinue = async () => {
    if (!email) {
      setError("Please enter your email to continue.");
      return;
    }
    setLoading(true);
    // Here we would trigger the magic link auth, preserving the parsed data.
    // Since issue #9 focuses strictly on the parser and UI feedback,
    // we simulate the success state or redirect to signin/dashboard.
    setTimeout(() => {
      router.push("/signin?email=" + encodeURIComponent(email));
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] px-4 font-sans text-[#0f172a]">
      <div className="mx-auto w-full max-w-2xl pt-16 pb-24 sm:pt-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-block rounded-full border border-[#0ea5e9]/25 bg-[#0ea5e9]/10 px-4 py-1.5 font-mono text-xs font-bold tracking-[2px] text-[#0ea5e9]">
            AI-POWERED JOB MATCHING
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[#0f172a] sm:text-5xl">
            Upload your resume. <br />
            <span className="bg-gradient-to-r from-[#0ea5e9] to-[#10b981] bg-clip-text text-transparent">
              We&apos;ll handle the rest.
            </span>
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-[#475569]">
            Our AI continuously scans thousands of job postings and delivers
            your best-matched roles straight to your inbox.
          </p>
        </div>

        {/* Upload / Status Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative h-[220px] overflow-hidden rounded-2xl border-2 transition-all ${
            dragOver
              ? "border-[#0ea5e9] bg-[#0ea5e9]/5 ring-4 ring-[#0ea5e9]/10"
              : scanning || parsed
                ? "border-transparent"
                : "border-dashed border-[#cbd5e1] bg-white hover:border-[#94a3b8]"
          }`}
        >
          {/* Default Upload State */}
          {!scanning && !parsed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#0ea5e9]/20 bg-[#0ea5e9]/10 text-[#0ea5e9]">
                <FileText className="h-7 w-7" />
              </div>
              <p className="text-base font-medium text-[#475569]">
                Drag & drop your PDF resume, or{" "}
                <label className="cursor-pointer font-semibold text-[#0ea5e9] hover:underline">
                  click to upload
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={onFileInput}
                  />
                </label>
              </p>
              <p className="mt-2 text-sm text-[#94a3b8]">
                PDF only · Max 10 MB
              </p>
            </div>
          )}

          {/* Scanning Animation */}
          {scanning && <ScanLine />}

          {/* Success State */}
          {!scanning && parsed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white">
              <CheckCircle2 className="mb-2 h-10 w-10 text-[#10b981]" />
              <div className="font-semibold text-[#10b981]">
                Successfully Parsed!
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Parsed Results Form */}
        {parsed && parsedData && (
          <div className="animate-in slide-in-from-top-4 fade-in mt-8 duration-500">
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 font-mono text-[11px] font-bold tracking-[1.5px] text-[#94a3b8]">
                AI EXTRACTION RESULTS
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="targetRole"
                    className="text-xs font-semibold text-[#475569]"
                  >
                    Target Role
                  </Label>
                  <Input
                    id="targetRole"
                    defaultValue={parsedData.targetRole}
                    className="h-11 bg-[#f8fafc]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[#475569]">
                    Detected Skills
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-[#0ea5e9]/20 bg-[#0ea5e9]/10 px-2.5 py-1 text-xs font-medium text-[#0ea5e9]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {parsedData.yearsOfExperience !== undefined && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#475569]">
                      Years of Experience
                    </Label>
                    <Input
                      readOnly
                      defaultValue={parsedData.yearsOfExperience}
                      className="h-11 w-24 bg-[#f8fafc]"
                    />
                  </div>
                )}

                <div className="my-6 h-px w-full bg-[#e2e8f0]" />

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold text-[#475569]"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-[#f8fafc]"
                  />
                </div>

                <Button
                  className="h-12 w-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-base font-bold shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
                  onClick={handleContinue}
                  disabled={loading}
                >
                  {loading
                    ? "Preparing matches..."
                    : "Start Receiving Matches →"}
                </Button>

                <p className="text-center text-sm text-[#94a3b8]">
                  Already have an account?{" "}
                  <button
                    onClick={() => router.push("/signin")}
                    className="font-semibold text-[#0ea5e9] hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
