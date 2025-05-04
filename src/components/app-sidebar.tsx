import { MoreHorizontal, Plus, Search, Trash } from "lucide-react";

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
import { Button } from "./ui/button";
import type { UserWithThreads } from "@/lib/session";
import { deleteThread } from "@/app/actions";
import { getQueryClient } from "@/app/providers";
import { useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";

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

  const [search, setSearch] = useState("");

  const fuse = new Fuse(user.threads, {
    keys: ["title"],
    threshold: 0.3,
    includeScore: true,
  });

  const filteredThreads =
    search.trim() === ""
      ? user.threads
      : fuse.search(search).map((result) => result.item);

  return (
    <Sidebar>
      <SidebarContent className="gap-0">
        <SidebarHeader className="gap-2 mt-1">
          <div className="flex gap-2">
            <Button
              className="flex-1 min-w-9"
              size="icon"
              onClick={async () => {
                setActive(null);
              }}
            >
              <Plus />
            </Button>
            <SearchInput search={search} setSearch={setSearch} />
          </div>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {filteredThreads.map((item) => (
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

function SearchInput({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive) ref.current?.focus();
  }, [isActive]);

  return (
    <button
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "relative transition-all duration-300",
        isActive ? "w-128" : "w-9",
      )}
      onClick={() => setIsActive(true)}
    >
      <span className="absolute left-[9px] top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search className="size-4" />
      </span>
      <input
        placeholder="Search chats..."
        className={cn(
          "outline-none pl-5 bg-transparent transition-opacity duration-200",
          !isActive && "opacity-0 pointer-events-none w-0",
          isActive && "opacity-100 w-full",
        )}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        ref={ref}
        onBlur={() => {
          if (search === "") setIsActive(false);
        }}
      />
    </button>
  );
}
