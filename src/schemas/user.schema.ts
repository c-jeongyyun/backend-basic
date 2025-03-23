import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(), // TODO 왜 column명이 id 가 아니라 uuid로 생기지
  user_id: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});
