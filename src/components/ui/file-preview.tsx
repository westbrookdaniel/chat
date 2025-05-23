"use client";

import { X, FileText, File, ExternalLink } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import type { AttachedFile } from "../thread";
import type { Attachment } from "ai";

interface FilePreviewProps {
  file: Attachment | AttachedFile;
  onRemove?: (id: string) => void;
  className?: string;
}

function isAiAttachment(file: Attachment | AttachedFile): file is Attachment {
  return "url" in file;
}

export function FilePreview({ file, onRemove, className }: FilePreviewProps) {
  const url = isAiAttachment(file) ? file.url : URL.createObjectURL(file.file);
  const contentType = isAiAttachment(file)
    ? (file.contentType ?? "")
    : file.file.type;
  const name = isAiAttachment(file) ? file.name : file.file.name;

  const isImage = contentType.startsWith("image/");
  const isPDF = contentType === "application/pdf";

  const openFile = () => {
    if (isPDF) window.open(url, "_blank");
  };

  return (
    <div
      className={cn(
        "relative inline-block border overflow-hidden bg-muted",
        isImage ? "rounded-lg" : "rounded-3xl",
        className,
      )}
    >
      {isImage ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={name}
            className="max-w-[200px] max-h-[150px] object-cover"
          />
          {onRemove && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full"
              onClick={() =>
                onRemove(isAiAttachment(file) ? file.url : file.id)
              }
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2.5 py-2 px-3 min-w-[200px]">
          <div className="flex-shrink-0">
            {isPDF ? (
              <FileText className="h-4 w-4 text-red-600" />
            ) : (
              <File className="h-4 w-4 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{name}</div>
          </div>
          <div className="flex items-center gap-1">
            {isPDF && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={openFile}
                title="Open in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() =>
                  onRemove(isAiAttachment(file) ? file.url : file.id)
                }
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FilePreviewListProps {
  files: (Attachment | AttachedFile)[];
  onRemove?: (id: string) => void;
  className?: string;
}

export function FilePreviewList({
  files,
  onRemove,
  className,
}: FilePreviewListProps) {
  if (files.length === 0) return null;

  return (
    <div className={cn("flex items-start flex-wrap gap-2", className)}>
      {files.map((file) => (
        <FilePreview
          key={isAiAttachment(file) ? file.url : file.id}
          file={file}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

