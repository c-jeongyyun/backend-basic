import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { postingsTable } from "modules/posting/posting.schema";

export const commentsTable = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  content: text().notNull(),
  posting_id: uuid("posting_id").notNull(), //  [ref: > Posting.id],
  parent_comment_id: uuid("parent_comment_id"), // [ref: > Comment.id],
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  posting: one(postingsTable, {
    fields: [commentsTable.posting_id],
    references: [postingsTable.id],
  }),
  parent_comment: one(commentsTable, {
    fields: [commentsTable.parent_comment_id],
    references: [commentsTable.id],
  }),
  nested_comments: many(commentsTable),
}));
