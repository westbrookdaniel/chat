import {
  PromptInput,
  PromptInputTextarea,
  PromptInputAction,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { Button } from "./ui/button";
import { ArrowUp, Globe, Lightbulb, Paperclip, Square } from "lucide-react";
import type { Options } from "@/db";

export function Prompt({
  value,
  onSubmit,
  handleInputChange,
  status,
  stop,
  options,
  setOptions,
}: {
  value: string;
  onSubmit: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
}) {
  return (
    <PromptInput
      className="shadow-xl"
      value={value}
      onSubmit={onSubmit}
      handleInputChange={handleInputChange}
    >
      <PromptInputTextarea placeholder="Ask chat" />
      <PromptInputActions className="gap-1">
        <PromptInputAction tooltip="Upload File">
          <Button className="rounded-full" size="icon" variant="ghost">
            <Paperclip />
          </Button>
        </PromptInputAction>
        <PromptInputAction tooltip="Thinking">
          <Button
            className="rounded-full"
            size={options.thinking ? "default" : "icon"}
            variant={options.thinking ? "secondary" : "ghost"}
            onClick={() => setOptions((p) => ({ ...p, thinking: !p.thinking }))}
          >
            <Lightbulb />
            {options.thinking ? <span>Thinking</span> : null}
          </Button>
        </PromptInputAction>
        {/*
        <PromptInputAction tooltip="Search">
          <Button
            className="rounded-full"
            size={options.search ? "default" : "icon"}
            variant={options.search ? "secondary" : "ghost"}
            onClick={() => setOptions((p) => ({ ...p, search: !p.search }))}
          >
            <Globe />
            {options.search ? <span>Search</span> : null}
          </Button>
        </PromptInputAction>
        */}
        <div className="flex-1" />
        <Button
          disabled={status !== "ready" && status !== "streaming"}
          className="rounded-full"
          size="icon"
          onClick={
            status === "streaming"
              ? (e) => {
                  e.preventDefault();
                  stop();
                }
              : onSubmit
          }
        >
          {status === "streaming" ? (
            <Square className="size-5 fill-current" />
          ) : (
            <ArrowUp className="size-5" />
          )}
        </Button>
      </PromptInputActions>
    </PromptInput>
  );
}
