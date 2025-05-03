import type { Thread } from "@/db";
import { Prompt } from "./prompt";
import { Message, MessageContent } from "./ui/message";

export function ThreadView({ thread }: { thread: Thread }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 max-w-4xl w-full mx-auto px-8 lg:px-16 pt-8">
        <MessageWithActions />
      </div>
      <div className="pb-8 px-8 lg:px-16 mx-auto w-full max-w-4xl">
        <Prompt />
      </div>
    </div>
  );
}

export function MessageWithActions() {
  return (
    <div className="flex flex-col gap-8">
      <Message className="justify-end">
        <MessageContent>Hello! How can I help you today?</MessageContent>
      </Message>

      <Message className="justify-start">
        <div className="flex w-full flex-col gap-2 max-w-2xl">
          <MessageContent markdown className="bg-transparent p-0">
            I can help with a variety of tasks: - Answering questions -
            Providing information - Assisting with coding - Generating creative
            content What would you like help with today?
          </MessageContent>
        </div>
      </Message>
    </div>
  );
}
