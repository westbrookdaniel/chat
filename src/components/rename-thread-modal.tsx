"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { renameThread } from "@/app/actions";
import { getQueryClient } from "@/app/providers";
import type { UserWithThreads } from "@/lib/session";

interface RenameThreadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
  currentTitle: string;
  user: UserWithThreads;
}

export function RenameThreadModal({
  open,
  onOpenChange,
  threadId,
  currentTitle,
  user,
}: RenameThreadModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = getQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim() === currentTitle) return;

    setIsLoading(true);
    try {
      await renameThread({
        userId: user.id,
        id: threadId,
        title: title.trim(),
      });

      const newUser = {
        ...user,
        threads: user.threads.map((thread) =>
          thread.id === threadId ? { ...thread, title: title.trim() } : thread,
        ),
      };

      queryClient.setQueryData(["user", user.id], newUser);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to rename thread:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle(currentTitle);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>Update the name for this chat</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter chat name..."
                autoFocus
                maxLength={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || !title.trim() || title.trim() === currentTitle
              }
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

