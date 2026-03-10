import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

// Mock Supabase
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi
  .fn()
  .mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({
      data: {
        id: "profile-1",
        full_name: "Test User",
        email: "test@example.com",
        target_role: "Developer",
        locations: ["Remote"],
      },
      error: null,
    }),
  }),
});

const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: vi.fn().mockReturnValue({
      insert: mockInsert,
      update: mockUpdate,
      select: mockSelect,
      upsert: mockUpsert,
    }),
  })),
}));

// Mock fetchJobs
vi.mock("@/lib/jobFetcher", () => ({
  fetchJobs: vi.fn().mockResolvedValue([
    { title: "Job 1", company: "A", apply_url: "url1" },
    { title: "Job 2", company: "B", apply_url: "url2" },
    { title: "Job 3", company: "C", apply_url: "url3" },
    { title: "Job 4", company: "D", apply_url: "url4" },
    { title: "Job 5", company: "E", apply_url: "url5" },
    { title: "Job 6", company: "F", apply_url: "url6" },
    { title: "Job 7", company: "G", apply_url: "url7" },
    { title: "Job 8", company: "H", apply_url: "url8" },
    { title: "Job 9", company: "I", apply_url: "url9" },
    { title: "Job 10", company: "J", apply_url: "url10" },
    { title: "Job 11", company: "K", apply_url: "url11" }, // Should be sliced out
  ]),
}));

// Mock aiMatcher
vi.mock("@/lib/aiMatcher", () => ({
  runMatchBatch: vi.fn().mockResolvedValue({
    matches: [
      {
        score: 90,
        job: { title: "Job 1", company: "A", apply_url: "url1" },
        reasoning: "Good match",
      },
    ],
    filtered_count: 4,
  }),
}));

// Mock email
vi.mock("@/lib/email", () => ({
  sendJobDigest: vi.fn().mockResolvedValue({ success: true }),
}));

describe("POST /api/match/trigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "Auth Error" },
    });
    const req = new NextRequest("http://localhost:3000/api/match/trigger", {
      method: "POST",
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("should execute the match pipeline and return 200 on success", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-1", email: "test@example.com" } },
      error: null,
    });
    const req = new NextRequest("http://localhost:3000/api/match/trigger", {
      method: "POST",
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.matches).toHaveLength(1);

    // Verify it sliced the jobs to 10
    const { runMatchBatch } = await import("@/lib/aiMatcher");
    expect(runMatchBatch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ length: 10 }) // Verify that only 10 jobs were passed to matcher
    );

    // Verify it updated the DB
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        email_status: "success",
        status: "completed",
      })
    );
  });
});
