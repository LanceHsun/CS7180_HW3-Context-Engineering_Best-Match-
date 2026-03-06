"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Frequency = "daily" | "weekly";

interface Preferences {
  frequency: Frequency;
  locations: string[];
}

export function PreferencesCard() {
  const { user, isLoading: isUserLoading } = useUser();
  const [preferences, setPreferences] = useState<Preferences>({
    frequency: "daily",
    locations: [],
  });
  const [newLocation, setNewLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) {
        if (!isUserLoading) setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("preferences")
          .select("frequency, locations")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching preferences:", error);
        } else if (data) {
          setPreferences({
            frequency: (data.frequency as Frequency) || "daily",
            locations: data.locations || [],
          });
        }
      } catch (err) {
        console.error("Unexpected error fetching preferences:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [user, isUserLoading]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const { error } = await supabase.from("preferences").upsert({
        user_id: user.id,
        frequency: preferences.frequency,
        locations: preferences.locations,
      });

      if (error) {
        console.error("Error saving preferences:", error);
        setError("Failed to save preferences. Please try again.");
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Unexpected error saving preferences:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const addLocation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newLocation.trim()) {
      e.preventDefault();
      const trimmed = newLocation.trim();
      if (!preferences.locations.includes(trimmed)) {
        setPreferences((prev) => ({
          ...prev,
          locations: [...prev.locations, trimmed],
        }));
      }
      setNewLocation("");
    }
  };

  const removeLocation = (locToRemove: string) => {
    setPreferences((prev) => ({
      ...prev,
      locations: prev.locations.filter((loc) => loc !== locToRemove),
    }));
  };

  if (isLoading || isUserLoading) {
    return (
      <Card className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </Card>
    );
  }

  if (!user) return null;

  return (
    <Card className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="text-muted-foreground font-mono text-[11px] font-bold tracking-[1.5px] uppercase">
          PREFERENCES
        </div>
      </div>

      <div className="space-y-6">
        {/* Digest Frequency */}
        <div>
          <label className="mb-2.5 block text-[12px] font-medium text-slate-500">
            Digest Frequency
          </label>
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(["daily", "weekly"] as const).map((freq) => (
              <button
                key={freq}
                onClick={() =>
                  setPreferences((prev) => ({ ...prev, frequency: freq }))
                }
                className={cn(
                  "flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200",
                  preferences.frequency === freq
                    ? "border border-slate-200 bg-white text-sky-600 shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                )}
              >
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Location Filters */}
        <div>
          <label className="mb-2.5 block text-[12px] font-medium text-slate-500">
            Location Filters
          </label>
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            <AnimatePresence>
              {preferences.locations.map((loc) => (
                <motion.span
                  key={loc}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50/50 px-2.5 py-1 text-[12px] font-medium text-indigo-600"
                >
                  {loc}
                  <button
                    onClick={() => removeLocation(loc)}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-indigo-100/50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            {preferences.locations.length === 0 && (
              <span className="text-[12px] text-slate-400 italic">
                No locations added
              </span>
            )}
          </div>
          <Input
            placeholder="Add location, press Enter…"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyDown={addLocation}
            className="h-10 border-slate-200 bg-slate-50/50 text-[13px] focus-visible:ring-sky-500/20"
          />
        </div>

        {error && (
          <div className="text-destructive bg-destructive/5 border-destructive/10 animate-in fade-in slide-in-from-top-1 rounded-lg border p-2.5 text-[12px]">
            {error}
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "h-11 w-full text-[14px] font-bold tracking-tight transition-all active:scale-[0.98]",
            saveSuccess
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-md shadow-sky-200/50 hover:from-sky-600 hover:to-sky-700"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Preferences Saved!
            </motion.div>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </Card>
  );
}
