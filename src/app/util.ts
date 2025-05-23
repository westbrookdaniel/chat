import { generateId } from "ai";

export function createMessage(content: string) {
  const id = generateId();
  return [
    {
      id: id,
      createdAt: new Date().toISOString(),
      role: "user",
      content: content,
      parts: [{ type: "text", text: content }],
    },
  ];
}
