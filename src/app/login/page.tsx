import { Button } from "@/components/ui/button";
import { getGreeting } from "@/lib/greeting";

export default async function Page() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center text-center">
      <h1 className="mb-1 text-2xl font-medium text-neutral-400">
        {getGreeting()}
      </h1>
      <p className="mb-6 text-neutral-400">
        Welcome to your own fast and streamlined chat
      </p>
      <Button asChild>
        <a href="/login/github">Sign in with GitHub</a>
      </Button>
    </div>
  );
}
