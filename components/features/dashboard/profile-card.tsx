"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { ResumeUpdateModal } from "./resume-update-modal";

interface Profile {
  id: string;
  target_role: string;
  skills: string[];
  experience_level?: string;
}

export function ProfileCard() {
  const { user, isLoading: isUserLoading } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTargetRole, setIsEditingTargetRole] = useState(false);
  const [editedTargetRole, setEditedTargetRole] = useState("");
  const [isSavingTargetRole, setIsSavingTargetRole] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const supabase = createClient();

  const fetchProfile = async () => {
    if (!user) {
      if (!isUserLoading) setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, target_role, skills, experience_level")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, isUserLoading]);

  useEffect(() => {
    if (profile?.target_role) {
      setEditedTargetRole(profile.target_role);
    }
  }, [profile]);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const handleUpdateResumeClick = () => {
    setIsModalOpen(true);
  };

  const handleTargetRoleSave = async () => {
    if (!profile || !user) return;
    if (editedTargetRole === profile.target_role) {
      setIsEditingTargetRole(false);
      return;
    }

    setIsSavingTargetRole(true);
    try {
      // Validate with Zod
      const schema = z.string().min(1, "Target role is required").max(100);
      const result = schema.safeParse(editedTargetRole);

      if (!result.success) {
        setUploadError(result.error.issues[0].message);
        setEditedTargetRole(profile.target_role);
        setIsSavingTargetRole(false);
        setIsEditingTargetRole(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ target_role: editedTargetRole })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating target role:", error);
        setUploadError("Failed to update target role");
      } else {
        setProfile({ ...profile, target_role: editedTargetRole });
        setShowSuccessMessage(true);
      }
    } catch (err) {
      console.error("Unexpected error updating target role:", err);
      setUploadError("Unexpected error updating target role");
    } finally {
      setIsSavingTargetRole(false);
      setIsEditingTargetRole(false);
    }
  };

  const handleUpdateSuccess = async () => {
    await fetchProfile();
  };

  if (isLoading || isUserLoading) {
    return (
      <Card className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <div className="mb-5 flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-[10px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <Card className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
      <ResumeUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateSuccess={handleUpdateSuccess}
      />

      <div className="mb-5 flex items-center justify-between">
        <div className="text-muted-foreground font-mono text-[11px] font-bold tracking-[1.5px] uppercase">
          MY PROFILE
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpdateResumeClick}
          disabled={isUpdating}
          className="h-8 border-slate-300 text-[12px] font-medium transition-all hover:bg-slate-50"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Resume"
          )}
        </Button>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-sky-200 bg-gradient-to-br from-sky-100 to-emerald-100 text-xl">
          👤
        </div>
        <div className="overflow-hidden">
          <div className="truncate text-[15px] font-semibold text-slate-900">
            {displayName}
          </div>
          <div className="truncate text-[12px] text-slate-500">
            {user.email}
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="text-destructive bg-destructive/5 border-destructive/10 animate-in fade-in slide-in-from-top-1 mb-4 rounded-lg border p-2.5 text-[12px]">
          {uploadError}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between font-sans text-[12px] font-medium text-slate-500">
            <span>Target Role</span>
            {showSuccessMessage && (
              <span className="animate-in fade-in slide-in-from-right-1 flex items-center gap-1 text-emerald-600">
                <Check className="h-3 w-3" />
                Updated
              </span>
            )}
          </div>
          {isEditingTargetRole ? (
            <div className="relative">
              <Input
                autoFocus
                value={editedTargetRole}
                onChange={(e) => setEditedTargetRole(e.target.value)}
                onBlur={handleTargetRoleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTargetRoleSave();
                  if (e.key === "Escape") {
                    setEditedTargetRole(profile?.target_role || "");
                    setIsEditingTargetRole(false);
                  }
                }}
                disabled={isSavingTargetRole}
                className="h-10 border-sky-200 bg-white text-[14px] text-slate-900 focus-visible:ring-sky-500"
              />
              {isSavingTargetRole && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => setIsEditingTargetRole(true)}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-[14px] text-slate-900 transition-colors hover:border-sky-200 hover:bg-white"
            >
              {profile?.target_role || (
                <span className="text-slate-400 italic">
                  No target role set
                </span>
              )}
              <span className="ml-2 text-[11px] text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
                (Click to edit)
              </span>
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 font-sans text-[12px] font-medium text-slate-500">
            Skills on File
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile?.skills && profile.skills.length > 0 ? (
              profile.skills.slice(0, 15).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="rounded-[6px] border border-sky-100/50 bg-sky-50 px-2.5 py-1 text-[12px] font-medium text-sky-600 shadow-none transition-colors hover:bg-sky-100"
                >
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-[12px] text-slate-400 italic">
                No skills listed
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
