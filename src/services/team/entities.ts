import {
  pgTable,
  serial,
  varchar,
  uuid,
  timestamp,
  integer,
  pgEnum,
  index,
  jsonb,
  pgView,
} from "drizzle-orm/pg-core";
import { TB_users } from "../user";
import { eq, isNull } from "drizzle-orm";

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

export const TB_teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  leader: uuid("leader")
    .notNull()
    .unique()
    .references(() => TB_users.id, { onDelete: "restrict" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const TB_teamMembers = pgTable(
  "team_members",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => TB_users.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => TB_teams.id, { onDelete: "no action" }),
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
    .references(() => TB_teams.id, { onDelete: "cascade" }),
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

export const View_currentTeamMembers = pgView("current_team_members").as((q) =>
  q
    .select({
      teamId: TB_teams.id,
      teamName: TB_teams.name,
      memberId: TB_teamMembers.userId,
    })
    .from(TB_teams)
    .leftJoin(TB_teamMembers, eq(TB_teams.id, TB_teamMembers.teamId))
    .where(isNull(TB_teamMembers.leftAt)),
);
