"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ThreadView } from "@/components/thread";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { UserWithThreads } from "@/lib/session";
import { getUser } from "@/lib/thread";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ConfigureModal } from "./configure";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

// Using React Router for faster client-side navigation feel
// instead of Next.js server-side routing
export function ChatRouter({ user: initialUser }: { user: UserWithThreads }) {
  // TODO how to fix error "document is not defined"?
  return (
    <BrowserRouter>
      <ChatRouterInner user={initialUser} />
    </BrowserRouter>
  );
}

function ChatRouterInner({ user: initialUser }: { user: UserWithThreads }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [configureOpen, setConfigureOpen] = useState(false);

  const userQuery = useQuery({
    queryKey: ["user", initialUser.id],
    initialData: initialUser,
    queryFn: () => getUser(initialUser.id),
  });

  const user = userQuery.data ?? initialUser;

  const setActive = (newThreadId: string | null) => {
    if (newThreadId) {
      navigate(`/chat/${newThreadId}`, { replace: false });
    } else {
      navigate("/", { replace: false });
    }
  };

  // Parse current route to determine active thread and props
  const getCurrentRouteInfo = () => {
    if (location.pathname === "/") {
      const params = new URLSearchParams(location.search);
      return {
        threadId: null,
        thread: undefined,
        initialModel: params.get("model") || undefined,
        initialMessage: params.get("q") || undefined,
      };
    }

    if (location.pathname.startsWith("/chat/")) {
      const threadId = location.pathname.split("/chat/")[1];
      const thread = user.threads.find((t) => t.id === threadId);
      return {
        threadId,
        thread,
        initialModel: undefined,
        initialMessage: undefined,
      };
    }

    return {
      threadId: null,
      thread: undefined,
      initialModel: undefined,
      initialMessage: undefined,
    };
  };

  const { threadId, thread, initialModel, initialMessage } =
    getCurrentRouteInfo();

  useEffect(() => {
    if (thread) {
      window.document.title = `${thread.title} - Chat`;
    } else {
      window.document.title = threadId ? "Chat" : "New Chat";
    }
  }, [thread, threadId]);

  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        active={threadId}
        setActive={setActive}
        onConfigure={() => setConfigureOpen(true)}
      />
      <SidebarInset>
        <Routes>
          <Route
            path="/"
            element={
              <ThreadView
                key="new"
                user={user}
                thread={undefined}
                setActive={setActive}
                onConfigure={() => setConfigureOpen(true)}
                initialModel={initialModel}
                initialMessage={initialMessage}
              />
            }
          />
          <Route
            path="/chat/:id"
            element={
              <ChatWithIdRoute
                user={user}
                setActive={setActive}
                onConfigure={() => setConfigureOpen(true)}
              />
            }
          />
        </Routes>
      </SidebarInset>

      <ConfigureModal
        user={user}
        isOpen={configureOpen}
        onClose={() => setConfigureOpen(false)}
      />
    </SidebarProvider>
  );
}

function ChatWithIdRoute({
  user,
  setActive,
  onConfigure,
}: {
  user: UserWithThreads;
  setActive: (threadId: string | null) => void;
  onConfigure: () => void;
}) {
  const { id } = useParams<{ id: string }>();
  const thread = user.threads.find((t) => t.id === id);

  return (
    <ThreadView
      key={id}
      user={user}
      thread={thread}
      setActive={setActive}
      onConfigure={onConfigure}
    />
  );
}

