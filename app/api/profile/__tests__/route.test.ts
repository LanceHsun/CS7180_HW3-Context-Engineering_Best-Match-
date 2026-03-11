import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as pendingPost } from "../pending/route";
import { POST, GET } from "../route";

// Use vi.hoisted to safely share mock state with vi.mock factories
const mocks = vi.hoisted(() => {
  return {
    mockUpsert: vi.fn(),
    mockInsert: vi.fn(),
    mockDelete: vi.fn(),
    mockSelect: vi.fn(),
    mockEq: vi.fn(),
    mockSingle: vi.fn(),
    mockGetUser: vi.fn(),
    mockListUsers: vi.fn(),
    mockCreateUser: vi.fn(),
    mockGenerateLink: vi.fn(),
  };
});

// Mock environment validation
vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "http://test-url.com",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  },
  isEnvValid: vi.fn().mockReturnValue({ valid: true, errors: null }),
}));

import { isEnvValid } from "@/lib/env";

// Mock matching dependencies
vi.mock("@/lib/aiMatcher", () => ({
  runMatchBatch: vi.fn().mockResolvedValue({ matches: [], filtered_count: 0 }),
}));

vi.mock("@/lib/jobFetcher", () => ({
  fetchJobs: vi.fn().mockResolvedValue([]),
}));

// Re-export for ease of use in tests
export const {
  mockUpsert,
  mockInsert,
  mockDelete,
  mockSelect,
  mockEq,
  mockSingle,
  mockGetUser,
  mockListUsers,
  mockCreateUser,
  mockGenerateLink,
} = mocks;

// Mock both local and @supabase/supabase-js clients identical for test scope
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mocks.mockGetUser,
      admin: {
        listUsers: mocks.mockListUsers,
        createUser: mocks.mockCreateUser,
        generateLink: mocks.mockGenerateLink,
      },
    },
    from: vi.fn(() => ({
      upsert: mocks.mockUpsert,
      insert: mocks.mockInsert,
      select: mocks.mockSelect,
      delete: mocks.mockDelete,
    })),
  })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mocks.mockGetUser,
      admin: {
        listUsers: mocks.mockListUsers,
        createUser: mocks.mockCreateUser,
        generateLink: mocks.mockGenerateLink,
      },
    },
    from: vi.fn(() => ({
      upsert: mocks.mockUpsert,
      insert: mocks.mockInsert,
      select: mocks.mockSelect,
      delete: mocks.mockDelete,
    })),
  })),
}));

describe("Profile APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://test-url.com";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-admin-key";
    (isEnvValid as any).mockReturnValue({ valid: true, errors: null });
  });

  describe("POST /api/profile/pending - Unauthenticated Drop-Box", () => {
    it("should successfully create user and profile", async () => {
      mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
      mockCreateUser.mockResolvedValue({
        data: { user: { id: "new-user-123" } },
        error: null,
      });
      mockUpsert.mockResolvedValue({ error: null });
      mockGenerateLink.mockResolvedValue({
        data: { properties: { action_link: "http://login.url" } },
        error: null,
      });

      const req = new Request("http://localhost/api/profile/pending", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          targetRole: "Developer",
          skills: ["React", "Typescript"],
          yearsOfExperience: 5,
        }),
      });

      const res: any = await pendingPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.userId).toBe("new-user-123");

      expect(mockUpsert).toHaveBeenCalledWith(
        {
          user_id: "new-user-123",
          target_role: "Developer",
          skills: ["React", "Typescript"],
          experience_level: "mid",
        },
        { onConflict: "user_id" }
      );
    });

    it("should return 500 if the profile creation fails", async () => {
      mockListUsers.mockResolvedValue({ data: { users: [] }, error: null });
      mockCreateUser.mockResolvedValue({
        data: { user: { id: "new-user-123" } },
        error: null,
      });
      mockUpsert.mockResolvedValue({
        error: { message: "Database connection failed" },
      });

      const req = new Request("http://localhost/api/profile/pending", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          targetRole: "Developer",
          skills: ["React"],
        }),
      });

      const res: any = await pendingPost(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Account created but profile sync failed");
    });

    it("should return 400 for structural invalid data", async () => {
      const req = new Request("http://localhost/api/profile/pending", {
        method: "POST",
        body: JSON.stringify({
          email: "invalid-email", // Failed zod validation
          targetRole: "Developer",
          skills: ["React"],
        }),
      });

      const res: any = await pendingPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
    });
  });

  describe("POST /api/profile - Authenticated App Sync", () => {
    it("should return 401 Unauthorized if no user is found", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: new Error("No session"),
      });
      const req = new Request("http://localhost/api/profile", {
        method: "POST",
        body: "{}",
      });

      const res: any = await POST(req);
      expect(res.status).toBe(401);
    });

    it("should upsert the authenticated users profile successfully", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      mockUpsert.mockResolvedValue({ error: null });

      const req = new Request("http://localhost/api/profile", {
        method: "POST",
        body: JSON.stringify({
          targetRole: "Senior Engineer",
          skills: ["Go", "AWS"],
          yearsOfExperience: 10,
        }),
      });

      const res: any = await POST(req);
      expect(res.status).toBe(200);

      expect(mockUpsert).toHaveBeenCalledWith(
        {
          user_id: "user-123",
          target_role: "Senior Engineer",
          skills: ["Go", "AWS"],
          experience_level: "senior",
        },
        { onConflict: "user_id" }
      );
    });

    it("should return 400 for structural invalid data", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      const req = new Request("http://localhost/api/profile", {
        method: "POST",
        body: JSON.stringify({
          targetRole: 123, // Invalid type
        }),
      });

      const res: any = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should return 500 if the profile upsert fails", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      mockUpsert.mockResolvedValue({ error: new Error("Upsert Error") });

      const req = new Request("http://localhost/api/profile", {
        method: "POST",
        body: JSON.stringify({
          targetRole: "Developer",
          skills: ["React"],
        }),
      });

      const res: any = await POST(req);
      expect(res.status).toBe(500);
    });

    it("should return 500 on unexpected exceptions", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      // Force an exception by passing malformed JSON that will throw before zod parsing
      const req = new Request("http://localhost/api/profile", {
        method: "POST",
        body: "invalid-json", // This causes req.json() to throw
      });

      const res: any = await POST(req);
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/profile - Fetch Profile", () => {
    it("should fetch the users profile", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({
        data: { target_role: "Dev", skills: [] },
        error: null,
      });

      const res: any = await GET();

      expect(res.status).toBe(200);
      const result = await res.json();
      expect(result.data.target_role).toBe("Dev");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("should return null profile info for new users with PGRST116 error", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "No rows found" },
      });

      const res: any = await GET();

      expect(res.status).toBe(200);
      const result = await res.json();
      expect(result.data).toBeNull();
    });

    it("should return 500 on generic database failure", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: "Internal DB Error" },
      });

      const res: any = await GET();

      expect(res.status).toBe(500);
    });

    it("should return 500 on unexpected exceptions during GET", async () => {
      // Throwing directly from the mock to trigger the outer catch
      mockGetUser.mockRejectedValue(new Error("Unexpected system failure"));

      const res: any = await GET();

      expect(res.status).toBe(500);
    });
  });
});
