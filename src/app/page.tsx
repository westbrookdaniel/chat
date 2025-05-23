import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { NavigationClient } from "@/components/navigation-client";
import { ThreadViewWrapper } from "@/components/thread-wrapper";
import { Suspense } from "react";
import { cookies } from "next/headers";

interface PageProps {
  searchParams: Promise<{ model?: string; q?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { user } = await getCurrentSession();

  if (user === null) {
    return redirect("/login");
  }

  const params = await searchParams;

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <NavigationClient user={user} active={null} defaultOpen={defaultOpen}>
      <Suspense fallback={<div>Loading...</div>}>
        <ThreadViewWrapper
          user={user}
          thread={undefined}
          initialModel={params.model}
          initialMessage={params.q}
        />
      </Suspense>
    </NavigationClient>
  );
}

