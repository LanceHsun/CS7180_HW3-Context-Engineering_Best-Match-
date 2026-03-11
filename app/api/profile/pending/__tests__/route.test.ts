import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { createClient } from "@supabase/supabase-js";

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

// Mock matching dependencies
vi.mock("@/lib/aiMatcher", () => ({
  runMatchBatch: vi.fn().mockResolvedValue({ matches: [], filtered_count: 0 }),
}));

vi.mock("@/lib/jobFetcher", () => ({
  fetchJobs: vi.fn().mockResolvedValue([]),
}));

describe("POST /api/profile/pending", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  it("returns 500 if environment variables are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const req = new Request("http://localhost/api/profile/pending", {
      method: "POST",
      headers: {
        "x-forwarded-proto": "http",
        host: "localhost",
      },
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toContain("Missing database keys");
  });

  it("returns 400 on validation failure", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";

    const req = new Request("http://localhost/api/profile/pending", {
      method: "POST",
      headers: {
        "x-forwarded-proto": "http",
        host: "localhost",
      },
      body: JSON.stringify({ email: "invalid" }), // Missing required fields
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Validation failed");
  });

  it("maps experience level correctly for senior and returns loginUrl", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockListUsers = vi
      .fn()
      .mockResolvedValue({ data: { users: [] }, error: null });
    const mockCreateUser = vi.fn().mockResolvedValue({
      data: { user: { id: "new-user-id" } },
      error: null,
    });
    const mockGenerateLink = vi.fn().mockResolvedValue({
      data: { properties: { action_link: "http://login.url" } },
      error: null,
    });

    const mockSupabase = {
      auth: {
        admin: {
          listUsers: mockListUsers,
          createUser: mockCreateUser,
          generateLink: mockGenerateLink,
        },
      },
      from: vi.fn().mockReturnValue({ upsert: mockInsert }),
    };
    (createClient as any).mockReturnValue(mockSupabase);

    const data = {
      email: "test@example.com",
      targetRole: "Senior Engineer",
      skills: ["React"],
      yearsOfExperience: 10,
    };

    const req = new Request("https://test-origin.com/api/profile/pending", {
      method: "POST",
      headers: {
        "x-forwarded-proto": "https",
        host: "test-origin.com",
      },
      body: JSON.stringify(data),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.loginUrl).toBe("http://login.url");
    expect(mockGenerateLink).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          redirectTo: "https://test-origin.com/auth/callback?next=/dashboard",
        },
      })
    );
  });

  it("returns 400 if user already exists", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";

    const mockListUsers = vi.fn().mockResolvedValue({
      data: { users: [{ email: "test@example.com" }] },
      error: null,
    });

    const mockSupabase = {
      auth: {
        admin: {
          listUsers: mockListUsers,
        },
      },
    };
    (createClient as any).mockReturnValue(mockSupabase);

    const data = {
      email: "test@example.com",
      targetRole: "Engineer",
      skills: ["React"],
    };

    const req = new Request("http://localhost/api/profile/pending", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Account already exists");
  });

  it("returns 500 on Supabase error", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";

    const mockInsert = vi
      .fn()
      .mockResolvedValue({ error: { message: "DB Error" } });
    const mockListUsers = vi
      .fn()
      .mockResolvedValue({ data: { users: [] }, error: null });
    const mockCreateUser = vi.fn().mockResolvedValue({
      data: { user: { id: "new-user-id" } },
      error: null,
    });

    const mockSupabase = {
      auth: {
        admin: {
          listUsers: mockListUsers,
          createUser: mockCreateUser,
        },
      },
      from: vi.fn().mockReturnValue({ upsert: mockInsert }),
    };
    (createClient as any).mockReturnValue(mockSupabase);

    const data = {
      email: "test@example.com",
      targetRole: "Engineer",
      skills: ["React"],
      yearsOfExperience: 1,
    };

    const req = new Request("http://localhost/api/profile/pending", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Account created but profile sync failed");
  });
});
