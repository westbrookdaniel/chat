"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { User } from "@/db";

export function Chat({
  user,
  logoutAction,
}: {
  user: User;
  logoutAction: () => void;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <h1>Hi, {user.fullName ?? user.username}!</h1>
        <form action={logoutAction}>
          <Button>Sign out</Button>
        </form>
      </SidebarInset>
    </SidebarProvider>
  );
}
