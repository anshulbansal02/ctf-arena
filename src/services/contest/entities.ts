import {
  pgTable,
  serial,
  timestamp,
  integer,
  text,
  jsonb,
  doublePrecision,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { TB_users } from "../user";
import { TB_teams } from "../team";

export const Enum_contestParticipationType = pgEnum(
  "contest_participation_type",
  ["individual", "team"],
);

export const TB_contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortDescription: text("short_description").default(""),
  description: text("description"),
  unranked: boolean("unranked").default(false),
  game: text("game").notNull(),
  participationType:
    Enum_contestParticipationType("participation_type").notNull(),
  config: jsonb("config").default({}),
  gameState: jsonb("game_state").default({}),
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

export const TB_participantContestChallenges = pgTable(
  "participant_contest_challenges",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => TB_users.id),
    teamId: integer("team_id").references(() => TB_teams.id),
    contestId: integer("contest_id")
      .notNull()
      .references(() => TB_contests.id),
    challengeId: integer("challenge_id").references(
      () => TB_contestChallenges.id,
    ),
    config: jsonb("config").default({}),
    state: jsonb("state").default({}),
  },
);

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
  userId: text("user_id").references(() => TB_users.id),
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  data: jsonb("data").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
