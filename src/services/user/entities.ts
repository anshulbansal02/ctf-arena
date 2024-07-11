import {
  pgTable,
  serial,
  uuid,
  timestamp,
  pgEnum,
  jsonb,
  text,
  integer,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";
import { AdapterAccountType } from "next-auth/adapters";

export const Enum_userNotificationStatus = pgEnum("user_notification_status", [
  "queued",
  "delivered",
  "seen",
]);

export const TB_users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const TB_userAccounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => TB_users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const TB_userNotifications = pgTable("user_notifications", {
  id: serial("id").primaryKey(),
  status: Enum_userNotificationStatus("status").notNull().default("queued"),
  forUser: text("for_user_id")
    .notNull()
    .references(() => TB_users.id, { onDelete: "cascade" }),
  content: jsonb("content").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
