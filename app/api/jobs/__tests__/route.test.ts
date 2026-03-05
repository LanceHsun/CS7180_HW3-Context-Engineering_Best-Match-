import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

// Mock the jobFetcher module
vi.mock("@/lib/jobFetcher", () => ({
    fetchJobs: vi.fn(),
}));

import { fetchJobs } from "@/lib/jobFetcher";

describe("GET /api/jobs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 without required role param", async () => {
        const req = new NextRequest("http://localhost:3000/api/jobs");
        const res = await GET(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 200 with normalized job listings", async () => {
        const mockJobs = [
            {
                title: "Software Engineer",
                company: "Tech Corp",
                description: "Build things.",
                apply_url: "https://example.com/apply",
                location: "Boston, MA",
            },
        ];
        vi.mocked(fetchJobs).mockResolvedValue(mockJobs);

        const req = new NextRequest(
            "http://localhost:3000/api/jobs?role=software+engineer"
        );
        const res = await GET(req);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data.jobs).toHaveLength(1);
        expect(data.data.jobs[0].title).toBe("Software Engineer");
        expect(data.data.count).toBe(1);
    });

    it("passes location param to fetchJobs when provided", async () => {
        vi.mocked(fetchJobs).mockResolvedValue([]);

        const req = new NextRequest(
            "http://localhost:3000/api/jobs?role=developer&location=boston"
        );
        await GET(req);

        expect(fetchJobs).toHaveBeenCalledWith({
            role: "developer",
            location: "boston",
        });
    });

    it("returns 500 when fetchJobs throws", async () => {
        vi.mocked(fetchJobs).mockRejectedValue(new Error("API failure"));

        const req = new NextRequest(
            "http://localhost:3000/api/jobs?role=developer"
        );
        const res = await GET(req);

        expect(res.status).toBe(500);
    });
});
