import { describe, it, expect, vi } from "vitest";
import { createClient } from "../client";
import * as ssr from "@supabase/ssr";

// Mock the ssr functions
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(),
}));

vi.mock("../../env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  },
}));

describe("Supabase Browser Client", () => {
  it("creates a client with the correct environment variables", () => {
    createClient();
    expect(ssr.createBrowserClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key"
    );
  });
});
