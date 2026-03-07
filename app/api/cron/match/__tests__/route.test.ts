import { NextRequest } from "next/server";
import { GET } from "../route";
import { createClient } from "@supabase/supabase-js";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { runMatchBatch } from "@/lib/aiMatcher";
import { fetchJobs } from "@/lib/jobFetcher";

// Mock env first to prevent validation failure on import
vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    GEMINI_API_KEY: "test-gemini-key",
    ADZUNA_APP_ID: "test-adzuna-id",
    ADZUNA_APP_KEY: "test-adzuna-key",
  },
}));

// Create a stable mock object for Supabase using vi.hoisted
const { mockSupabase } = vi.hoisted(() => {
  const mock = {
    from: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    filter: vi.fn(),
    limit: vi.fn(),
    // Make it thenable so 'await supabase.from().select()' works
    then: vi.fn(),
  };

  mock.from.mockReturnValue(mock);
  mock.select.mockReturnValue(mock);
  mock.insert.mockReturnValue(mock);
  mock.update.mockReturnValue(mock);
  mock.upsert.mockReturnValue(mock);
  mock.eq.mockReturnValue(mock);
  mock.single.mockReturnValue(mock);
  mock.filter.mockReturnValue(mock);
  mock.limit.mockReturnValue(mock);

  return { mockSupabase: mock };
});

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock matching and fetching
vi.mock("@/lib/aiMatcher", () => ({
  runMatchBatch: vi.fn(),
}));
vi.mock("@/lib/jobFetcher", () => ({
  fetchJobs: vi.fn(),
}));

describe("GET /api/cron/match", () => {
  const mockCronSecret = "test-secret";

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.CRON_SECRET = mockCronSecret;
    vi.setSystemTime(new Date("2024-03-09T06:00:00Z"));

    // Reset chains
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.upsert.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockReturnValue(mockSupabase);
    mockSupabase.filter.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockReturnValue(mockSupabase);

    // Default successful resolution
    mockSupabase.then.mockImplementation((onFulfilled) => {
      return Promise.resolve(onFulfilled({ data: [], error: null }));
    });

    // Mock match results
    (runMatchBatch as any).mockResolvedValue({
      matches: [],
      filtered_count: 0,
    });
    (fetchJobs as any).mockResolvedValue([]);
  });

  const createReq = (secret?: string) => {
    return new NextRequest("http://localhost/api/cron/match", {
      headers: {
        Authorization: secret ? `Bearer ${secret}` : "",
      },
    });
  };

  it("returns 401 if secret is missing or incorrect", async () => {
    const res1 = await GET(createReq());
    expect(res1.status).toBe(401);

    const res2 = await GET(createReq("wrong-secret"));
    expect(res2.status).toBe(401);
  });

  it("filters users by frequency (daily only on non-Mondays)", async () => {
    // Mock preferences
    mockSupabase.then.mockImplementationOnce((onFulfilled) =>
      onFulfilled({
        data: [
          { user_id: "user1", frequency: "daily" },
          { user_id: "user2", frequency: "weekly" },
        ],
        error: null,
      })
    );

    // Mock idempotency check (not found)
    mockSupabase.then.mockImplementationOnce((onFulfilled) =>
      onFulfilled({ data: [], error: null })
    );

    // Mock profile fetch
    mockSupabase.then.mockImplementationOnce((onFulfilled) =>
      onFulfilled({
        data: { user_id: "user1", target_role: "Engineer" },
        error: null,
      })
    );

    const res = await GET(createReq(mockCronSecret));
    const json = await res.json();

    expect(json.processed).toBe(1); // Only user1 (daily)
    expect(json.results[0].user_id).toBe("user1");
  });

  it("processes weekly users on Mondays", async () => {
    // Set time to a Monday
    vi.setSystemTime(new Date("2024-03-11T06:00:00Z"));

    mockSupabase.then.mockImplementationOnce((onFulfilled) =>
      onFulfilled({
        data: [
          { user_id: "user1", frequency: "daily" },
          { user_id: "user2", frequency: "weekly" },
        ],
        error: null,
      })
    );

    // Mock idempotency checks and profile fetches for both
    mockSupabase.then.mockImplementation((onFulfilled) =>
      onFulfilled({ data: [], error: null })
    );
    mockSupabase.then.mockImplementation((onFulfilled) =>
      onFulfilled({
        data: { user_id: "any", target_role: "Engineer" },
        error: null,
      })
    );

    const res = await GET(createReq(mockCronSecret));
    const json = await res.json();

    expect(json.processed).toBe(2);
  });

  it("implements idempotency (skips if already run today)", async () => {
    // 1st call for preferences
    mockSupabase.then.mockImplementationOnce((onFulfilled) =>
      onFulfilled({
        data: [{ user_id: "user1", frequency: "daily" }],
        error: null,
      })
    );

    // 2nd call for idempotency check (existing run found)
    mockSupabase.then.mockImplementationOnce((onFulfilled) =>
      onFulfilled({ data: [{ id: "existing-run" }], error: null })
    );

    const res = await GET(createReq(mockCronSecret));
    const json = await res.json();

    expect(json.results[0].status).toBe("skipped");
  });

  it("handles user-level errors without failing the whole run", async () => {
    mockSupabase.then.mockImplementation((onFulfilled) => {
      // This is trickier with then() global mock, but we can count calls
      return onFulfilled({ data: [], error: null });
    });

    // Special case for profile fail
    mockSupabase.single.mockReturnValue({
      then: (onFulfilled: any) =>
        onFulfilled({ data: null, error: new Error("Profile fail") }),
    });

    // Mock preferences to have 2 users
    mockSupabase.from.mockImplementationOnce(() => ({
      select: () => ({
        then: (onFulfilled: any) =>
          onFulfilled({
            data: [
              { user_id: "u1", frequency: "daily" },
              { user_id: "u2", frequency: "daily" },
            ],
            error: null,
          }),
      }),
    }));

    const res = await GET(createReq(mockCronSecret));
    const json = await res.json();

    expect(json.processed).toBe(2);
    expect(json.results[0].status).toBe("failed");
    expect(json.results[1].status).toBe("failed");
  });
});
