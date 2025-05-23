import type { Thread } from "@/db";
import { Prompt } from "./prompt";
import { Message, MessageContent } from "./ui/message";
import { useChat } from "@ai-sdk/react";
import { generateId, UIMessage } from "ai";
import { ChatContainer } from "./ui/chat-container";
import { createThread } from "@/app/actions";
import { getQueryClient } from "@/app/providers";
import { UserWithThreads } from "@/lib/session";
import { useEffect, useMemo, useState } from "react";
import type { Options } from "@/db";
import {
  Reasoning,
  ReasoningContent,
  ReasoningResponse,
  ReasoningTrigger,
} from "@/components/ui/reasoning";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { getGreeting } from "@/lib/greeting";
import { createMessage } from "@/app/util";
import { Button } from "./ui/button";
import { SettingsIcon } from "lucide-react";

export function ThreadView({
  user,
  thread,
  setActive,
  onConfigure,
}: {
  user: UserWithThreads;
  thread: Thread | undefined;
  setActive: (active: string | null) => void;
  onConfigure: () => void;
}) {
  const queryClient = getQueryClient();

  const id = thread?.id ?? generateId();

  const [options, setOptions] = useState<Options>({
    search: thread?.data.search ?? false,
    high: thread?.data.high ?? false,
  });

  const name = user.fullName ? user.fullName.split(" ")[0] : user.username;

  const {
    messages,
    error,
    stop,
    input,
    handleInputChange,
    status,
    handleSubmit,
    reload,
  } = useChat({
    id,
    initialMessages: thread?.data.messages,
    body: options,
    sendExtraMessageFields: true,
    onFinish() {
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
    },
  });

  // Handle kicking off assitant on creation with first message
  // but we also need to dedupe for strict mode
  // debounce isn't ideal for this but it works for now
  const debouncedReload = useMemo(() => debounce(reload, 100), [reload]);
  useEffect(() => {
    if (
      user.anthropicApiKey &&
      status === "ready" &&
      messages.length === 1 &&
      messages[0].role === "user"
    ) {
      debouncedReload();
    }
  }, [debouncedReload, messages, status, user.anthropicApiKey]);

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

              {!user.anthropicApiKey ? (
                <Alert className="max-w-md">
                  <AlertTitle>Missing API Key</AlertTitle>
                  <AlertDescription>
                    Please add your Anthropic API key to start chatting
                  </AlertDescription>
                  <Button className="mt-2 w-[180px]" onClick={onConfigure}>
                    <SettingsIcon />
                    Configure
                  </Button>
                </Alert>
              ) : null}

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
          {getGreeting()}, {name}
        </p>
      )}
      <div className="pb-8 px-8 lg:px-16 mx-auto w-full max-w-4xl">
        <Prompt
          onSubmit={async () => {
            if (!thread) {
              const nextThread = await createThread({
                userId: user.id,
                messages: createMessage(input),
                ...options,
              });

              const newUser = {
                ...user,
                threads: [nextThread, ...user.threads],
              };

              queryClient.setQueryData(["user", user.id], newUser);

              setActive(nextThread.id);
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
              <MessageContent
                id={message.id + i}
                key={i}
                markdown
                className="bg-transparent p-0"
              >
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}
