"use client";

import { ThreadView } from "@/components/thread";
import { useNavigation } from "@/components/navigation-client";
import type { Thread } from "@/db";
import type { UserWithThreads } from "@/lib/session";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/thread";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ThreadViewWrapperProps {
  user: UserWithThreads;
  thread?: Thread;
  initialModel?: string;
  initialMessage?: string;
}

export function ThreadViewWrapper({
  user: initialUser,
  thread,
  initialModel,
  initialMessage,
}: ThreadViewWrapperProps) {
  const { setActive, onConfigure } = useNavigation();

  const userQuery = useQuery({
    queryKey: ["user", initialUser.id],
    initialData: initialUser,
    queryFn: () => getUser(initialUser.id),
  });

  const user = userQuery.data ?? initialUser;

  return (
    <TooltipProvider>
      <ThreadView
        key={thread?.id || "new"}
        user={user}
        thread={thread}
        setActive={setActive}
        onConfigure={onConfigure}
        initialModel={initialModel}
        initialMessage={initialMessage}
      />
    </TooltipProvider>
  );
}

