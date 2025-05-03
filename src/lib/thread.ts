"use server";

import { db, eq, userTable } from "@/db";
import { UserWithThreads } from "./session";

export async function getUser(
  userId: string,
): Promise<UserWithThreads | undefined> {
  return db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
    with: { threads: true },
  });
}
