import { db, eq, threadTable } from "@/db";
import { getModel } from "@/lib/models";
import { appendResponseMessages, generateText, streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, id } = await req.json();

  const thread = await db.query.threadTable.findFirst({
    where: eq(threadTable.id, id),
  });

  if (!thread) throw new Error("Internal Server Error");

  const model = getModel("openai:gpt-4.1");

  const result = streamText({
    model,
    messages,
    async onFinish({ response }) {
      const nextMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });

      await db
        .update(threadTable)
        .set({ data: { ...thread.data, messages: nextMessages } })
        .where(eq(threadTable.id, id));

      if (thread.title === "Untitled") {
        const title = await generateText({
          model,
          prompt: JSON.stringify(nextMessages),
          system:
            "Generate a concise, descriptive title (max 30 characters) for this chat thread based on the conversation content. The title should capture the main topic or purpose of the discussion. Do not include quotes in your response. ONLY respond with the title.",
        });

        await db
          .update(threadTable)
          .set({ title: title.text.trim() || "Untitled" })
          .where(eq(threadTable.id, id));
      }
    },
  });

  return result.toDataStreamResponse();
}
