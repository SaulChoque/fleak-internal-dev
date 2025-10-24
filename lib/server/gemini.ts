import { GoogleGenerativeAI } from "@google/generative-ai";
import { getEnv } from "@/lib/env";

const MODEL = "gemini-1.5-pro";

export interface GeminiResult {
  score: number;
  rationale: string;
}

export async function analyzeEvidencePrompt(prompt: string): Promise<GeminiResult> {
  const env = getEnv();
  const client = new GoogleGenerativeAI(env.API_KEY_GEMINI);
  const model = client.getGenerativeModel({ model: MODEL });

  const response = await model.generateContent(`You are adjudicating a Fleak challenge.
Return a JSON object with score (0 to 100) and rationale field.
Prompt: ${prompt}`);

  const text = response.response.text();
  try {
    const parsed = JSON.parse(text) as { score: number; rationale: string };
    return { score: parsed.score, rationale: parsed.rationale };
  } catch {
    return { score: 0, rationale: "Unable to parse Gemini response" };
  }
}
