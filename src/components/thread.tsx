import type { Thread } from "@/db";
import { Prompt } from "./prompt";

export function ThreadView({ thread }: { thread: Thread }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1" />
      <div className="pb-8 px-8 lg:px-16 mx-auto w-full max-w-4xl">
        <Prompt />
      </div>
    </div>
  );
}
