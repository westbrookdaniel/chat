import { generateId } from "ai";
import { prepareAttachmentsForRequest } from "./prepare";

export async function createInitialMessage(
  content: string,
  files: FileList | undefined,
) {
  const id = generateId();

  return [
    {
      id: id,
      createdAt: new Date().toISOString(),
      role: "user",
      content: content,
      parts: [{ type: "text", text: content }],
      experimental_attachments: files
        ? await prepareAttachmentsForRequest(files)
        : undefined,

      // Add internal indicator that this is the first message
      __initial: true,
    },
  ];
}
