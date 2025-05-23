import {
  PromptInput,
  PromptInputTextarea,
  PromptInputAction,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { Button } from "./ui/button";
import { ArrowUp, Brain, Globe, Square } from "lucide-react";
import type { Options } from "@/db";
import { cn } from "@/lib/utils";

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
      value={value}
      onSubmit={onSubmit}
      handleInputChange={handleInputChange}
    >
      <PromptInputTextarea autoFocus placeholder="Ask chat" />
      <PromptInputActions className="gap-1">
        {/*
        <PromptInputAction tooltip="Upload File">
          <Button className="rounded-full" size="icon" variant="ghost">
            <Paperclip />
          </Button>
        </PromptInputAction>
        */}
        <ExpandingButton
          enabled={!!options.high}
          toggle={() => setOptions((p) => ({ ...p, high: !p.high }))}
          label="Opus"
          Icon={Brain}
          width={84}
        />
        {/*
        <ExpandingButton
          enabled={!!options.search}
          toggle={() => setOptions((p) => ({ ...p, search: !p.search }))}
          label="Search"
          Icon={Globe}
          width={98}
        />
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

function ExpandingButton({
  label,
  Icon,
  enabled,
  toggle,
  width,
}: {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>;
  enabled: boolean;
  toggle: () => void;
  width: number;
}) {
  return (
    <PromptInputAction tooltip={label}>
      <Button
        className={cn(
          "rounded-full transition-all duration-300 overflow-hidden relative",
        )}
        style={{ width: enabled ? `${width}px` : "36px" }}
        size={enabled ? "default" : "icon"}
        variant={enabled ? "secondary" : "ghost"}
        onClick={() => toggle()}
      >
        <Icon className="absolute left-2.5" />
        <span
          className={cn(
            "transition-opacity pl-5",
            enabled
              ? "opacity-100 duration-600"
              : "opacity-0 pointer-events-none duration-50",
          )}
        >
          {label}
        </span>
      </Button>
    </PromptInputAction>
  );
}
