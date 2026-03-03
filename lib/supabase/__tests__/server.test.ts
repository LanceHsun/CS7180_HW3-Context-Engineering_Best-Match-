import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "../server";
import * as ssr from "@supabase/ssr";
import * as nextHeaders from "next/headers";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

// Mock @supabase/ssr
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("../../env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  },
}));

describe("Supabase Server Client", () => {
  let mockCookieStore: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock cookie store
    mockCookieStore = {
      getAll: vi.fn(),
      set: vi.fn(),
    };
    vi.mocked(nextHeaders.cookies).mockResolvedValue(mockCookieStore as any);
  });

  it("creates a client with the correct environment variables and cookie handlers", async () => {
    await createClient();

    expect(ssr.createServerClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
  });

  it("handles reading cookies", async () => {
    await createClient();

    const createServerClientCall = vi.mocked(ssr.createServerClient).mock
      .calls[0];
    const cookieHandlers = createServerClientCall[2]?.cookies;

    expect(cookieHandlers).toBeDefined();
    if (cookieHandlers) {
      cookieHandlers.getAll();
      expect(mockCookieStore.getAll).toHaveBeenCalled();
    }
  });

  it("handles writing cookies", async () => {
    await createClient();

    const createServerClientCall = vi.mocked(ssr.createServerClient).mock
      .calls[0];
    const cookieHandlers = createServerClientCall[2]?.cookies;

    expect(cookieHandlers).toBeDefined();
    if (cookieHandlers && cookieHandlers.setAll) {
      cookieHandlers.setAll([
        { name: "test-cookie", value: "test-value", options: { path: "/" } },
      ]);
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "test-cookie",
        "test-value",
        { path: "/" }
      );
    }
  });
});
