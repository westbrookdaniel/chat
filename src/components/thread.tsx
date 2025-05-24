import type { Thread } from "@/db";
import { Prompt } from "./prompt";
import { Message, MessageContent } from "./ui/message";
import { useChat } from "@ai-sdk/react";
import { generateId, UIMessage } from "ai";
import { ChatContainer } from "./ui/chat-container";
import { createThread } from "@/app/actions";
import { getQueryClient } from "@/app/providers";
import { UserWithThreads } from "@/lib/session";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import type { Options } from "@/db";
import {
  Reasoning,
  ReasoningContent,
  ReasoningResponse,
  ReasoningTrigger,
} from "@/components/ui/reasoning";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { getGreeting } from "@/lib/greeting";
import { createInitialMessage } from "@/app/createInitialMessage";
import { FilePreviewList } from "./ui/file-preview";
import { Button } from "./ui/button";
import {
  SettingsIcon,
  Copy,
  Edit,
  RotateCcw,
  X,
  Check,
  Menu,
} from "lucide-react";
import { MessageActions, MessageAction } from "./ui/message";
import { TooltipProvider } from "./ui/tooltip";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Loader } from "./ui/loader";

export interface AttachedFile {
  id: string;
  file: File;
}

const VALID_MODELS = [
  "claude-4-sonnet-20250514",
  "claude-4-opus-20250514",
  "claude-3-5-sonnet-20241022",
  "claude-3-7-sonnet-20241217",
] as const;

function isValidModel(
  model: string | undefined,
): model is (typeof VALID_MODELS)[number] {
  return !!model && (VALID_MODELS as readonly string[]).includes(model);
}

export function ThreadView({
  user,
  thread,
  setActive,
  onConfigure,
  initialModel,
  initialMessage,
}: {
  user: UserWithThreads;
  thread: Thread | undefined;
  setActive: (active: string | null) => void;
  onConfigure: () => void;
  initialModel?: string;
  initialMessage?: string;
}) {
  const queryClient = getQueryClient();
  const { isMobile } = useSidebar();

  const id = thread?.id ?? generateId();

  const [options, setOptions] = useState<Options>({
    thinking: thread?.data.thinking ?? false,
    model:
      thread?.data.model ??
      (isValidModel(initialModel) ? initialModel : "claude-4-sonnet-20250514"),
  });

  const [files, setFiles] = useState<AttachedFile[]>([]);

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
    setMessages,
    setInput,
  } = useChat({
    id,
    initialMessages: thread?.data.messages,
    body: options,
    sendExtraMessageFields: true,
    onFinish() {
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
    },
  });

  // Set initial message when component mounts for new chats
  useEffect(() => {
    if (!thread && initialMessage && input === "") {
      setInput(initialMessage);
    }
  }, [thread, initialMessage, input, setInput]);

  // Create stable reload function reference
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  const stableReload = useCallback(() => {
    reloadRef.current();
  }, []);

  const debouncedReload = useMemo(
    () => debounce(stableReload, 10),
    [stableReload],
  );

  // Handle kicking off assitant on creation with first message
  // but we also need to dedupe for strict mode
  // debounce isn't ideal for this but it works for now
  useEffect(() => {
    if (
      user.anthropicApiKey &&
      status === "ready" &&
      messages.length === 1 &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (messages[0] as any).__initial === true
    ) {
      debouncedReload();
    }
  }, [debouncedReload, messages, status, user.anthropicApiKey]);

  return (
    <div
      className={
        thread
          ? "flex flex-col h-full relative"
          : "flex flex-col h-full items-center justify-center relative"
      }
    >
      {isMobile && (
        <SidebarTrigger className="fixed top-4 left-4 z-50 h-10 w-10 rounded-full bg-background border shadow-md hover:shadow-lg transition-shadow">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      )}
      {thread ? (
        <div className="flex flex-col flex-[1_1_auto] h-[1px]">
          <ChatContainer autoScroll className="flex-1 py-8">
            <TooltipProvider>
              <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full px-4 md:px-8 lg:px-16">
                {messages.map((message, i) => (
                  <MessageDisplay
                    key={i}
                    message={message}
                    messageIndex={i}
                    setMessages={setMessages}
                    reload={stableReload}
                  />
                ))}

                {status === "submitted" ? (
                  <Loader variant="text-shimmer" />
                ) : null}

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
            </TooltipProvider>
          </ChatContainer>
        </div>
      ) : (
        <p className="mb-6 text-2xl font-medium text-neutral-400">
          {getGreeting()}, {name}
        </p>
      )}
      <div className="pb-2 px-4 md:px-8 lg:px-16 mx-auto w-full max-w-4xl">
        <Prompt
          onSubmit={async () => {
            if (!thread) {
              const nextThread = await createThread({
                userId: user.id,
                messages: await createInitialMessage(
                  input,
                  files.length > 0 ? filesToFileList(files) : undefined,
                ),

                ...options,
              });

              const newUser = {
                ...user,
                threads: [nextThread, ...user.threads],
              };

              queryClient.setQueryData(["user", user.id], newUser);

              setActive(nextThread.id);
              setFiles([]);
            } else {
              handleSubmit(undefined, {
                experimental_attachments:
                  files.length > 0 ? filesToFileList(files) : undefined,
              });
              setFiles([]);
            }
          }}
          handleInputChange={handleInputChange}
          value={input}
          status={status}
          stop={stop}
          options={options}
          setOptions={setOptions}
          files={files}
          onFilesChange={setFiles}
        />
        <p className="mt-1 text-xs text-muted-foreground text-center">
          Chat can make mistakes. Please check important info.
        </p>
      </div>
    </div>
  );
}

