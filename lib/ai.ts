import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

export const ai = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const GEMINI_MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
];
