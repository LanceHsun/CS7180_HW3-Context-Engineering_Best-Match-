import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gets a fallback base URL for the application.
 * Note: Use dynamic origin detection (request.url or window.location.origin)
 * for critical auth redirects whenever possible.
 */
export function getURL() {
  let url =
    (process?.env?.NEXT_PUBLIC_SITE_URL ??
      process?.env?.NEXT_PUBLIC_VERCEL_URL ??
      (typeof window !== "undefined" ? window.location.origin : "")) ||
    "http://localhost:3000";

  // Normalize URL
  url = url.replace(/\/+$/, "");
  url = url.includes("http") ? url : `https://${url}`;

  return url;
}
