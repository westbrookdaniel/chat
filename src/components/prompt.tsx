import {
  PromptInput,
  PromptInputTextarea,
  PromptInputAction,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { Button } from "./ui/button";
import { ArrowUp, Brain, Square, Paperclip, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { Options } from "@/db";
import { cn } from "@/lib/utils";
import { FilePreviewList } from "./ui/file-preview";
import { useRef } from "react";
import type { AttachedFile } from "./thread";

function supportsThinking(model: string): boolean {
  return [
    "claude-4-sonnet-20250514",
    "claude-4-opus-20250514",
    "claude-3-7-sonnet-20241217",
  ].includes(model);
}

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
        <PromptInputTextarea
          autoFocus
          placeholder="Ask chat anything"
          className="mb-2 dark:bg-transperant"
        />
        <PromptInputActions className="gap-1">
          <ModelSelector
            model={options.model || "claude-4-sonnet-20250514"}
            setModel={(model) =>
              setOptions((p) => ({
                ...p,
                model: model as Options["model"],
                // Disable thinking if new model doesn't support it
                thinking: supportsThinking(model) ? p.thinking : false,
              }))
            }
          />

          {supportsThinking(options.model || "claude-4-sonnet-20250514") && (
            <ExpandingButton
              enabled={!!options.thinking}
              toggle={() =>
                setOptions((p) => ({ ...p, thinking: !p.thinking }))
              }
              label="Thinking"
              Icon={Brain}
              width={104}
            />
          )}

          <div className="flex-1" />

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
              className="rounded-full mr-1"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip />
            </Button>
          </PromptInputAction>

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
        variant="outline"
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

function ModelSelector({
  model,
  setModel,
}: {
  model: string;
  setModel: (
    model:
      | "claude-4-sonnet-20250514"
      | "claude-4-opus-20250514"
      | "claude-3-5-sonnet-20241022"
      | "claude-3-7-sonnet-20241217",
  ) => void;
}) {
  const models = [
    { value: "claude-4-sonnet-20250514" as const, label: "Sonnet 4" },
    { value: "claude-4-opus-20250514" as const, label: "Opus 4" },
    { value: "claude-3-5-sonnet-20241022" as const, label: "Sonnet 3.5" },
    { value: "claude-3-7-sonnet-20241217" as const, label: "Sonnet 3.7" },
  ];

  const currentModel =
    models.find((m) => m.value === model)?.label || "Sonnet 4";

  return (
    <PromptInputAction tooltip="Select Model">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-full gap-1 min-w-[100px]"
            size="default"
            variant="outline"
          >
            {currentModel}
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col gap-0.5" align="end">
          {models.map((m) => (
            <DropdownMenuItem
              key={m.value}
              onClick={() => setModel(m.value)}
              className={model === m.value ? "bg-accent" : ""}
            >
              {m.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </PromptInputAction>
  );
}
