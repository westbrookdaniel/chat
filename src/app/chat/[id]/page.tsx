import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { NavigationClient } from "@/components/navigation-client";
import { ThreadViewWrapper } from "@/components/thread-wrapper";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { user } = await getCurrentSession();

  if (user === null) {
    return redirect("/login");
  }

  const { id } = await params;
  const thread = user.threads.find((t) => t.id === id);

  if (!thread) {
    return notFound();
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <NavigationClient user={user} active={id} defaultOpen={defaultOpen}>
      <ThreadViewWrapper user={user} thread={thread} />
    </NavigationClient>
  );
}

