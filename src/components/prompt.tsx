import {
  PromptInput,
  PromptInputTextarea,
  PromptInputAction,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { Button } from "./ui/button";
import { ArrowUp, Brain, Square, Paperclip } from "lucide-react";
import type { Options } from "@/db";
import { cn } from "@/lib/utils";
import { FilePreviewList } from "./ui/file-preview";
import { useRef } from "react";
import type { AttachedFile } from "./thread";

export function Prompt({
  value,
  onSubmit,
  handleInputChange,
  status,
  stop,
  options,
  setOptions,
  files,
  onFilesChange,
}: {
  value: string;
  onSubmit: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  status: "submitted" | "streaming" | "ready" | "error";
  stop: () => void;
  options: Options;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
  files: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      const attachedFiles: AttachedFile[] = selectedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
      }));
      onFilesChange([...files, ...attachedFiles]);
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div>
      {files.length > 0 && (
        <div className="mb-2">
          <FilePreviewList files={files} onRemove={handleRemoveFile} />
        </div>
      )}
      <PromptInput
        value={value}
        onSubmit={onSubmit}
        handleInputChange={handleInputChange}
      >
        <PromptInputTextarea autoFocus placeholder="Ask chat" />
        <PromptInputActions className="gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,text/*,.md,.txt,.json,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <PromptInputAction tooltip="Upload File">
            <Button
              className="rounded-full"
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip />
            </Button>
          </PromptInputAction>
          <ExpandingButton
            enabled={!!options.high}
            toggle={() => setOptions((p) => ({ ...p, high: !p.high }))}
            label="Opus"
            Icon={Brain}
            width={84}
          />
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
    </div>
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
