import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../health/route";
import { createClient } from "../../../lib/supabase/server";

vi.mock("../../../lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Health Check API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-gemini-key";
  });

  it("returns 200 OK when both DB and Gemini are healthy", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.database).toBe("ok");
    expect(data.data.gemini).toBe("ok");
  });

  it("returns 200 OK even if tables are empty (schema bare)", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ error: { code: "42P01" } }), // 42P01 is undefined_table
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("returns 503 SERVICE_UNAVAILABLE when DB throws a connection error", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        error: { code: "08000", message: "Connection failed" },
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("returns 503 SERVICE_UNAVAILABLE when Gemini API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ error: null }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("returns 500 on unexpected fatal exceptions", async () => {
    vi.mocked(createClient).mockRejectedValue(
      new Error("Fatal unhandled error")
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});
