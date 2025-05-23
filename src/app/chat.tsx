"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ThreadView } from "@/components/thread";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { UserWithThreads } from "@/lib/session";
import { getUser } from "@/lib/thread";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ConfigureModal } from "./configure";

export function Chat({ user: initialUser }: { user: UserWithThreads }) {
  const userQuery = useQuery({
    queryKey: ["user", initialUser.id],
    initialData: initialUser,
    queryFn: () => getUser(initialUser.id),
  });

  const user = userQuery.data ?? initialUser;

  const [active, setActive] = useState<null | string>(null);
  const [configureOpen, setConfigureOpen] = useState(false);

  const thread = user.threads.find((t) => t.id === active);

  useEffect(() => {
    if (thread) {
      window.document.title = `${thread.title} - Chat`;
    } else {
      window.document.title = "Chat";
    }
  }, [thread]);

  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        active={active}
        setActive={setActive}
        onConfigure={() => setConfigureOpen(true)}
      />
      <SidebarInset>
        <ThreadView
          key={active}
          user={user}
          thread={thread}
          setActive={setActive}
          onConfigure={() => setConfigureOpen(true)}
        />
      </SidebarInset>

      <ConfigureModal
        user={user}
        isOpen={configureOpen}
        onClose={() => setConfigureOpen(false)}
      />
    </SidebarProvider>
  );
}
