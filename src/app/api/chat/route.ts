import { db, eq, threadTable } from "@/db";
import { getModel } from "@/lib/models";
import { getCurrentSession } from "@/lib/session";
import { appendResponseMessages, generateText, streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, id, thinking } = await req.json();

  const { user } = await getCurrentSession();
  if (!user) throw new Error("Unauthorised");

  const thread = await db.query.threadTable.findFirst({
    where: eq(threadTable.id, id),
  });

  if (!thread) throw new Error("Internal Server Error");

  if (thread.title === "Untitled") {
    const title = await generateText({
      model: getModel("openai:gpt-4.1-mini"),
      prompt: JSON.stringify(messages),
      system:
        "Generate a concise, descriptive title (max 30 characters) for this chat thread based on the conversation content. The title should capture the main topic or purpose of the discussion. Do not include quotes in your response. ONLY respond with the title.",
    });

    await db
      .update(threadTable)
      .set({ title: title.text.trim() || "Untitled" })
      .where(eq(threadTable.id, id));
  }

  const model = getModel(thinking ? "openai:o4-mini" : "openai:gpt-4.1");

  const result = streamText({
    model,
    messages,

    providerOptions: {
      openai: {
        reasoningSummary: "detailed",
      },
    },

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

  return result.toDataStreamResponse({ sendReasoning: true });
}
