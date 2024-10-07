import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  pgEnum,
  index,
  jsonb,
  pgView,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { TB_users } from "@/services/user/entities";
import { eq, isNull } from "drizzle-orm";

export const Enum_teamRequestStatus = pgEnum("team_request_status", [
  "queued",
  "sent",
  "delivered",
  "accepted",
  "cancelled",
  "rejected",
]);

export const Enum_teamRequestType = pgEnum("team_request_type", [
  "invite",
  "request",
]);

export const TB_teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  abandoned: boolean("abandoned").default(false),
  leader: text("leader")
    .unique()
    .references(() => TB_users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const TB_teamMembers = pgTable(
  "team_members",
  {
    userId: text("user_id")
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
  // Invite sent by team/Request sent to team
  teamId: integer("team_id")
    .notNull()
    .references(() => TB_teams.id, { onDelete: "cascade" }),
  // Queued/Delivered/Accepted/Cancelled/Rejected
  status: Enum_teamRequestStatus("status").notNull().default("queued"),
  // Request/Invite
  type: Enum_teamRequestType("type").notNull(),
  // User who sent sent Request/Invite
  createdBy: text("created_by").notNull(),
  // Invitee email
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
