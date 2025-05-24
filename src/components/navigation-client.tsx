"use client";

import { useRouter } from "next/navigation";
import { useState, createContext, useContext } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ConfigureModal } from "@/app/configure";
import type { UserWithThreads } from "@/lib/session";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/thread";

interface NavigationContextType {
  setActive: (threadId: string | null) => void;
  onConfigure: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationClient");
  }
  return context;
}

interface NavigationClientProps {
  user: UserWithThreads | null;
  active: string | null;
  children: React.ReactNode;
  defaultOpen: boolean;
}

export function NavigationClient({
  user: initialUser,
  active,
  children,
  defaultOpen,
}: NavigationClientProps) {
  const router = useRouter();
  const [configureOpen, setConfigureOpen] = useState(false);

  const userQuery = useQuery({
    queryKey: ["user", initialUser?.id],
    initialData: initialUser,
    queryFn: () => getUser(initialUser!.id),
    enabled: !!initialUser,
  });

  const user = userQuery.data ?? initialUser;

  const setActive = (threadId: string | null) => {
    if (threadId) {
      router.push(`/chat/${threadId}`);
    } else {
      router.push("/");
    }
  };

  const onConfigure = () => setConfigureOpen(true);

  const navigationValue = {
    setActive,
    onConfigure,
  };

  return (
    <NavigationContext.Provider value={navigationValue}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar
          user={user}
          active={active}
          setActive={setActive}
          onConfigure={onConfigure}
        />
        <SidebarInset>{children}</SidebarInset>
        {user ? (
          <ConfigureModal
            user={user}
            isOpen={configureOpen}
            onClose={() => setConfigureOpen(false)}
          />
        ) : null}
      </SidebarProvider>
    </NavigationContext.Provider>
  );
}
