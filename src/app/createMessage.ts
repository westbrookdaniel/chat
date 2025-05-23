import { generateId } from "ai";
import { prepareAttachmentsForRequest } from "./prepare";

export async function createMessage(
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
    },
  ];
}
