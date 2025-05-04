import type { Thread } from "@/db";
import { Prompt } from "./prompt";
import { Message, MessageContent } from "./ui/message";
import { useChat } from "@ai-sdk/react";
import { generateId, UIMessage } from "ai";
import { ChatContainer } from "./ui/chat-container";
import { createThread } from "@/app/actions";
import { getQueryClient } from "@/app/providers";
import { UserWithThreads } from "@/lib/session";
import { useEffect, useState } from "react";
import type { Options } from "@/db";
import {
  Reasoning,
  ReasoningContent,
  ReasoningResponse,
  ReasoningTrigger,
} from "@/components/ui/reasoning";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

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

  const [options, setOptions] = useState<Options>({
    search: thread?.data.search ?? false,
    thinking: thread?.data.thinking ?? false,
  });

  const name = user.fullName ? user.fullName.split(" ")[0] : user.username;
  const id = thread?.id ?? generateId();

  const {
    messages,
    error,
    stop,
    input,
    handleInputChange,
    status,
    handleSubmit,
  } = useChat({
    id,
    initialMessages: thread?.data.messages,
    initialInput: active?.prompt,
    body: options,
    sendExtraMessageFields: true,
    onFinish() {
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
    },
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
            <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full px-8 lg:px-16">
              {messages.map((message, i) => (
                <MessageDisplay key={i} message={message} />
              ))}
              {error ? (
                <Alert className="max-w-xl">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              ) : null}
            </div>
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
                ...options,
              });

              const newUser = {
                ...user,
                threads: [nextThread, ...user.threads],
              };

              queryClient.setQueryData(["user", user.id], newUser);

              setActive({ id: nextThread.id, prompt: input });
            } else {
              handleSubmit();
            }
          }}
          handleInputChange={handleInputChange}
          value={input}
          status={status}
          stop={stop}
          options={options}
          setOptions={setOptions}
        />
      </div>
    </div>
  );
}

function MessageDisplay({ message }: { message: UIMessage }) {
  console.log(message);

  if (message.role === "user") {
    return (
      <Message className="justify-end">
        <MessageContent className="whitespace-pre-wrap">
          {message.content}
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message className="justify-start">
      <div className="flex w-full flex-col gap-2">
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <MessageContent key={i} markdown className="bg-transparent p-0">
                {part.text}
              </MessageContent>
            );
          }

          if (part.type === "reasoning") {
            return (
              <div className="rounded-md border max-w-2xl mb-2" key={i}>
                <Reasoning key={i}>
                  <div className="flex items-center justify-between">
                    <ReasoningTrigger className="w-full px-4 py-4">
                      Show reasoning
                    </ReasoningTrigger>
                  </div>
                  <ReasoningContent>
                    <ReasoningResponse
                      className="px-4 -mt-3 pb-1"
                      text={part.reasoning}
                    />
                  </ReasoningContent>
                </Reasoning>
              </div>
            );
          }
        })}
      </div>
    </Message>
  );
}
