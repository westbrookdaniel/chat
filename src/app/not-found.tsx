import { NavigationClient } from "@/components/navigation-client";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function NotFound() {
  const { user } = await getCurrentSession();

  if (user === null) {
    return redirect("/login");
  }

  return (
    <NavigationClient user={user} active={null}>
      <NotFoundInner />
    </NavigationClient>
  );
}

function NotFoundInner() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-9xl font-bold text-muted-foreground/20 mb-2">
          404
        </h1>
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">Not Found</h2>
          <p className="text-muted-foreground mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have moved, or you may not have access to it.
          </p>
        </div>
      </div>
    </div>
  );
}

