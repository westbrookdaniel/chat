import { NavigationClient } from "@/components/navigation-client";
import { Button } from "@/components/ui/button";
import { PromptInputTextarea } from "@/components/ui/prompt-input";
import { getGreeting } from "@/lib/greeting";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <NavigationClient user={null} active={null} defaultOpen={defaultOpen}>
      <div className="flex flex-col h-full items-center justify-center relative">
        <h1 className="mb-2 text-2xl font-medium text-neutral-400">
          {getGreeting()}
        </h1>
        <p className="mb-8 text-muted-foreground/60 text-center leading-tight">
          Welcome to your own fast and streamlined chat. <br /> Join for free
          and use your own API key.
        </p>
        <Button asChild className="w-[300px]">
          <a href="/login/github">Sign in with GitHub</a>
        </Button>
      </div>
    </NavigationClient>
  );
}
