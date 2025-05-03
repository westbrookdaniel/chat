import type { UserWithThreads } from "@/lib/session";
import { Prompt } from "./prompt";

export function Landing({
  user,
  createThread,
}: {
  user: UserWithThreads;
  createThread: () => void;
}) {
  const name = user.fullName ? user.fullName.split(" ")[0] : user.username;

  return (
    <div className="flex flex-col h-full items-center justify-center">
      <p className="mb-6 text-2xl font-medium text-neutral-400">
        Good Morning, {name}
      </p>
      <div className="pb-8 px-8 lg:px-16 mx-auto w-full max-w-4xl">
        <Prompt />
      </div>
    </div>
  );
}
