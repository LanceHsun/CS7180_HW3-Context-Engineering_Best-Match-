import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gets the base URL for the application.
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (Manual override)
 * 2. NEXT_PUBLIC_VERCEL_URL (Automatic Vercel deployment URL)
 * 3. window.location.origin (Client-side fallback)
 * 4. http://localhost:3000 (Development fallback)
 */
export function getURL() {
  let url =
    (process?.env?.NEXT_PUBLIC_SITE_URL ??
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
      (typeof window !== "undefined" ? window.location.origin : "")) ||
    "http://localhost:3000";

  // Normalize URL: remove trailing slash and ensure protocol
  url = url.replace(/\/+$/, ""); // Remove trailing slashes
  url = url.includes("http") ? url : `https://${url}`;

  return url;
}
