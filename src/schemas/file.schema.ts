import { relations } from "drizzle-orm";
import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { postingsTable } from "./posting.schema";

export const filesTable = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  posting_id: uuid("posting_id")
    .notNull()
    .references(() => postingsTable.id, { onDelete: "cascade" }), // [ref: > Posting.id]
  url: text().notNull(),
  filename: text().notNull(),
  file_size: bigint({ mode: "bigint" }).notNull(),
  upload_at: timestamp().notNull(),
});

export const files = relations(filesTable, ({ one }) => ({
  posting: one(postingsTable, {
    fields: [filesTable.posting_id],
    references: [postingsTable.id],
  }),
}));
