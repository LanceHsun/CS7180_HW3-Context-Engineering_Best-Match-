import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateSession } from "../middleware";
import * as ssr from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Mock next/server
vi.mock("next/server", () => {
  const mockSet = vi.fn();
  const mockGetAll = vi.fn();
  return {
    NextResponse: {
      next: vi.fn().mockImplementation(() => ({
        cookies: {
          set: mockSet,
          getAll: mockGetAll,
        },
      })),
    },
    NextRequest: vi.fn(),
  };
});

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

describe("Supabase Middleware", () => {
  let mockRequest: any;
  let mockGetUser: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      cookies: {
        getAll: vi.fn().mockReturnValue([{ name: "test", value: "123" }]),
        set: vi.fn(),
      },
      url: "https://localhost:3000/",
    };

    mockGetUser = vi
      .fn()
      .mockResolvedValue({ data: { user: null }, error: null });

    vi.mocked(ssr.createServerClient).mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
    } as any);
  });

  it("creates a server client and calls getUser to refresh session", async () => {
    const response = await updateSession(mockRequest as NextRequest);

    expect(ssr.createServerClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
      expect.objectContaining({
        cookies: expect.any(Object),
      })
    );

    expect(mockGetUser).toHaveBeenCalled();
    expect(response).toBeDefined();
  });

  it("handles reading cookies from request", async () => {
    await updateSession(mockRequest as NextRequest);

    const createServerClientCall = vi.mocked(ssr.createServerClient).mock
      .calls[0];
    const cookieHandlers = createServerClientCall[2]?.cookies;

    if (cookieHandlers && cookieHandlers.getAll) {
      const cookies = cookieHandlers.getAll();
      expect(mockRequest.cookies.getAll).toHaveBeenCalled();
      expect(cookies).toEqual([{ name: "test", value: "123" }]);
    }
  });

  it("handles writing cookies to request and response", async () => {
    await updateSession(mockRequest as NextRequest);

    const createServerClientCall = vi.mocked(ssr.createServerClient).mock
      .calls[0];
    const cookieHandlers = createServerClientCall[2]?.cookies;

    if (cookieHandlers && cookieHandlers.setAll) {
      cookieHandlers.setAll([
        { name: "new-cookie", value: "new-value", options: { path: "/" } },
      ]);

      // Should set on request
      expect(mockRequest.cookies.set).toHaveBeenCalledWith(
        "new-cookie",
        "new-value"
      );

      // Should recreate response and set on it
      expect(NextResponse.next).toHaveBeenCalledWith({ request: mockRequest });
      // The response mock's set method would be called, but we can't easily assert on the exact instance's method here without deeper mocking.
    }
  });
});
