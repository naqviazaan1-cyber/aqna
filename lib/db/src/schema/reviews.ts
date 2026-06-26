import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emailHash: text("email_hash").notNull().unique(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({
  id: true,
  createdAt: true,
});

export const selectReviewSchema = createSelectSchema(reviewsTable).omit({
  emailHash: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = z.infer<typeof selectReviewSchema>;
