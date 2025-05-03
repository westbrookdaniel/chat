import {
  PromptInput,
  PromptInputTextarea,
  PromptInputAction,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { Button } from "./ui/button";
import { ArrowUp, Globe, Lightbulb, Paperclip } from "lucide-react";

export function Prompt({
  value,
  onSubmit,
  handleInputChange,
  status,
}: {
  value: string;
  onSubmit: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  status: "submitted" | "streaming" | "ready" | "error";
}) {
  return (
    <PromptInput
      className="shadow-xl"
      value={value}
      onSubmit={onSubmit}
      handleInputChange={handleInputChange}
    >
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
        <Button
          disabled={status !== "ready"}
          className="rounded-full"
          size="icon"
        >
          <ArrowUp />
        </Button>
      </PromptInputActions>
    </PromptInput>
  );
}
