import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

export const ai = new GoogleGenerativeAI(env.GEMINI_API_KEY);
