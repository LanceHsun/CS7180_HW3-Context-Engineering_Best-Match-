import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

const apiKeys = env.GEMINI_API_KEY.split(",")
  .map((k) => k.trim())
  .filter(Boolean);
const aiClients = apiKeys.map((key) => new GoogleGenerativeAI(key));

export const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-pro",
];

export interface AISettings {
  maxRetries?: number;
  initialDelay?: number;
  responseMimeType?: string;
}

/**
 * Generates content using Gemini models with automatic fallback, retry logic, and key rotation.
 * Implements exponential backoff for retryable errors (429, 500, 503).
 */
export async function generateWithFallback(
  prompt: string,
  settings: AISettings = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    responseMimeType = "application/json",
  } = settings;

  let lastError: any = null;

  for (let keyIndex = 0; keyIndex < aiClients.length; keyIndex++) {
    const ai = aiClients[keyIndex];
    if (aiClients.length > 1) {
      console.log(`🔑 Using API Key ${keyIndex + 1} of ${aiClients.length}`);
    }

    const skipCurrentKey = false;

    for (const modelName of GEMINI_MODELS) {
      if (skipCurrentKey) break;

      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          if (attempt > 0) {
            const delay = initialDelay * Math.pow(2, attempt - 1);
            console.log(
              `🔄 Retrying ${modelName} (attempt ${attempt}) after ${delay}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          const model = ai.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType },
          });

          const result = await model.generateContent(prompt);
          const text = result.response.text();

          if (text) {
            return { text, modelName };
          }
          throw new Error("Empty response from model");
        } catch (error: any) {
          lastError = error;
          const errorMsg = error.message || "";
          const statusCode =
            error.status ||
            (errorMsg.match(/\d{3}/)
              ? parseInt(errorMsg.match(/\d{3}/)![0])
              : null);

          const isRetryable =
            statusCode === 429 || // Quota
            statusCode === 500 || // Internal Server Error
            statusCode === 503 || // Service Unavailable
            errorMsg.toLowerCase().includes("quota") ||
            errorMsg.toLowerCase().includes("deadline exceeded");

          const isNotFoundError =
            statusCode === 404 || errorMsg.toLowerCase().includes("not found");

          // If we see "limit: 0", it usually means the quota for THIS model is exhausted or restricted.
          const isDailyQuotaExhausted = errorMsg.includes("limit: 0");

          if (isDailyQuotaExhausted) {
            console.warn(
              `🛑 API Key ${keyIndex + 1} quota limit 0 for ${modelName}. Trying next model...`
            );
            break; // Break the attempt loop for THIS model
          }

          if (isRetryable && attempt < maxRetries) {
            attempt++;
            continue;
          }

          if (isRetryable || isNotFoundError) {
            console.warn(
              `⚠️ Key ${keyIndex + 1} | Model ${modelName} failed. Status: ${statusCode}. Msg: ${errorMsg.slice(0, 150)}`
            );
            break; // Move to next model
          }

          // For other types of errors, stop and throw
          console.error(`❌ Critical error on Key ${keyIndex + 1}:`, errorMsg);
          throw error;
        }
      }
    }
  }

  throw new Error(
    lastError?.message ||
      "Failed to get response from any Gemini model with available keys"
  );
}
