import {
  AdzunaJobSchema,
  NormalizedJob,
  NormalizedJobSchema,
  JobFetchParams,
} from "./validations/jobListing";
import { ApiError } from "./api/errorHandler";

/**
 * Backoff multiplier for retry delays. Set to 0 in tests to skip real delays.
 */
export let _backoffMultiplier = 1;
export function setBackoffMultiplier(val: number) {
  _backoffMultiplier = val;
}

// --- Cache ---
interface CacheEntry {
  data: NormalizedJob[];
  timestamp: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry>();

function getCacheKey(role: string, location?: string): string {
  return `${role.toLowerCase()}:${(location || "").toLowerCase()}`;
}

/**
 * Clears the in-memory job cache. Exposed for testing.
 */
export function clearJobCache(): void {
  cache.clear();
}

// --- Adzuna API ---
const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs";
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Normalizes a raw Adzuna job object into our standard schema.
 * @issue 15
 */
export function normalizeAdzunaJob(raw: unknown): NormalizedJob {
  const parsed = AdzunaJobSchema.parse(raw);
  const normalized = {
    title: parsed.title,
    company: parsed.company.display_name,
    description: parsed.description,
    apply_url: parsed.redirect_url,
    location: parsed.location.display_name,
  };
  return NormalizedJobSchema.parse(normalized);
}

/**
 * Fetches raw job listings from the Adzuna API with retry logic.
 * - Max 3 attempts with exponential backoff (1s, 2s, 4s)
 * - Retries on 429 (rate limit) and 5xx errors only
 * - Respects Retry-After header when present
 * @issue 15
 */
export async function fetchFromAdzuna(
  role: string,
  location?: string
): Promise<NormalizedJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new ApiError(
      "Adzuna API credentials are not configured.",
      500,
      "CONFIG_ERROR"
    );
  }

  // Adzuna uses country code in the URL; default to "us"
  const country = "us";

  let query = role;
  let finalLocation = location;

  // Handle "Remote" specially because Adzuna 'where' parameter often fails with it
  if (location?.toLowerCase() === "remote") {
    query = `${role} remote`;
    finalLocation = undefined;
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "20",
    what: query,
  });

  if (finalLocation) {
    params.set("where", finalLocation);
  }

  const url = `${ADZUNA_BASE_URL}/${country}/search/1?${params.toString()}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url);

      // Success — parse and normalize
      if (response.ok) {
        const json = await response.json();
        const results = json.results || [];
        return results
          .map((item: unknown) => {
            try {
              return normalizeAdzunaJob(item);
            } catch {
              // Skip malformed entries
              return null;
            }
          })
          .filter(Boolean) as NormalizedJob[];
      }

      // Retryable errors: 429 or 5xx
      if (response.status === 429 || response.status >= 500) {
        const retryAfter = response.headers.get("Retry-After");
        const backoffMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : INITIAL_BACKOFF_MS * Math.pow(2, attempt);

        lastError = new Error(
          `Adzuna API error ${response.status}: ${response.statusText}`
        );
        await delay(backoffMs * _backoffMultiplier);
        continue;
      }

      // Non-retryable client errors (4xx except 429)
      const errorBody = await response.text();
      throw new ApiError(
        `Adzuna API error: ${response.status} ${errorBody}`,
        response.status,
        "EXTERNAL_API_ERROR"
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < MAX_RETRIES - 1) {
        await delay(
          INITIAL_BACKOFF_MS * Math.pow(2, attempt) * _backoffMultiplier
        );
      }
    }
  }

  throw new ApiError(
    `Adzuna API failed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
    502,
    "EXTERNAL_API_EXHAUSTED"
  );
}

/**
 * Main entry point: fetches jobs with caching.
 * Checks in-memory cache (1-hour TTL) before calling Adzuna.
 * @issue 15
 */
export async function fetchJobs(
  params: JobFetchParams
): Promise<NormalizedJob[]> {
  const { role, location } = params;
  const key = getCacheKey(role, location);

  // Check cache
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Fetch from Adzuna
  const jobs = await fetchFromAdzuna(role, location);

  // Store in cache
  cache.set(key, { data: jobs, timestamp: Date.now() });

  return jobs;
}

// --- Helpers ---
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
