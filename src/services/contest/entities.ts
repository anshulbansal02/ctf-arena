import {
  pgTable,
  serial,
  uuid,
  timestamp,
  integer,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { TB_users } from "../user";
import { TB_teams } from "../team";

export const TB_contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const TB_contestSubmissions = pgTable("contests_submissions", {
  id: serial("id").primaryKey(),
  submittedByTeam: integer("submitted_by_team")
    .notNull()
    .references(() => TB_teams.id, { onDelete: "no action" }),
  submittedByUser: uuid("submitted_by_user")
    .notNull()
    .references(() => TB_users.id, { onDelete: "no action" }),
  submission: text("submission"),
  contestId: integer("contest_id").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
