"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Landing } from "@/components/landing";
import { ThreadView } from "@/components/thread";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { UserWithThreads } from "@/lib/session";
import { getUser } from "@/lib/thread";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function Chat({ user: initialUser }: { user: UserWithThreads }) {
  const userQuery = useQuery({
    queryKey: ["user", initialUser.id],
    initialData: initialUser,
    queryFn: () => getUser(initialUser.id),
  });

  const user = userQuery.data ?? initialUser;

  const [threadId, setThreadId] = useState<null | string>(null);

  const thread = user.threads.find((t) => t.id === threadId);

  return (
    <SidebarProvider>
      <AppSidebar user={user} threadId={threadId} setThreadId={setThreadId} />
      <SidebarInset>
        {thread ? (
          <ThreadView thread={thread} />
        ) : (
          <Landing user={user} createThread={async () => {}} />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
