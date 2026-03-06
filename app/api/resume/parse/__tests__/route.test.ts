import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";
import { ai } from "@/lib/ai";
import * as supabaseServer from "@/lib/supabase/server";

// Mock pdf2json
vi.mock("pdf2json", () => {
  class MockPDFParser {
    on(event: string, callback: any) {
      if (event === "pdfParser_dataReady") {
        callback();
      }
      return this;
    }
    parseBuffer() {}
    getRawTextContent() {
      return "Software Engineer with 5 years experience.";
    }
  }
  return { default: MockPDFParser };
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

    const minimalPDF = Buffer.from(
      "JVBERi0xLjcKCjEgMCBvYmogICUKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogICUKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqICAlCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCgogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmogICUKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlCjw8CiAgL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKMTUgVEQKKEYxKSAyNCBUZgooSGVsbG8gV29ybGQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNiAwMDAwMCBuIAowMDAwMDAwMDg4IDAwMDAwIG4gCjAwMDAwMDAxODYgMDAwMDAgbiAKMDAwMDAwMDMzNiAwMDAwMCBuIAowMDAwMDAwNDM5IDAwMDAwIG4gCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjUzNAolJUVPRgo=",
      "base64"
    );
    const formData = new FormData();
    formData.append(
      "file",
      new File([minimalPDF], "test.pdf", {
        type: "application/pdf",
      })
    );

    const mockRequest = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    if (response.status === 500) {
      console.error(json);
    }

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.targetRole).toBe("Software Engineer");
    expect(json.data.skills).toEqual(["React", "TypeScript"]);
  });

  it("handles model fallback on quota error", async () => {
    const mockGenerateContent = vi
      .fn()
      .mockRejectedValueOnce(new Error("429 Quota Exceeded"))
      .mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              targetRole: "Product Manager",
              skills: ["Strategy", "Roadmapping"],
            }),
        },
      });

    (ai.getGenerativeModel as any).mockReturnValue({
      generateContent: mockGenerateContent,
    });

    (supabaseServer.createClient as any).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File([Buffer.from("dummy pdf")], "test.pdf", {
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
    expect(json.data.targetRole).toBe("Product Manager");
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("throws error if all models fail", async () => {
    const mockGenerateContent = vi
      .fn()
      .mockRejectedValue(new Error("429 Quota Exceeded"));

    (ai.getGenerativeModel as any).mockReturnValue({
      generateContent: mockGenerateContent,
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File([Buffer.from("dummy pdf")], "test.pdf", {
        type: "application/pdf",
      })
    );

    const mockRequest = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toContain("429 Quota Exceeded");
  });

  it("returns 500 if AI returns invalid JSON", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () => "Not valid JSON",
      },
    });

    (ai.getGenerativeModel as any).mockReturnValue({
      generateContent: mockGenerateContent,
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File([Buffer.from("dummy pdf")], "test.pdf", {
        type: "application/pdf",
      })
    );

    const mockRequest = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe("Invalid AI response format");
  });

  it("updates user profile if authenticated", async () => {
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            targetRole: "Designer",
            skills: ["Figma"],
          }),
      },
    });

    (ai.getGenerativeModel as any).mockReturnValue({
      generateContent: mockGenerateContent,
    });

    const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn() });
    const mockSupabase = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-123" } } }),
      },
      from: vi.fn().mockReturnValue({ update: mockUpdate }),
    };
    (supabaseServer.createClient as any).mockResolvedValue(mockSupabase);

    const formData = new FormData();
    formData.append(
      "file",
      new File([Buffer.from("dummy pdf")], "test.pdf", {
        type: "application/pdf",
      })
    );

    const mockRequest = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: ["Figma"],
      })
    );
  });

  it("handles PDF parsing error", async () => {
    const PDFParserModule = await import("pdf2json");
    const MockPDFParser = (PDFParserModule as any).default;

    // Override the mock to trigger an error
    const originalOn = MockPDFParser.prototype.on;
    MockPDFParser.prototype.on = vi.fn().mockImplementation(function (
      this: any,
      event,
      callback
    ) {
      if (event === "pdfParser_dataError") {
        callback({ parserError: { message: "Parsing failed" } });
      }
      return this;
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File([Buffer.from("bad pdf")], "test.pdf", {
        type: "application/pdf",
      })
    );
    const mockRequest = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    const json = await response.json();
    expect(response.status).toBe(500);
    expect(json.error).toBe("Parsing failed");

    // Restore mock
    MockPDFParser.prototype.on = originalOn;
  });

  it("handles empty text extraction", async () => {
    const PDFParserModule = await import("pdf2json");
    const MockPDFParser = (PDFParserModule as any).default;
    const originalGetText = MockPDFParser.prototype.getRawTextContent;
    MockPDFParser.prototype.getRawTextContent = vi.fn().mockReturnValue("");

    const formData = new FormData();
    formData.append(
      "file",
      new File([Buffer.from("empty pdf")], "test.pdf", {
        type: "application/pdf",
      })
    );
    const mockRequest = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe(
      "Could not extract text from PDF"
    );

    MockPDFParser.prototype.getRawTextContent = originalGetText;
  });

  it("rethrows non-retryable model errors", async () => {
    const mockGenerateContent = vi
      .fn()
      .mockRejectedValue(new Error("500 Internal AI Error"));

    (ai.getGenerativeModel as any).mockReturnValue({
      generateContent: mockGenerateContent,
    });

    const formData = new FormData();
    formData.append(
      "file",
      new File([Buffer.from("pdf")], "test.pdf", { type: "application/pdf" })
    );
    const mockRequest = new NextRequest("http://localhost/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
    expect((await response.json()).error).toBe("500 Internal AI Error");
  });
});
