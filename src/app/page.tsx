import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { Chat } from "./chat";

export default async function Page() {
  const { user } = await getCurrentSession();

  if (user === null) {
    return redirect("/login");
  }

  return <Chat user={user} />;
}
