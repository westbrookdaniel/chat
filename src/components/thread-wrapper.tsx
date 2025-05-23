"use client";

import { ThreadView } from "@/components/thread";
import { useNavigation } from "@/components/navigation-client";
import type { Thread } from "@/db";
import type { UserWithThreads } from "@/lib/session";

interface ThreadViewWrapperProps {
  user: UserWithThreads;
  thread?: Thread;
  initialModel?: string;
  initialMessage?: string;
}

export function ThreadViewWrapper({ user, thread, initialModel, initialMessage }: ThreadViewWrapperProps) {
  const { setActive, onConfigure } = useNavigation();

  return (
    <ThreadView
      key={thread?.id || "new"}
      user={user}
      thread={thread}
      setActive={setActive}
      onConfigure={onConfigure}
      initialModel={initialModel}
      initialMessage={initialMessage}
    />
  );
}