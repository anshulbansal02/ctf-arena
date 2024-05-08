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
