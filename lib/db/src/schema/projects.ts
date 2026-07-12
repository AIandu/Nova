import { boolean, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectStatusEnum = pgEnum("project_status", [
  "prototype",
  "in_development",
  "deployed",
]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  oneLiner: text("one_liner").notNull(),
  capabilities: text("capabilities").array().notNull().default([]),
  status: projectStatusEnum("status").notNull().default("prototype"),
  technicalNote: text("technical_note"),
  linkedinUrl: text("linkedin_url"),
  whitepaper: text("whitepaper"),
  price: text("price"),
  imageUrl: text("image_url"),
  featured: boolean("featured").notNull().default(false),
  labVisible: boolean("lab_visible").notNull().default(true),
  storefrontVisible: boolean("storefront_visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
