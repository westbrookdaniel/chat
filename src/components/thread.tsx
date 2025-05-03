import type { Thread } from "@/db";
import { Prompt } from "./prompt";
import { Message, MessageContent } from "./ui/message";
import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { ChatContainer } from "./ui/chat-container";

export function ThreadView({ thread }: { thread: Thread }) {
  const { messages, input, handleInputChange, status, handleSubmit } = useChat({
    id: thread.id,
    initialMessages: thread.data.messages,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-[1_1_auto] h-[1px]">
        <ChatContainer autoScroll className="flex-1 py-8">
          <Messages messages={messages} />
        </ChatContainer>
      </div>
      <div className="pb-8 px-8 lg:px-16 mx-auto w-full max-w-4xl">
        <Prompt
          onSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          value={input}
          status={status}
        />
      </div>
    </div>
  );
}

export function Messages({ messages }: { messages: UIMessage[] }) {
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full px-8 lg:px-16">
      {messages.map((message, i) =>
        message.role === "user" ? (
          <Message className="justify-end" key={i}>
            <MessageContent>{message.content}</MessageContent>
          </Message>
        ) : (
          <Message className="justify-start" key={i}>
            <div className="flex w-full flex-col gap-2">
              <MessageContent markdown className="bg-transparent p-0">
                {message.content}
              </MessageContent>
            </div>
          </Message>
        ),
      )}
    </div>
  );
}
