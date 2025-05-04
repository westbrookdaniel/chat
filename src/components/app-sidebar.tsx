import { MoreHorizontal, Plus, Trash } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import type { UserWithThreads } from "@/lib/session";
import { createThread, deleteThread } from "@/app/actions";
import { getQueryClient } from "@/app/providers";

export function AppSidebar({
  user,
  active,
  setActive,
}: {
  user: UserWithThreads;
  active: { id: string; prompt?: string } | null;
  setActive: (input: { id: string; prompt?: string } | null) => void;
}) {
  const queryClient = getQueryClient();

  return (
    <Sidebar>
      <SidebarContent className="gap-0">
        <SidebarHeader className="gap-2 mt-1">
          <Button
            className="rounded-full"
            onClick={async () => {
              const newThread = await createThread({ userId: user.id });

              const newUser = {
                ...user,
                threads: [newThread, ...user.threads],
              };

              queryClient.setQueryData(["user", user.id], newUser);

              setActive({ id: newThread.id });
            }}
          >
            <Plus />
          </Button>
          <Input
            className="shadow-none border-none focus-visible:ring-0"
            placeholder="Search chats..."
          />
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {user.threads.map((item) => (
                <SidebarMenuItem key={item.id} className="group/item">
                  <SidebarMenuButton
                    onClick={() => setActive({ id: item.id })}
                    isActive={active?.id === item.id}
                    className="px-3"
                  >
                    <span>{item.title}</span>
                  </SidebarMenuButton>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction className="opacity-0 group-hover/item:opacity-100 data-[state=open]:opacity-100">
                        <MoreHorizontal />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      {/*
                        <DropdownMenuItem>
                          <Pencil />
                          <span>Rename</span>
                        </DropdownMenuItem>
                      */}
                      <DropdownMenuItem
                        onClick={async () => {
                          await deleteThread({ userId: user.id, id: item.id });

                          const newUser = {
                            ...user,
                            threads: user.threads.filter(
                              (thread) => thread.id !== item.id,
                            ),
                          };

                          queryClient.setQueryData(["user", user.id], newUser);
                        }}
                      >
                        <Trash />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
