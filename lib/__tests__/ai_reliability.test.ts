import { describe, it, expect, vi, beforeEach } from "vitest";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

const mockAIInstances = [
  { getGenerativeModel: vi.fn() },
  { getGenerativeModel: vi.fn() },
];

async function testGenerateWithFallback(prompt: string, settings: any = {}) {
  const { maxRetries = 3 } = settings;

  let lastError: any = null;

  for (let keyIndex = 0; keyIndex < mockAIInstances.length; keyIndex++) {
    const ai = mockAIInstances[keyIndex];
    for (const modelName of GEMINI_MODELS) {
      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          const model = ai.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          return { text: result.response.text(), modelName };
        } catch (error: any) {
          lastError = error;
          const errorMsg = error.message || "";
          const isRetryable = error.status === 429 || error.status >= 500;
          const isNotFound = error.status === 404;
          const isDailyQuotaExhausted = errorMsg.includes("limit: 0");

          if (isDailyQuotaExhausted) {
            // Skip to next KEY
            break;
          }

          if (isRetryable && attempt < maxRetries) {
            attempt++;
            continue;
          }
          // Move to next model
          break;
        }
      }
      // If daily quota hit for THIS key, stop trying models for this key
      if (lastError?.message?.includes("limit: 0")) break;
    }
  }
  throw lastError;
}

describe("generateWithFallback reliability with multi-key rotation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully returns response from the first model on the first key", async () => {
    const mockModel = {
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => "Success response" },
      }),
    };
    mockAIInstances[0].getGenerativeModel.mockReturnValue(mockModel);

    const result = await testGenerateWithFallback("test prompt");

    expect(result.text).toBe("Success response");
    expect(result.modelName).toBe(GEMINI_MODELS[0]);
    expect(mockAIInstances[0].getGenerativeModel).toHaveBeenCalled();
    expect(mockAIInstances[1].getGenerativeModel).not.toHaveBeenCalled();
  });

  it("rotates to Second Key when First Key has daily quota exhausted (limit: 0)", async () => {
    const mockModel1 = {
      generateContent: vi
        .fn()
        .mockRejectedValue({
          status: 429,
          message: "Quota exceeded... limit: 0",
        }),
    };
    const mockModel2 = {
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => "Success from second key" },
      }),
    };

    mockAIInstances[0].getGenerativeModel.mockReturnValue(mockModel1);
    mockAIInstances[1].getGenerativeModel.mockReturnValue(mockModel2);

    const result = await testGenerateWithFallback("test prompt");

    expect(result.text).toBe("Success from second key");
    expect(mockAIInstances[0].getGenerativeModel).toHaveBeenCalled();
    expect(mockAIInstances[1].getGenerativeModel).toHaveBeenCalled();
  });

  it("rotates to Second Key when all models on First Key fail", async () => {
    const mockModel1 = {
      generateContent: vi.fn().mockRejectedValue({ status: 500 }),
    };
    const mockModel2 = {
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () =>
            "Success from second key after all models failed on first",
        },
      }),
    };

    mockAIInstances[0].getGenerativeModel.mockReturnValue(mockModel1);
    mockAIInstances[1].getGenerativeModel.mockReturnValue(mockModel2);

    const result = await testGenerateWithFallback("test prompt", {
      maxRetries: 0,
    });

    expect(result.text).toBe(
      "Success from second key after all models failed on first"
    );
    expect(mockAIInstances[0].getGenerativeModel).toHaveBeenCalledTimes(
      GEMINI_MODELS.length
    );
    expect(mockAIInstances[1].getGenerativeModel).toHaveBeenCalled();
  });

  it("throws after all keys and models fail", async () => {
    const mockModel = {
      generateContent: vi.fn().mockRejectedValue({ status: 429 }),
    };
    mockAIInstances[0].getGenerativeModel.mockReturnValue(mockModel);
    mockAIInstances[1].getGenerativeModel.mockReturnValue(mockModel);

    await expect(
      testGenerateWithFallback("test prompt", { maxRetries: 0 })
    ).rejects.toEqual({ status: 429 });

    expect(mockAIInstances[0].getGenerativeModel).toHaveBeenCalledTimes(
      GEMINI_MODELS.length
    );
    expect(mockAIInstances[1].getGenerativeModel).toHaveBeenCalledTimes(
      GEMINI_MODELS.length
    );
  });
});
