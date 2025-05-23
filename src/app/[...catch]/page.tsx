import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { ChatRouter } from "../chat-router";

export default async function Page() {
  const { user } = await getCurrentSession();

  if (user === null) {
    return redirect("/login");
  }

  return <ChatRouter user={user} />;
}
