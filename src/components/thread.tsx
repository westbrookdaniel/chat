import type { Thread } from "@/db";
import { Prompt } from "./prompt";
import { Message, MessageContent } from "./ui/message";
import { useChat } from "@ai-sdk/react";
import { generateId, UIMessage } from "ai";
import { ChatContainer } from "./ui/chat-container";
import { createThread } from "@/app/actions";
import { getQueryClient } from "@/app/providers";
import { UserWithThreads } from "@/lib/session";
import { useEffect } from "react";

export function ThreadView({
  user,
  thread,
  active,
  setActive,
}: {
  user: UserWithThreads;
  thread?: Thread;
  active: { id: string; prompt?: string } | null;
  setActive: (input: { id: string; prompt?: string } | null) => void;
}) {
  const queryClient = getQueryClient();

  const name = user.fullName ? user.fullName.split(" ")[0] : user.username;
  const id = thread?.id ?? generateId();

  const { messages, input, handleInputChange, status, handleSubmit } = useChat({
    id,
    initialMessages: thread?.data.messages,
    initialInput: active?.prompt,
  });

  useEffect(() => {
    if (active?.prompt) handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.prompt]);

  return (
    <div
      className={
        thread
          ? "flex flex-col h-full"
          : "flex flex-col h-full items-center justify-center"
      }
    >
      {thread ? (
        <div className="flex flex-col flex-[1_1_auto] h-[1px]">
          <ChatContainer autoScroll className="flex-1 py-8">
            <Messages messages={messages} />
          </ChatContainer>
        </div>
      ) : (
        <p className="mb-6 text-2xl font-medium text-neutral-400">
          Good Morning, {name}
        </p>
      )}
      <div className="pb-8 px-8 lg:px-16 mx-auto w-full max-w-4xl">
        <Prompt
          onSubmit={async () => {
            if (!thread) {
              const nextThread = await createThread({
                userId: user.id,
                messages: [],
              });

              const newUser = {
                ...user,
                threads: [...user.threads, nextThread],
              };

              queryClient.setQueryData(["user", user.id], newUser);

              setActive({ id: nextThread.id, prompt: input });
            }
          }}
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
