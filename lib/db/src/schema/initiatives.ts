import { pgTable, serial, text, real, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const initiativeStatusEnum = pgEnum("initiative_status", ["active", "completed", "paused"]);
export const milestoneStatusEnum = pgEnum("milestone_status", ["pending", "active", "completed"]);

export const initiativesTable = pgTable("initiatives", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  status: initiativeStatusEnum("status").notNull().default("active"),
  fundingGoal: real("funding_goal").notNull().default(0),
  fundingRaised: real("funding_raised").notNull().default(0),
  volunteerCount: integer("volunteer_count").notNull().default(0),
  creatorName: text("creator_name").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInitiativeSchema = createInsertSchema(initiativesTable).omit({
  id: true,
  fundingRaised: true,
  volunteerCount: true,
  createdAt: true,
  status: true,
});

export type Initiative = typeof initiativesTable.$inferSelect;
export type InsertInitiative = z.infer<typeof insertInitiativeSchema>;

export const milestonesTable = pgTable("milestones", {
  id: serial("id").primaryKey(),
  initiativeId: integer("initiative_id").notNull().references(() => initiativesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetAmount: real("target_amount").notNull().default(0),
  status: milestoneStatusEnum("status").notNull().default("pending"),
  order: integer("order").notNull().default(0),
});

export const insertMilestoneSchema = createInsertSchema(milestonesTable).omit({ id: true });
export type Milestone = typeof milestonesTable.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export const volunteersTable = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  initiativeId: integer("initiative_id").notNull().references(() => initiativesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertVolunteerSchema = createInsertSchema(volunteersTable).omit({ id: true, joinedAt: true });
export type Volunteer = typeof volunteersTable.$inferSelect;
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  initiativeId: integer("initiative_id").notNull().references(() => initiativesTable.id, { onDelete: "cascade" }),
  donorName: text("donor_name").notNull(),
  amount: real("amount").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({ id: true, createdAt: true });
export type Donation = typeof donationsTable.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
