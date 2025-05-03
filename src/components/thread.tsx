import type { Thread } from "@/db";
import { Prompt } from "./prompt";
import { useState } from "react";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from "./ui/message";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "./ui/button";

export function ThreadView({ thread }: { thread: Thread }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1" />
      <div className="pb-8 px-8 lg:px-16 mx-auto w-full max-w-4xl">
        <Prompt />
      </div>
    </div>
  );
}

export function MessageWithActions() {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text =
      "I can help with a variety of tasks:\n\n- Answering questions\n- Providing information\n- Assisting with coding\n- Generating creative content\n\nWhat would you like help with today?";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      <Message className="justify-end">
        <MessageContent>Hello! How can I help you today?</MessageContent>
      </Message>

      <Message className="justify-start">
        <MessageAvatar src="/avatars/ai.png" alt="AI" fallback="AI" />
        <div className="flex w-full flex-col gap-2">
          <MessageContent markdown className="bg-transparent p-0">
            I can help with a variety of tasks: - Answering questions -
            Providing information - Assisting with coding - Generating creative
            content What would you like help with today?
          </MessageContent>

          <MessageActions className="self-end">
            <MessageAction tooltip="Copy to clipboard">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleCopy}
              >
                <Copy className={`size-4 ${copied ? "text-green-500" : ""}`} />
              </Button>
            </MessageAction>

            <MessageAction tooltip="Helpful">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full ${liked === true ? "bg-green-100 text-green-500" : ""}`}
                onClick={() => setLiked(true)}
              >
                <ThumbsUp className="size-4" />
              </Button>
            </MessageAction>

            <MessageAction tooltip="Not helpful">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full ${liked === false ? "bg-red-100 text-red-500" : ""}`}
                onClick={() => setLiked(false)}
              >
                <ThumbsDown className="size-4" />
              </Button>
            </MessageAction>
          </MessageActions>
        </div>
      </Message>
    </div>
  );
}
