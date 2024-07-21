import {
  pgTable,
  serial,
  uuid,
  timestamp,
  integer,
  text,
  jsonb,
  doublePrecision,
  varchar,
} from "drizzle-orm/pg-core";
import { TB_users } from "../user";
import { TB_teams } from "../team";

export const TB_contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortDescription: text("short_description").default(""),
  description: text("description"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const TB_contestChallenges = pgTable("contest_challenges", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  contestId: integer("contest_id")
    .notNull()
    .references(() => TB_contests.id, {
      onDelete: "cascade",
    }),
  order: integer("order").notNull(),
  maxPoints: integer("max_points").notNull(),
  minPoints: integer("min_points").default(0),
  answer: text("answer").notNull(),
  // How points should depreciated over time (concretely every minute)
  pointsDecayFactor: doublePrecision("points_decay_factor"),
  hints: jsonb("hints").default([]),
});

export const TB_contestSubmissions = pgTable("contest_submissions", {
  id: serial("id").primaryKey(),
  submittedByTeam: integer("submitted_by_team")
    .notNull()
    .references(() => TB_teams.id, { onDelete: "no action" }),
  submittedByUser: text("submitted_by_user")
    .notNull()
    .references(() => TB_users.id, { onDelete: "no action" }),
  timeTaken: integer("time_taken").notNull(),
  submission: text("submission"),
  score: integer("score").notNull(),
  contestId: integer("contest_id")
    .notNull()
    .references(() => TB_contests.id),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => TB_contestChallenges.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const TB_contestEvents = pgTable("contest_events", {
  contestId: integer("contest_id")
    .notNull()
    .references(() => TB_contests.id),
  challengeId: integer("challenge_id").references(
    () => TB_contestChallenges.id,
  ),
  teamId: integer("team_id").references(() => TB_teams.id),
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  data: jsonb("data").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
