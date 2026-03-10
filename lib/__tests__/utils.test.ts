import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getURL } from "../utils";

describe("getURL utility", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Clear relevant env vars
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("should prioritize NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://custom-site.com";
    process.env.NEXT_PUBLIC_VERCEL_URL = "https://vercel-site.com";
    expect(getURL()).toBe("https://custom-site.com");
  });

  it("should use NEXT_PUBLIC_VERCEL_URL if NEXT_PUBLIC_SITE_URL is missing", () => {
    process.env.NEXT_PUBLIC_VERCEL_URL = "best-match-deploy.vercel.app";
    expect(getURL()).toBe("https://best-match-deploy.vercel.app");
  });

  it("should add https:// to Vercel URL if protocol is missing", () => {
    process.env.NEXT_PUBLIC_VERCEL_URL = "best-match-deploy.vercel.app";
    expect(getURL()).toBe("https://best-match-deploy.vercel.app");
  });

  it("should fallback to window.location.origin if in browser", () => {
    vi.stubGlobal("window", {
      location: {
        origin: "https://browser-origin.com",
      },
    });
    expect(getURL()).toBe("https://browser-origin.com");
  });

  it("should fallback to localhost if no env vars or window", () => {
    vi.stubGlobal("window", undefined);
    expect(getURL()).toBe("http://localhost:3000");
  });

  it("should always remove trailing slashes", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://mysite.com/";
    expect(getURL()).toBe("https://mysite.com");

    process.env.NEXT_PUBLIC_SITE_URL = "https://mysite.com///";
    expect(getURL()).toBe("https://mysite.com");
  });
});
