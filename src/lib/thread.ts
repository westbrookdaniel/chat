"use server";

import { desc, db, eq, threadTable, userTable } from "@/db";
import { UserWithThreads } from "./session";

export async function getUser(
  userId: string,
): Promise<UserWithThreads | undefined> {
  return db.query.userTable.findFirst({
    where: eq(userTable.id, userId),
    with: {
      threads: {
        orderBy: [desc(threadTable.updatedAt)],
      },
    },
  });
}
