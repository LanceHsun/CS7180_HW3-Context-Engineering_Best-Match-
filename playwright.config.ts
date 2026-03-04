import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Temporarily disable console.log to prevent dotenv from spamming stdout
// This is important because Playwright's JSON reporter (if piped to a file) gets corrupted by these logs.
const originalConsoleLog = console.log;
console.log = () => {};
// Read from default ".env.local" file first to ensure user's real configs supersede mock values
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});
console.log = originalConsoleLog;

// Provide fallback environment variables for E2E tests so the server can boot.
// This allows the CI and fresh checkouts to pass `lib/env.ts` validation smoothly.
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_anon_key";
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "dummy_gemini_key";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