const MessageDisplay = memo(MessageDisplayInner, (prev, next) => {
  return (
    // optimise message check
    prev.message.content === next.message.content &&
    prev.messageIndex === next.messageIndex &&
    prev.reload === next.reload
  );
});

function MessageDisplayInner({
  message,
  messageIndex,
  setMessages,
  reload,
}: {
  message: UIMessage;
  messageIndex: number;
  setMessages: (
    fn: (prev: Omit<UIMessage, "parts">[]) => Omit<UIMessage, "parts">[],
  ) => void;
  reload: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditValue(message.content);
  }, [message.content]);

  const handleSaveEdit = useCallback(() => {
    setMessages((prev) => {
      const updated = [...prev];

      const prevMessage = updated[messageIndex] as UIMessage & {
        __initial?: boolean;
      };

      // Delete internal indicator
      delete prevMessage.__initial;

      updated[messageIndex] = {
        ...prevMessage,
        parts: prevMessage.parts.map((part) =>
          part.type === "text" ? { ...part, text: editValue } : part,
        ),
        content: editValue,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      // Slice messages up to and including the edited message
      return updated.slice(0, messageIndex + 1);
    });
    setIsEditing(false);

    // Reload to continue conversation from this point
    setTimeout(() => reload(), 100);
  }, [editValue, messageIndex, setMessages, reload]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue(message.content);
  }, [message.content]);

  const handleRetry = useCallback(() => {
    setMessages((prev) => prev.slice(0, messageIndex));
    setTimeout(() => reload(), 100);
  }, [messageIndex, setMessages, reload]);

  // Stable handlers for button clicks
  const handleCopyMessage = useCallback(() => {
    copyToClipboard(message.content);
  }, [copyToClipboard, message.content]);

  const getMessageText = useCallback(() => {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n");
  }, [message.parts]);

  const handleCopyAssistantMessage = useCallback(() => {
    copyToClipboard(getMessageText());
  }, [copyToClipboard, getMessageText]);

  if (message.role === "user") {
    // Convert message attachments to AttachedFile format for display
    const messageFiles = message.experimental_attachments ?? [];
    return (
      <Message className="justify-end group">
        <div className="flex items-end flex-col gap-2">
          {isEditing ? (
            <div className="flex items-end flex-col gap-2">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-auto resize-none field-sizing-content"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelEdit();
                  }
                }}
                autoFocus
              />
              <MessageActions className="justify-end">
                <MessageAction tooltip="Save (Ctrl+Enter)">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleSaveEdit}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </MessageAction>
                <MessageAction tooltip="Cancel (Esc)">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </MessageAction>
              </MessageActions>
            </div>
          ) : (
            <>
              {messageFiles.length > 0 && (
                <FilePreviewList files={messageFiles} className="mb-2" />
              )}
              <MessageContent className="whitespace-pre-wrap">
                {message.content}
              </MessageContent>
              <MessageActions className="md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end">
                <MessageAction tooltip="Edit message">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleEdit}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </MessageAction>
                <MessageAction tooltip="Copy message">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleCopyMessage}
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </MessageAction>
                <MessageAction tooltip="Retry from here">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={reload}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </MessageAction>
              </MessageActions>
            </>
          )}
        </div>
      </Message>
    );
  }

  return (
    <Message className="justify-start group">
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
                    <ReasoningTrigger className="text-sm w-full px-4 py-3">
                      Show reasoning
                    </ReasoningTrigger>
                  </div>
                  <ReasoningContent>
                    <ReasoningResponse
                      className="px-4 -mt-3.5 pb-1"
                      text={part.reasoning}
                    />
                  </ReasoningContent>
                </Reasoning>
              </div>
            );
          }
        })}
        <MessageActions className="md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <MessageAction tooltip="Copy message">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleCopyAssistantMessage}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </MessageAction>
          <MessageAction tooltip="Retry from here">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleRetry}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </MessageAction>
        </MessageActions>
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

function filesToFileList(files: AttachedFile[]): FileList {
  const dt = new DataTransfer();
  files.forEach((f) => dt.items.add(f.file));
  return dt.files;
}
