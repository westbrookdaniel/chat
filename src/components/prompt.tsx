"use client";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputAction,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { Button } from "./ui/button";
import { ArrowUp, Globe, Lightbulb, Paperclip } from "lucide-react";

export function Prompt() {
  return (
    <PromptInput className="shadow-2xl">
      <PromptInputTextarea placeholder="Ask chat" />
      <PromptInputActions className="gap-0">
        <PromptInputAction tooltip="Upload File">
          <Button className="rounded-full" size="icon" variant="ghost">
            <Paperclip />
          </Button>
        </PromptInputAction>
        <PromptInputAction tooltip="Thinking">
          <Button className="rounded-full" size="icon" variant="ghost">
            <Lightbulb />
          </Button>
        </PromptInputAction>
        <PromptInputAction tooltip="Search">
          <Button className="rounded-full" size="icon" variant="ghost">
            <Globe />
          </Button>
        </PromptInputAction>
        <div className="flex-1" />
        <Button className="rounded-full" size="icon">
          <ArrowUp />
        </Button>
      </PromptInputActions>
    </PromptInput>
  );
}
