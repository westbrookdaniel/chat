import { LanguageModelV1 } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const providers: Record<string, any> = {
  openai: createOpenAI({ compatibility: "strict" }).responses,
  google: createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY }),
};

const models = [
  "openai:gpt-4.1",
  "openai:o4-mini",
  "openai:gpt-4.1-mini",
  "google:gemini-2.5-flash-preview-04-17",
] as const;

export type ModelCode = (typeof models)[number];

export function getModel(modelCode: ModelCode): LanguageModelV1 {
  if (!models.includes(modelCode)) throw new Error("Internal Server Error");
  const [name, model] = modelCode.split(":");
  const provider = providers[name];
  if (!provider) throw new Error("Internal Server Error");
  return provider(model);
}
