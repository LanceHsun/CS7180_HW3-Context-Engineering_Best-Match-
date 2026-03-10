import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock environment first
vi.mock("@/lib/env", () => ({
  env: {
    GEMINI_API_KEY: "key1,key2",
  },
}));

// Mock GoogleGenerativeAI
const mockModel1 = {
  generateContent: vi.fn(),
};
const mockModel2 = {
  generateContent: vi.fn(),
};

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      constructor(public apiKey: string) {}
      getGenerativeModel = vi.fn().mockImplementation(() => {
        if (this.apiKey === "key1") return mockModel1;
        return mockModel2;
      });
    },
  };
});

// Now import the real function
import { generateWithFallback, GEMINI_MODELS } from "../ai";

describe("generateWithFallback reliability with multi-key rotation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModel1.generateContent.mockReset();
    mockModel2.generateContent.mockReset();
  });

  it("successfully returns response from the first model on the first key", async () => {
    mockModel1.generateContent.mockResolvedValue({
      response: { text: () => "Success response" },
    });

    const result = await generateWithFallback("test prompt", { maxRetries: 0 });
    expect(result.text).toBe("Success response");
    expect(result.modelName).toBe(GEMINI_MODELS[0]);
  });

  it("rotates to Second Key when First Key has daily quota exhausted (limit: 0)", async () => {
    const err = new Error("Quota exceeded... limit: 0");
    (err as any).status = 429;
    mockModel1.generateContent.mockRejectedValue(err);
    mockModel2.generateContent.mockResolvedValue({
      response: { text: () => "Success from key 2" },
    });

    const result = await generateWithFallback("test prompt", { maxRetries: 0 });
    expect(result.text).toBe("Success from key 2");
  });

  it("fail-fast: rotates to Second Key immediately on 429", async () => {
    const err = new Error("Too Many Requests");
    (err as any).status = 429;
    mockModel1.generateContent.mockRejectedValue(err);
    mockModel2.generateContent.mockResolvedValue({
      response: { text: () => "Quick recovery" },
    });

    const result = await generateWithFallback("test prompt", { maxRetries: 0 });
    expect(result.text).toBe("Quick recovery");
    expect(mockModel1.generateContent).toHaveBeenCalledTimes(1);
  });

  it("throws when model returns invalid response (null)", async () => {
    mockModel1.generateContent.mockResolvedValue(null);
    mockModel2.generateContent.mockResolvedValue(null);

    await expect(
      generateWithFallback("test prompt", { maxRetries: 0 })
    ).rejects.toThrow(/Invalid response/);
  });

  it("throws after all keys and models fail", async () => {
    const err = new Error("Server Error");
    (err as any).status = 500;
    mockModel1.generateContent.mockRejectedValue(err);
    mockModel2.generateContent.mockRejectedValue(err);

    await expect(
      generateWithFallback("test prompt", { maxRetries: 0 })
    ).rejects.toThrow();
  });
});
