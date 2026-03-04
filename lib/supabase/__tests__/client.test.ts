import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createClient } from "../client";
import * as ssr from "@supabase/ssr";

// Mock the ssr functions
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(),
}));

describe("Supabase Browser Client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("creates a client with the correct environment variables", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    createClient();
    expect(ssr.createBrowserClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key"
    );
  });
});
