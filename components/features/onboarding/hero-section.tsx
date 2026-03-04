"use client";

export function HeroSection() {
  return (
    <div className="mb-13 text-center">
      <div className="mb-5.5 inline-block rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 font-mono text-[11px] tracking-widest text-sky-500 uppercase">
        AI-Powered Job Matching
      </div>
      <h1 className="text-foreground mb-4 text-[44px] leading-[1.13] font-bold tracking-[-0.03em]">
        Upload your resume.
        <br />
        <span className="bg-linear-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
          We&apos;ll handle the rest.
        </span>
      </h1>
      <p className="text-muted-foreground mx-auto max-w-[460px] text-[17px] leading-relaxed">
        Our AI continuously scans thousands of job postings and delivers your
        best-matched roles straight to your inbox — daily or weekly.
      </p>
    </div>
  );
}
