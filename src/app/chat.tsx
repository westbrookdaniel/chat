"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Prompt } from "@/components/prompt";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { UserWithThreads } from "@/lib/session";

export function Chat({
  user,
  logoutAction,
}: {
  user: UserWithThreads;
  logoutAction: () => void;
}) {
  const name = user.fullName ? user.fullName.split(" ")[0] : user.username;

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        {/* 
          <h1>Hi, {user.fullName ?? user.username}!</h1>
          <form action={logoutAction}>
            <Button>Sign out</Button>
          </form>
        */}
        <div className="flex flex-col h-full items-center justify-center">
          <p className="mb-6 text-2xl font-medium text-neutral-400">
            Good Morning, {name}
          </p>
          <div className="pb-8 px-8 lg:px-16 mx-auto w-full max-w-4xl">
            <Prompt />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// <div className="flex flex-col h-full">
//   <div className="flex-1" />
//   <div className="pb-8 px-8 lg:px-16 mx-auto w-full max-w-4xl">
//     <Prompt />
//   </div>
// </div>
