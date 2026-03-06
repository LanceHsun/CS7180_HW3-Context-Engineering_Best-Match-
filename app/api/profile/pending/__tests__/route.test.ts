import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
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
      body: JSON.stringify({ email: "invalid" }), // Missing required fields
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Validation failed");
  });

  it("maps experience level correctly for senior", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";

    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
    };
    (createClient as any).mockReturnValue(mockSupabase);

    const data = {
      email: "test@example.com",
      targetRole: "Senior Engineer",
      skills: ["React"],
      yearsOfExperience: 10,
    };

    const req = new Request("http://localhost/api/profile/pending", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ experience_level: "senior" }),
      { onConflict: "email" }
    );
  });

  it("maps experience level correctly for mid", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";

    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
    };
    (createClient as any).mockReturnValue(mockSupabase);

    const data = {
      email: "test@example.com",
      targetRole: "Staff Engineer",
      skills: ["React"],
      yearsOfExperience: 5,
    };

    const req = new Request("http://localhost/api/profile/pending", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ experience_level: "mid" }),
      { onConflict: "email" }
    );
  });

  it("returns 500 on Supabase error", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";

    const mockUpsert = vi
      .fn()
      .mockResolvedValue({ error: { message: "DB Error" } });
    const mockSupabase = {
      from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
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
    expect(json.error).toBe("Failed to securely save pending profile");
  });
});
