import {
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash,
  Moon,
  Sun,
  UserIcon,
} from "lucide-react";
import type { User } from "@/db/schema";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import type { UserWithThreads } from "@/lib/session";
import { deleteThread, logoutAction } from "@/app/actions";
import { getQueryClient } from "@/app/providers";
import { useEffect, useRef, useState } from "react";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTheme } from "next-themes";
import { RenameThreadModal } from "./rename-thread-modal";
import { useRouter } from "next/navigation";

export function AppSidebar({
  user,
  active,
  setActive,
  onConfigure,
}: {
  user: UserWithThreads | null;
  active: string | null;
  setActive: (active: string | null) => void;
  onConfigure: () => void;
}) {
  const router = useRouter();
  const queryClient = getQueryClient();

  const [search, setSearch] = useState("");
  const [renameModal, setRenameModal] = useState<{
    open: boolean;
    threadId: string;
    title: string;
  }>({ open: false, threadId: "", title: "" });

  const fuse = new Fuse(user?.threads ?? [], {
    keys: ["title"],
    threshold: 0.3,
    includeScore: true,
  });

  const filteredThreads =
    search.trim() === ""
      ? (user?.threads ?? [])
      : fuse.search(search).map((result) => result.item);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="gap-0">
        <SidebarHeader className="gap-2 mt-1">
          <div className="flex gap-2">
            <Button
              className="flex-1 min-w-9"
              size="icon"
              disabled={!user}
              onClick={async () => {
                setActive(null);
              }}
            >
              <Plus />
            </Button>
            <SearchInput search={search} setSearch={setSearch} />
          </div>
        </SidebarHeader>
        <SidebarGroup className="transition-opacity group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {!!user &&
                filteredThreads.map((item) => (
                  <SidebarMenuItem key={item.id} className="group/item">
                    <SidebarMenuButton
                      onClick={() => setActive(item.id)}
                      isActive={active === item.id}
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
                        <DropdownMenuItem
                          onClick={() =>
                            setRenameModal({
                              open: true,
                              threadId: item.id,
                              title: item.title,
                            })
                          }
                        >
                          <Pencil />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            await deleteThread({
                              userId: user.id,
                              id: item.id,
                            });

                            const newUser = {
                              ...user,
                              threads: user.threads.filter(
                                (thread) => thread.id !== item.id,
                              ),
                            };

                            queryClient.setQueryData(
                              ["user", user.id],
                              newUser,
                            );

                            if (active === item.id) {
                              router.push("/");
                            }
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
      <SidebarFooter>
        <div className="flex items-center gap-0.5">
          <div className="flex-1">
            {user ? (
              <NavUser user={user} onConfigure={onConfigure} />
            ) : (
              <SignedOutNavUser />
            )}
          </div>
          <ThemeToggleButton />
        </div>
      </SidebarFooter>
      <SidebarRail />
      {user && (
        <RenameThreadModal
          key={renameModal.threadId}
          open={renameModal.open}
          onOpenChange={(open) => setRenameModal((prev) => ({ ...prev, open }))}
          threadId={renameModal.threadId}
          currentTitle={renameModal.title}
          user={user}
        />
      )}
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
        "relative transition-all ease-in-out duration-300",
        "group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none",
        isActive ? "w-[300px]" : "w-9",
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

function NavUser({
  user,
  onConfigure,
}: {
  user: User;
  onConfigure: () => void;
}) {
  const { isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
              )}
            >
              <Avatar
                className={cn(
                  "size-8 rounded-full",
                  "transition-all group-data-[collapsible=icon]:size-7",
                  "group-data-[collapsible=icon]:ml-1",
                )}
              >
                <AvatarImage
                  src={user.avatarUrl!}
                  alt={user.fullName ?? user.username}
                />
                <AvatarFallback className="rounded-full">
                  {user.username[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user.fullName ?? user.username}
                </span>
                <span className="truncate text-xs">{user.username}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={() => onConfigure()}>
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logoutAction()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function ThemeToggleButton() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "size-9",
            "transition-opacity group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:pointer-events-none",
          )}
          size="icon"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SignedOutNavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-transparent cursor-default active:bg-transparent"
        >
          <Avatar
            className={cn(
              "size-8 rounded-full",
              "transition-all group-data-[collapsible=icon]:size-7",
              "group-data-[collapsible=icon]:ml-1",
            )}
          >
            <AvatarFallback className="rounded-full">
              <UserIcon className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Anonymous</span>
            <span className="truncate text-xs">Sign in to Continue</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
