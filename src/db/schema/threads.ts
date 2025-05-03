import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";
import { userTable } from "./users";

export const threadTable = pgTable("thread", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  title: text("title").notNull(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: json("data").notNull().$type<{ messages?: any[] }>(),

  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const threadRelations = relations(threadTable, ({ one }) => ({
  user: one(userTable, {
    fields: [threadTable.userId],
    references: [userTable.id],
  }),
}));

export type Thread = InferSelectModel<typeof threadTable>;
