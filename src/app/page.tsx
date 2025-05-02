import { redirect } from "next/navigation";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "@/lib/session";

export default async function Page() {
  const { user } = await getCurrentSession();
  if (user === null) {
    return redirect("/login");
  }
  return (
    <div>
      <h1>Hi, {user.username}!</h1>;
      <form action={logout}>
        <button>Sign out</button>
      </form>
    </div>
  );
}

async function logout() {
  "use server";
  const { session } = await getCurrentSession();
  if (!session) return;

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect("/login");
}
