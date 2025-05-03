import { redirect } from "next/navigation";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "@/lib/session";
import { Chat } from "./chat";

export default async function Page() {
  const { user } = await getCurrentSession();

  if (user === null) {
    return redirect("/login");
  }

  return <Chat user={user} logoutAction={logoutAction} />;
}

async function logoutAction() {
  "use server";
  const { session } = await getCurrentSession();
  if (!session) return;

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect("/login");
}
