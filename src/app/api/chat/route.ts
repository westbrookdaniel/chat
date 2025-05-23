import { db, eq, threadTable } from "@/db";
import { getCurrentSession } from "@/lib/session";
import { appendResponseMessages, generateText, streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { AnthropicProviderOptions } from "@ai-sdk/anthropic";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, id, thinking, model } = await req.json();

  const { user } = await getCurrentSession();
  if (!user) throw new Error("Unauthorised");

  if (!user.anthropicApiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const anthropic = createAnthropic({
    apiKey: user.anthropicApiKey,
  });

  const thread = await db.query.threadTable.findFirst({
    where: eq(threadTable.id, id),
  });

  if (!thread) throw new Error("Internal Server Error");

  if (thread.title === "Untitled") {
    const title = await generateText({
      model: anthropic("claude-3-5-haiku-20241022"),
      prompt: JSON.stringify(messages),
      system:
        "Generate a concise, descriptive title (max 30 characters) for this chat thread based on the conversation content. The title should capture the main topic or purpose of the discussion. Do not include quotes in your response. ONLY respond with the title.",
    });

    await db
      .update(threadTable)
      .set({ title: title.text.trim() || "Untitled" })
      .where(eq(threadTable.id, id));
  }

  const selectedModel = anthropic(model || "claude-4-sonnet-20250514");

  const result = streamText({
    model: selectedModel,
    messages,
    ...(thinking && {
      providerOptions: {
        anthropic: {
          thinking: { type: "enabled", budgetTokens: 15000 },
        } satisfies AnthropicProviderOptions,
      },
    }),

    onError: ({ error }) => {
      console.error("Inference error", error);
    },

    async onFinish({ response }) {
      const nextMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });

      await db
        .update(threadTable)
        .set({ data: { ...thread.data, messages: nextMessages } })
        .where(eq(threadTable.id, id));
    },
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
    sendUsage: true,
    getErrorMessage: (error) => {
      return error instanceof Error ? error.message : "An error occurred";
    },
  });
}
