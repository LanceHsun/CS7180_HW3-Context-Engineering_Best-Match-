"use client";

import { motion } from "framer-motion";

export function ScanLine() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[10px]">
      <div className="absolute inset-0 rounded-[10px] bg-linear-to-br from-sky-100 to-emerald-50" />

      {/* Scanning Line */}
      <motion.div
        className="absolute right-0 left-0 h-0.5 bg-linear-to-r from-transparent via-sky-500 to-transparent shadow-[0_0_12px_rgba(14,165,233,0.5)]"
        animate={{
          top: ["8%", "84%", "8%"],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Grid Lines */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute right-0 left-0 h-px bg-sky-500/10"
          style={{ top: `${(i + 1) * 14}%` }}
        />
      ))}

      {/* Status Text and Pulse */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
        <div className="font-mono text-xs font-bold tracking-[0.2em] text-sky-500">
          PARSING RESUME
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-sky-500"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
