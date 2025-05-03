import { LanguageModelV1 } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  compatibility: "strict",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const providers: Record<string, any> = {
  openai,
};

const models = ["openai:gpt-4.1"];

export function getModel(modelCode: string): LanguageModelV1 {
  if (!models.includes(modelCode)) throw new Error("Internal Server Error");
  const [name, model] = modelCode.split(":");
  const provider = providers[name];
  if (!provider) throw new Error("Internal Server Error");
  return provider(model);
}
