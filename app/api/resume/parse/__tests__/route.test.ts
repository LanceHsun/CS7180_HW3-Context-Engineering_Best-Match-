import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";
import { ai } from "@/lib/ai";
import * as supabaseServer from "@/lib/supabase/server";

// Mock pdf-parse
vi.mock("pdf-parse", () => {
  return {
    default: vi.fn(),
  };
});

// Mock generative AI
vi.mock("@/lib/ai", () => ({
  ai: {
    getGenerativeModel: vi.fn(),
  },
}));

// Mock Supabase Server
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("POST /api/resume/parse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if no file is provided", async () => {
    const formData = new FormData();
    const mockRequest = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe("No file provided");
  });

  it("returns 400 if file is not a PDF", async () => {
    const formData = new FormData();
    formData.append(
      "file",
      new File(["test data"], "test.txt", { type: "text/plain" })
    );

    const mockRequest = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe("File must be a PDF");
  });

  it("returns 200 and parsed data on success", async () => {
    // Mock pdf-parse module dynamic import
    vi.mock("pdf-parse", async () => ({
      default: vi.fn().mockResolvedValue({
        text: "Software Engineer with 5 years experience.",
      }),
    }));

    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            targetRole: "Software Engineer",
            skills: ["React", "TypeScript"],
            yearsOfExperience: 5,
          }),
      },
    });

    (ai.getGenerativeModel as any).mockReturnValue({
      generateContent: mockGenerateContent,
    });

    // Mock createClient
    const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
    const mockSupabase = {
      auth: { getUser: mockGetUser },
    };
    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase);

    const formData = new FormData();
    formData.append(
      "file",
      new File(["%PDF-1.4 mock content"], "test.pdf", {
        type: "application/pdf",
      })
    );

    const mockRequest = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.targetRole).toBe("Software Engineer");
    expect(json.data.skills).toEqual(["React", "TypeScript"]);
  });
});
