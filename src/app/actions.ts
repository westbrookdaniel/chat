"use server";

import { and, db, eq, threadTable } from "@/db";
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from "@/lib/session";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const { session } = await getCurrentSession();
  if (!session) return;

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect("/login");
}

export async function createThread({
  userId,
  messages,
  search,
  thinking,
}: {
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages?: any[];
  thinking?: boolean;
  search?: boolean;
}) {
  const result = await db
    .insert(threadTable)
    .values({
      title: "Untitled",
      userId: userId,
      data: {
        messages: messages ?? [],
        thinking,
        search,
      },
    })
    .returning();

  const newThread = result[0];
  if (!newThread) throw new Error("Internal Server Error");
  return newThread;
}

export async function deleteThread({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) {
  const result = await db
    .delete(threadTable)
    .where(and(eq(threadTable.id, id), eq(threadTable.userId, userId)))
    .returning();

  const deletedThread = result[0];
  if (!deletedThread) throw new Error("Internal Server Error");
  return deletedThread;
}

export async function renameThread({
  userId,
  id,
  title,
}: {
  userId: string;
  id: string;
  title: string;
}) {
  const result = await db
    .update(threadTable)
    .set({ title })
    .where(and(eq(threadTable.id, id), eq(threadTable.userId, userId)))
    .returning();

  const updatedThread = result[0];
  if (!updatedThread) throw new Error("Internal Server Error");
  return updatedThread;
}
