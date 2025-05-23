import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { NavigationClient } from "@/components/navigation-client";
import { ThreadViewWrapper } from "@/components/thread-wrapper";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ model?: string; q?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { user } = await getCurrentSession();

  if (user === null) {
    return redirect("/login");
  }

  const params = await searchParams;

  return (
    <NavigationClient user={user} active={null}>
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