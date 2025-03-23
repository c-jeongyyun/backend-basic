import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { commentsTable } from "schemas/comment.schema";
import { filesTable } from "./file.schema";

export const postingsTable = pgTable("postings", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  title: text().notNull(),
  content: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const postingRelations = relations(postingsTable, ({ one, many }) => ({
  comments: many(commentsTable),
  files: many(filesTable),
}));
