import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

// Mock Next.js routing
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: string) => ({
      status: 307,
      headers: new Headers({ Location: url }),
    }),
  },
}));

// Use vi.hoisted to safely share mock state with vi.mock factories
const mocks = vi.hoisted(() => {
  return {
    mockExchangeCode: vi.fn(),
    mockGetUser: vi.fn(),
    mockSelect: vi.fn(),
    mockEq: vi.fn(),
    mockSingle: vi.fn(),
    mockUpsert: vi.fn(),
    mockDelete: vi.fn(),
    mockClientFrom: vi.fn(),
    mockAdminClientFrom: vi.fn(),
  };
});

// Re-export for ease of use in tests
export const {
  mockExchangeCode,
  mockGetUser,
  mockSelect,
  mockEq,
  mockSingle,
  mockUpsert,
  mockDelete,
  mockClientFrom,
  mockAdminClientFrom,
} = mocks;

// Recreate the wrappers for the test assertions to use, avoiding hoisting issues.
export const mockClient = {
  from: mockClientFrom,
  auth: { exchangeCodeForSession: mockExchangeCode, getUser: mockGetUser },
};
export const mockAdminClient = {
  from: mockAdminClientFrom,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mocks.mockExchangeCode,
      getUser: mocks.mockGetUser,
    },
    from: mocks.mockClientFrom.mockImplementation(() => ({
      upsert: mocks.mockUpsert,
    })),
  })),
}));

// We must use dynamic mock factory for the admin client import since route uses await import()
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: mocks.mockAdminClientFrom.mockImplementation(() => ({
      select: mocks.mockSelect,
      delete: mocks.mockDelete,
    })),
  })),
}));

describe("Auth Callback Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://test-url.com";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-admin-key";
  });

  it("should successfully sync a pending profile into the main profiles table and delete it", async () => {
    // Setup happy path mocks
    mockExchangeCode.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@domain.com" } },
    });

    // Admin pending select
    mockAdminClient.from.mockReturnValueOnce({ select: mockSelect } as any);
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ maybeSingle: mockSingle });
    mockSingle.mockResolvedValue({
      data: {
        target_role: "Designer",
        skills: ["Figma"],
        experience_level: "senior",
      },
      error: null,
    });

    // Main profile upsert
    mockClient.from.mockReturnValueOnce({ upsert: mockUpsert } as any);
    mockUpsert.mockResolvedValue({ error: null });

    // Admin pending delete
    mockAdminClient.from.mockReturnValueOnce({ delete: mockDelete } as any);
    mockDelete.mockReturnValue({ eq: vi.fn() });

    const req = new Request(
      "http://localhost/auth/callback?code=123&next=/dashboard",
      {
        headers: new Headers(),
      }
    ) as any;

    await GET(req);

    // Assertions
    expect(mockExchangeCode).toHaveBeenCalledWith("123");

    // Ensure we upserted to the main profile
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        target_role: "Designer",
        skills: ["Figma"],
        experience_level: "senior",
      },
      { onConflict: "user_id" }
    );

    // Ensure we deleted the pending record
    expect(mockAdminClient.from).toHaveBeenCalledWith("pending_profiles");
    expect(mockDelete).toHaveBeenCalled();
  });

  it("should continue gracefully if the sync upsert fails (simulating DB error requested by user)", async () => {
    // Setup failing upsert
    mockExchangeCode.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "test@domain.com" } },
    });

    mockAdminClient.from.mockReturnValueOnce({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ maybeSingle: mockSingle });
    mockSingle.mockResolvedValue({
      data: { target_role: "Designer", skills: [] },
      error: null,
    });

    // SIMULATE UPSERT FAILURE
    mockClient.from.mockReturnValueOnce({ upsert: mockUpsert });
    mockUpsert.mockResolvedValue({
      error: new Error("DB Constraint Violated"),
    });

    // Admin pending delete should NOT be called
    mockAdminClient.from.mockReturnValueOnce({ delete: mockDelete } as any);
    const deleteEqMock = vi.fn();
    mockDelete.mockReturnValue({ eq: deleteEqMock });

    const req = new Request(
      "http://localhost/auth/callback?code=123&next=/dashboard",
      {
        headers: new Headers(),
      }
    ) as any;

    const res = await GET(req);

    // We still redirect successfully, we don't block the user's login because of a profile sync failure
    expect(res.status).toBe(307);

    // Ensure it attempted the upsert
    expect(mockUpsert).toHaveBeenCalled();

    // CRITICAL: Ensure `delete` is NEVER called if the upsert failed, preserving their data for next retry
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
