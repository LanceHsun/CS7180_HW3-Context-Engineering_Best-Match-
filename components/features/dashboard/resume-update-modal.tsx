"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeDropzone } from "../onboarding/resume-dropzone";
import { Button } from "@/components/ui/button";

interface ResumeUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

export function ResumeUpdateModal({
  isOpen,
  onClose,
  onUpdateSuccess,
}: ResumeUpdateModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "scanning" | "success" | "error"
  >("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setStatus("success");
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    setIsUpdating(true);
    setStatus("scanning");
    setError(null);

    try {
      // 1. Parse Resume
      const formData = new FormData();
      formData.append("file", selectedFile);

      const parseRes = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const parseData = await parseRes.json();
      if (!parseRes.ok) {
        throw new Error(parseData.error || "Failed to parse resume");
      }

      // 2. Update Profile (Upsert)
      const updateRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseData.data),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) {
        throw new Error(updateData.error || "Failed to update profile");
      }

      setStatus("success");
      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      console.error("Update error:", err);
      const isQuotaError =
        err.message?.includes("429") ||
        err.message?.toLowerCase().includes("quota");
      const errorMessage = isQuotaError
        ? "AI Quota exceeded. Please wait about 60 seconds and try again."
        : err.message || "Failed to update resume.";

      setError(errorMessage);
      setStatus("error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleModalClose = () => {
    if (isUpdating) return;
    setSelectedFile(null);
    setStatus("idle");
    setFileName("");
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[440px] overflow-hidden rounded-[18px] border border-slate-200 bg-white p-7 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-slate-900">
                Update Resume
              </h3>
              <button
                onClick={handleModalClose}
                className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                disabled={isUpdating}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-5 text-[13px] leading-[1.55] text-slate-500">
              Upload a new PDF and our AI will re-extract your skills and target
              role automatically.
            </p>

            <div className="mb-5">
              <ResumeDropzone
                onFileSelected={handleFileSelected}
                status={status}
                fileName={fileName}
                error={error || undefined}
              />
            </div>

            {error && (
              <div className="animate-in fade-in slide-in-from-top-1 mb-5 rounded-[12px] border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-700">
                <div className="flex gap-2">
                  <span className="flex-shrink-0">⚠️</span>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-10 flex-1 border-slate-200 font-medium text-slate-600 hover:bg-slate-50"
                onClick={handleModalClose}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                className="h-10 flex-1 border-none bg-linear-to-br from-sky-500 to-emerald-500 font-bold text-white shadow-sm transition-all hover:from-sky-600 hover:to-emerald-600"
                onClick={handleConfirm}
                disabled={!selectedFile || isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Confirm Upload"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
