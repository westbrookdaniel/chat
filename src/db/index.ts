import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// all this is to avoid connection pool errors
// https://github.com/drizzle-team/drizzle-orm/issues/928
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace global {
  let postgresSqlClient: ReturnType<typeof postgres> | undefined;
}

let postgresSqlClient: ReturnType<typeof postgres> | undefined;

if (process.env.NODE_ENV !== "production") {
  if (!global.postgresSqlClient) {
    global.postgresSqlClient = postgres(process.env.DATABASE_URL!);
  }
  postgresSqlClient = global.postgresSqlClient;
} else {
  postgresSqlClient = postgres(process.env.DATABASE_URL!);
}

export const db = drizzle(postgresSqlClient, { schema, casing: "snake_case" });

export * from "drizzle-orm";
export * from "./schema";
