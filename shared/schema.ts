import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the puzzles table
export const puzzles = pgTable("puzzles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").default(true).notNull(),
});

// Define the hints table related to puzzles
export const hints = pgTable("hints", {
  id: serial("id").primaryKey(),
  puzzleId: integer("puzzle_id").notNull(),
  rowIndex: integer("row_index").notNull(),
  text: text("text").notNull(),
  answer: text("answer").notNull(),
});

// Define insert schemas
export const insertPuzzleSchema = createInsertSchema(puzzles).pick({
  name: true,
  active: true,
});

export const insertHintSchema = createInsertSchema(hints).pick({
  puzzleId: true,
  rowIndex: true,
  text: true,
  answer: true,
});

// Define types
export type InsertPuzzle = z.infer<typeof insertPuzzleSchema>;
export type Puzzle = typeof puzzles.$inferSelect;

export type InsertHint = z.infer<typeof insertHintSchema>;
export type Hint = typeof hints.$inferSelect;

// Define the puzzle with hints type for the complete puzzle data
export type PuzzleWithHints = Puzzle & {
  hints: Hint[];
};

// Keep the users table for compatibility with existing code
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
