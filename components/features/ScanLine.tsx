"use client";

import { motion } from "framer-motion";

const C = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  borderMd: "#cbd5e1",
  text: "#0f172a",
  textSub: "#475569",
  textMuted: "#94a3b8",
  accent: "#0ea5e9",
  green: "#10b981",
  greenBg: "rgba(16,185,129,0.08)",
  greenBdr: "rgba(16,185,129,0.25)",
  blueBg: "rgba(14,165,233,0.08)",
  blueBdr: "rgba(14,165,233,0.25)",
  amber: "#f59e0b",
};

export function ScanLine() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#e0f2fe] to-[#f0fdf4]" />
      <motion.div
        animate={{ top: ["8%", "84%", "8%"] }}
        transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
        className="absolute right-0 left-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg,transparent,${C.accent},transparent)`,
          boxShadow: `0 0 12px ${C.accent}88`,
        }}
      />
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute right-0 left-0 h-[1px]"
          style={{
            top: `${(i + 1) * 14}%`,
            background: "rgba(14,165,233,0.12)",
          }}
        />
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="font-mono text-[12px] font-bold tracking-[2px] text-[#0ea5e9]">
          PARSING RESUME
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.2,
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="h-[7px] w-[7px] rounded-full bg-[#0ea5e9]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
