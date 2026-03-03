import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-[#0f172a]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-white/80 px-8 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#0ea5e9] to-[#10b981] text-sm font-extrabold text-white">
            B
          </div>
          <span className="font-mono text-lg font-bold tracking-tight">
            BestMatch
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/signin"
            className="text-sm font-medium text-[#475569] hover:text-[#0ea5e9]"
          >
            Sign In
          </Link>
          <Link href="/onboarding">
            <Button className="bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center px-4 pt-24 pb-32 text-center">
        {/* Hero Section */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-4 py-1.5 text-xs font-bold tracking-widest text-[#0ea5e9] uppercase">
          <CheckCircle2 className="h-3.5 w-3.5" />
          AI-Powered Job Matching
        </div>

        <h1 className="max-w-3xl text-5xl leading-[1.1] font-extrabold tracking-tight text-[#0f172a] sm:text-6xl">
          Upload your resume. <br />
          <span className="bg-linear-to-r from-[#0ea5e9] to-[#10b981] bg-clip-text text-transparent">
            We&apos;ll handle the rest.
          </span>
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#475569]">
          Our AI continuously scans thousands of job postings and delivers your
          best-matched roles straight to your inbox — daily or weekly.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/onboarding">
            <Button className="h-14 bg-linear-to-br from-[#0ea5e9] to-[#10b981] px-10 text-lg font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] hover:opacity-90 active:scale-95">
              Upload PDF Resume
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/signin">
            <Button
              variant="outline"
              className="h-14 border-[#cbd5e1] px-10 text-lg font-bold text-[#475569] hover:bg-white hover:text-[#0ea5e9]"
            >
              Returning User
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-32 grid w-full max-w-5xl grid-cols-1 gap-8 px-4 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-[#e2e8f0] bg-white p-8 transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">AI Parsing</h3>
            <p className="mt-2 text-sm text-[#475569]">
              We extract skills and experience from your PDF with high
              precision.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-[#e2e8f0] bg-white p-8 transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Smart Matching</h3>
            <p className="mt-2 text-sm text-[#475569]">
              Only get jobs that match your skills at least 70% or higher.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-[#e2e8f0] bg-white p-8 transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
              <span className="text-xl">📬</span>
            </div>
            <h3 className="text-lg font-bold">Magic Links</h3>
            <p className="mt-2 text-sm text-[#475569]">
              Secure, passwordless access to your match history and preferences.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-[#e2e8f0] bg-white py-12 text-center text-sm text-[#94a3b8]">
        <p>© 2026 BestMatch AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
