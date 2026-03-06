import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchJobs,
  fetchFromAdzuna,
  normalizeAdzunaJob,
  clearJobCache,
  setBackoffMultiplier,
} from "../jobFetcher";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Helper: create a valid Adzuna API response
function makeAdzunaResponse(results: unknown[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ results }),
    headers: new Headers(),
  };
}

// Helper: create a raw Adzuna job object
function makeRawAdzunaJob(overrides = {}) {
  return {
    title: "Software Engineer",
    company: { display_name: "Tech Corp" },
    description: "Build amazing software.",
    redirect_url: "https://jobs.example.com/apply/123",
    location: { display_name: "Boston, MA" },
    ...overrides,
  };
}

describe("Job Fetcher Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearJobCache();
    setBackoffMultiplier(0); // Disable real delays in tests
    process.env.ADZUNA_APP_ID = "test-app-id";
    process.env.ADZUNA_APP_KEY = "test-app-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("normalizeAdzunaJob", () => {
    it("maps Adzuna fields to normalized schema correctly", () => {
      const raw = makeRawAdzunaJob();
      const result = normalizeAdzunaJob(raw);

      expect(result).toEqual({
        title: "Software Engineer",
        company: "Tech Corp",
        description: "Build amazing software.",
        apply_url: "https://jobs.example.com/apply/123",
        location: "Boston, MA",
      });
    });

    it("throws on malformed Adzuna data", () => {
      expect(() => normalizeAdzunaJob({ title: "no company" })).toThrow();
    });
  });

  describe("fetchFromAdzuna", () => {
    it("returns normalized listings on success", async () => {
      mockFetch.mockResolvedValueOnce(
        makeAdzunaResponse([
          makeRawAdzunaJob(),
          makeRawAdzunaJob({ title: "DevOps Engineer" }),
        ])
      );

      const results = await fetchFromAdzuna("software engineer");
      expect(results).toHaveLength(2);
      expect(results[0].title).toBe("Software Engineer");
      expect(results[1].title).toBe("DevOps Engineer");
    });

    it("filters by location when provided", async () => {
      mockFetch.mockResolvedValueOnce(makeAdzunaResponse([makeRawAdzunaJob()]));

      await fetchFromAdzuna("developer", "new york");

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("where=new+york");
    });

    it("retries on 429 (rate limit) up to 3 times", async () => {
      const rateLimitResponse = {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        headers: new Headers(),
        text: async () => "Rate limited",
      };

      mockFetch
        .mockResolvedValueOnce(rateLimitResponse)
        .mockResolvedValueOnce(rateLimitResponse)
        .mockResolvedValueOnce(makeAdzunaResponse([makeRawAdzunaJob()]));

      const results = await fetchFromAdzuna("engineer");
      expect(results).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("retries on 5xx errors", async () => {
      const serverError = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers(),
        text: async () => "Server error",
      };

      mockFetch
        .mockResolvedValueOnce(serverError)
        .mockResolvedValueOnce(makeAdzunaResponse([makeRawAdzunaJob()]));

      const results = await fetchFromAdzuna("engineer");
      expect(results).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("throws after 3 failed attempts", async () => {
      const serverError = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers(),
        text: async () => "Server error",
      };

      mockFetch
        .mockResolvedValueOnce(serverError)
        .mockResolvedValueOnce(serverError)
        .mockResolvedValueOnce(serverError);

      await expect(fetchFromAdzuna("engineer")).rejects.toThrow(
        /failed after 3 attempts/i
      );
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("throws immediately on non-retryable 4xx errors", async () => {
      const clientError = {
        ok: false,
        status: 403,
        statusText: "Forbidden",
        headers: new Headers(),
        text: async () => "Forbidden",
      };

      mockFetch.mockResolvedValueOnce(clientError);

      await expect(fetchFromAdzuna("engineer")).rejects.toThrow(/403/);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("throws if Adzuna credentials are missing", async () => {
      delete process.env.ADZUNA_APP_ID;
      await expect(fetchFromAdzuna("engineer")).rejects.toThrow(
        /credentials are not configured/i
      );
    });

    it("skips malformed job entries gracefully", async () => {
      mockFetch.mockResolvedValueOnce(
        makeAdzunaResponse([
          makeRawAdzunaJob(),
          { title: "bad entry, no company" }, // malformed
          makeRawAdzunaJob({ title: "Good Job" }),
        ])
      );

      const results = await fetchFromAdzuna("engineer");
      expect(results).toHaveLength(2);
    });
  });

  describe("fetchJobs (with caching)", () => {
    it("returns listings from Adzuna on cache miss", async () => {
      mockFetch.mockResolvedValueOnce(makeAdzunaResponse([makeRawAdzunaJob()]));

      const results = await fetchJobs({ role: "developer" });
      expect(results).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("returns cached data within TTL", async () => {
      mockFetch.mockResolvedValueOnce(makeAdzunaResponse([makeRawAdzunaJob()]));

      // First call — fetches from API
      await fetchJobs({ role: "developer" });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call — should hit cache
      const results = await fetchJobs({ role: "developer" });
      expect(results).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, cache hit
    });

    it("refreshes cache after TTL expires", async () => {
      // Mock Date.now to control time
      const realDateNow = Date.now;
      let currentTime = 1000000;
      Date.now = () => currentTime;

      mockFetch.mockResolvedValue(makeAdzunaResponse([makeRawAdzunaJob()]));

      // First call
      await fetchJobs({ role: "developer" });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time by 61 minutes (past 1-hour TTL)
      currentTime += 61 * 60 * 1000;

      // Second call — cache expired, should fetch again
      await fetchJobs({ role: "developer" });
      expect(mockFetch).toHaveBeenCalledTimes(2);

      Date.now = realDateNow;
    });

    it("uses separate cache keys for different role/location combos", async () => {
      mockFetch.mockResolvedValue(makeAdzunaResponse([makeRawAdzunaJob()]));

      await fetchJobs({ role: "developer", location: "boston" });
      await fetchJobs({ role: "developer", location: "new york" });
      await fetchJobs({ role: "designer" });

      // 3 unique cache keys = 3 API calls
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
