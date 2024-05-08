import {
  pgTable,
  serial,
  varchar,
  uuid,
  timestamp,
  integer,
  pgEnum,
  text,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

export const Enum_teamRequestStatus = pgEnum("team_request_status", [
  "queued",
  "delivered",
  "accepted",
  "rejected",
]);

export const Enum_teamRequestType = pgEnum("team_request_type", [
  "invite",
  "request",
]);

export const Enum_userNotificationStatus = pgEnum("team_request_type", [
  "queued",
  "delivered",
  "seen",
]);

export const TB_teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  leader: uuid("leader")
    .notNull()
    .unique()
    .references(() => TB_users.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const TB_teamMembers = pgTable(
  "team_members",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => TB_users.id),
    teamId: integer("team_id")
      .notNull()
      .references(() => TB_teams.id),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
    leftAt: timestamp("left_at"),
  },
  (table) => {
    return {
      teamsIndex: index("team_members_team_index").on(table.teamId),
      userTeamIndex: index("team_members_user_team_index").on(
        table.userId,
        table.teamId,
        table.leftAt,
      ),
    };
  },
);

export const TB_teamRequest = pgTable("team_requests", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => TB_teams.id),
  status: Enum_teamRequestStatus("status").notNull().default("queued"),
  type: Enum_teamRequestType("type").notNull(),
  createdBy: uuid("created_by").notNull(),
  userEmail: varchar("user_email", { length: 255 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

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
    .references(() => TB_teams.id),
  submittedByUser: uuid("submitted_by_user")
    .notNull()
    .references(() => TB_users.id),
  submission: text("submission"),
  contestId: integer("contest_id").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const TB_userNotifications = pgTable("user_notifications", {
  id: serial("id").primaryKey(),
  status: Enum_userNotificationStatus("status").notNull().default("queued"),
  for_user_id: uuid("for_user_id")
    .notNull()
    .references(() => TB_users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const TB_users = pgTable("users", {
  id: uuid("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("full_name", { length: 100 }).notNull(),
  metadata: varchar("full_name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
