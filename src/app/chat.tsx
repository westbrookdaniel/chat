"use client";

import { AppSidebar } from "@/components/app-sidebar";
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

  const [active, setActive] = useState<null | { id: string; prompt?: string }>(
    null,
  );

  const thread = user.threads.find((t) => t.id === active?.id);

  return (
    <SidebarProvider>
      <AppSidebar user={user} active={active} setActive={setActive} />
      <SidebarInset>
        <ThreadView
          key={thread?.id}
          user={user}
          thread={thread}
          active={active}
          setActive={setActive}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
