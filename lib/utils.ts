import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gets the base URL for the application.
 * Priority: NEXT_PUBLIC_SITE_URL > NEXT_PUBLIC_VERCEL_URL > window.location.origin > localhost:3000
 */
export function getURL() {
  let url =
    (process?.env?.NEXT_PUBLIC_SITE_URL ??
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
      (typeof window !== "undefined" ? window.location.origin : "")) ||
    "http://localhost:3000/";

  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith("/") ? url : `${url}/`;

  return url;
}
