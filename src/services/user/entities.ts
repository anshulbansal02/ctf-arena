import {
  pgTable,
  serial,
  varchar,
  uuid,
  timestamp,
  pgEnum,
  pgSchema,
} from "drizzle-orm/pg-core";

export const Enum_userNotificationStatus = pgEnum("user_notification_status", [
  "queued",
  "delivered",
  "seen",
]);

export const TB_userNotifications = pgTable("user_notifications", {
  id: serial("id").primaryKey(),
  status: Enum_userNotificationStatus("status").notNull().default("queued"),
  for_user_id: uuid("for_user_id")
    .notNull()
    .references(() => TB_users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const SupabaseAuthSchema = pgSchema("auth");
const SupabaseAuthUsers = SupabaseAuthSchema.table("users", {
  id: uuid("id").primaryKey().notNull(),
});

export const TB_users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .notNull()
    .references(() => SupabaseAuthUsers.id, { onDelete: "cascade" }),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("full_name", { length: 100 }).notNull(),
  metadata: varchar("full_name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
