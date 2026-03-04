"use client";

import { useState, useRef } from "react";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine } from "./scan-line";
import { cn } from "@/lib/utils";

export function ResumeDropzone() {
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "scanning" | "success" | "error"
  >("idle");
  const [errorHeader, setErrorHeader] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateParse = (file: File) => {
    setStatus("scanning");
    setFileName(file.name);
    setTimeout(() => {
      setStatus("success");
    }, 2800);
  };

  const validateFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setStatus("error");
      setErrorHeader("PDF only");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus("error");
      setErrorHeader("Max 10 MB");
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      simulateParse(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      simulateParse(file);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (status === "idle" || status === "error") {
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "relative h-[190px] w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200",
          dragOver
            ? "border-sky-500 bg-sky-500/10 shadow-[0_0_0_4px_rgba(14,165,233,0.1)]"
            : status === "scanning" || status === "success"
              ? "cursor-default border-sky-500/30"
              : status === "error"
                ? "border-destructive bg-destructive/5"
                : "border-muted-foreground/30 hover:border-muted-foreground/50 bg-background"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-3.5"
            >
              <div className="flex h-13 w-13 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
                <FileText className="h-6 w-6 text-sky-500" />
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-medium">
                  Drag & drop your PDF resume, or{" "}
                  <span className="font-semibold text-sky-500 hover:underline">
                    click to upload
                  </span>
                </p>
                <p className="text-muted-foreground/60 mt-1 text-xs">
                  PDF only · Max 10 MB
                </p>
              </div>
            </motion.div>
          )}

          {status === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ScanLine />
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-center justify-center gap-2.5"
            >
              <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-2 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <p className="text-sm font-semibold text-emerald-600">
                Parsed — {fileName}
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex h-full flex-col items-center justify-center gap-3"
            >
              <div className="bg-destructive/10 text-destructive inline-flex items-center justify-center rounded-full p-2">
                <AlertCircle className="h-10 w-10" />
              </div>
              <div className="text-center">
                <p className="text-destructive text-sm font-semibold">
                  {errorHeader}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Please try again with a valid PDF file.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
