import { doublePrecision, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const decisions = pgTable("decisions", {
  id: serial("id").primaryKey(),
  context: text("context").notNull(),
  options: text("options").array().notNull().default([]),
  chosen: text("chosen").notNull(),
  prediction: text("prediction").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  primaryRisk: text("primary_risk").notNull(),
  outcome: text("outcome"),
  lesson: text("lesson"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertDecisionSchema = createInsertSchema(decisions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = z.infer<typeof insertDecisionSchema>;
