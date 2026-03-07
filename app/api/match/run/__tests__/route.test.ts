import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/match/run/route";
import { createClient } from "@/lib/supabase/server";
import { runMatchBatch } from "@/lib/aiMatcher";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock AI Matcher
vi.mock("@/lib/aiMatcher", () => ({
  runMatchBatch: vi.fn(),
}));

describe("POST /api/match/run", () => {
  const mockProfileId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
  const mockUserId = "user-123";
  const mockJobs = [
    {
      title: "Software Engineer",
      company: "Acme",
      description: "Code things",
      apply_url: "https://example.com",
      location: "Remote",
    },
  ];

  const mockProfileData = {
    id: mockProfileId,
    user_id: mockUserId,
    name: "John Doe",
    email: "john@example.com",
    skills: ["React"],
    experience_level: "Senior",
    target_role: "Frontend Engineer",
  };

  const mockBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
  };

  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => mockBuilder),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
    // Reset builder defaults
    mockBuilder.select.mockReturnThis();
    mockBuilder.eq.mockReturnThis();
    mockBuilder.single.mockReturnThis();
    mockBuilder.insert.mockReturnThis();
  });

  it("returns 401 if user is not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const req = new Request("http://localhost/api/match/run", {
      method: "POST",
      body: JSON.stringify({ profileId: mockProfileId, jobs: mockJobs }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it("returns 404 if profile is not found or doesn't belong to user", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });

    mockBuilder.single.mockResolvedValue({
      data: null,
      error: { message: "Not found" },
    });

    const req = new Request("http://localhost/api/match/run", {
      method: "POST",
      body: JSON.stringify({ profileId: mockProfileId, jobs: mockJobs }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(404);
  });

  it("successfully scores jobs and saves matches", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });

    // Mock profile fetch success
    mockBuilder.single.mockResolvedValueOnce({
      data: mockProfileData,
      error: null,
    });
    // Mock insert success
    mockBuilder.insert.mockResolvedValue({ error: null });

    // Mock match run results
    vi.mocked(runMatchBatch).mockResolvedValue({
      matches: [
        {
          job: mockJobs[0],
          score: 85,
          reasoning: "Great match",
        },
      ],
      filtered_count: 0,
    });

    const req = new Request("http://localhost/api/match/run", {
      method: "POST",
      body: JSON.stringify({ profileId: mockProfileId, jobs: mockJobs }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.matches).toHaveLength(1);
    expect(mockSupabase.from).toHaveBeenCalledWith("matches");
    expect(runMatchBatch).toHaveBeenCalled();
  });

  it("returns 400 for invalid request body", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });

    const req = new Request("http://localhost/api/match/run", {
      method: "POST",
      body: JSON.stringify({ profileId: "invalid-uuid", jobs: [] }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("returns success even if match persistence fails", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });

    mockBuilder.single.mockResolvedValueOnce({
      data: mockProfileData,
      error: null,
    });
    // Mock insert failure
    mockBuilder.insert.mockResolvedValue({
      error: { message: "DB Error" },
    });

    vi.mocked(runMatchBatch).mockResolvedValue({
      matches: [{ job: mockJobs[0], score: 85, reasoning: "Good" }],
      filtered_count: 0,
    });

    const req = new Request("http://localhost/api/match/run", {
      method: "POST",
      body: JSON.stringify({ profileId: mockProfileId, jobs: mockJobs }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
  });

  it("returns 500 on internal server error", async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error("Unexpected error"));

    const req = new Request("http://localhost/api/match/run", {
      method: "POST",
      body: JSON.stringify({ profileId: mockProfileId, jobs: mockJobs }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });

  it("handles missing profile fields with defaults", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId, email: null } },
      error: null,
    });

    mockBuilder.single.mockResolvedValueOnce({
      data: { id: mockProfileId, user_id: mockUserId }, // Missing name, skills, etc.
      error: null,
    });

    vi.mocked(runMatchBatch).mockResolvedValue({
      matches: [],
      filtered_count: 0,
    });

    const req = new Request("http://localhost/api/match/run", {
      method: "POST",
      body: JSON.stringify({ profileId: mockProfileId, jobs: mockJobs }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    // Verify runMatchBatch was called with "User" default
    expect(runMatchBatch).toHaveBeenCalledWith(
      expect.objectContaining({ name: "User", skills: [] }),
      expect.any(Array)
    );
  });

  it("handles error without message during matching", async () => {
    mockSupabase.auth.getUser.mockRejectedValue(
      "String error instead of Error object"
    );

    const req = new Request("http://localhost/api/match/run", {
      method: "POST",
      body: JSON.stringify({ profileId: mockProfileId, jobs: mockJobs }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.message).toBe(
      "An unexpected error occurred during matching"
    );
  });
});
