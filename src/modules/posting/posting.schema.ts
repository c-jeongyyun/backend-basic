import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { commentsTable } from "modules/comment/comment.schema";
import { filesTable } from "modules/file/file.schema";

export const postingsTable = pgTable("postings", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: varchar({ length: 255 }).notNull(),
  title: text().notNull(),
  content: text().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});

export const postingRelations = relations(postingsTable, ({ one, many }) => ({
  comments: many(commentsTable),
  files: many(filesTable),
}));
