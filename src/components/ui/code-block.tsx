"use client";

import { cn } from "@/lib/utils";
import React, { startTransition, useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { Button } from "./button";
import { Copy, Check } from "lucide-react";

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col overflow-clip border relative group",
        "border-border bg-card text-card-foreground rounded-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
  code,
  language = "tsx",
  theme = "github-light",
  className,
  ...props
}: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function highlight() {
      if (!code) return;
      const html = await codeToHtml(code, { lang: language, theme });
      startTransition(() => {
        setHighlightedHtml(html);
      });
    }
    highlight();
  }, [code, language, theme]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const classNames = cn(
    "w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4 relative",
    className,
  );

  // SSR fallback: render plain code if not hydrated yet
  return (
    <div className="relative group/code">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 z-10 h-7 w-7 p-0 opacity-0 group-hover/code:opacity-100 transition-opacity duration-200"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
      {highlightedHtml ? (
        <div
          className={classNames}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          {...props}
        />
      ) : (
        <div className={classNames} {...props}>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
