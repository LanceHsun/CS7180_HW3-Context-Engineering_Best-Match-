import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../resume/parse/route";
import { ai } from "@/lib/ai";
import { ResumeParseSchema } from "@/lib/validations/resume";

// Mock pdf-parse
vi.mock("pdf-parse", () => {
  return {
    default: vi.fn().mockResolvedValue({ text: "Mock Resume Text" }),
  };
});

// Mock generative AI
vi.mock("@/lib/ai", () => ({
  ai: {
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              targetRole: "Software Engineer",
              skills: ["React", "TypeScript"],
              yearsOfExperience: 3,
            }),
        },
      }),
    }),
  },
}));

// Mock supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}));

describe("Resume Parse API (POST)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if no file is provided", async () => {
    const req = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: new FormData(),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("No file provided");
  });

  it("returns 400 if file is not a PDF", async () => {
    const formData = new FormData();
    formData.append(
      "file",
      new File(["test"], "test.txt", { type: "text/plain" })
    );
    const req = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("File must be a PDF");
  });

  it("successfully parses a valid PDF", async () => {
    const formData = new FormData();
    const pdfBlob = new Blob(["%PDF-1.4"], { type: "application/pdf" });
    formData.append("file", pdfBlob, "test.pdf");

    const req = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.targetRole).toBe("Software Engineer");
    expect(data.data.skills).toContain("React");
  });

  it("returns 500 if AI response is invalid JSON", async () => {
    vi.mocked(ai.getGenerativeModel).mockReturnValueOnce({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => "not a json",
        },
      }),
    } as any);

    const formData = new FormData();
    const pdfBlob = new Blob(["%PDF-1.4"], { type: "application/pdf" });
    formData.append("file", pdfBlob, "test.pdf");

    const req = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Invalid AI response format");
  });
});
