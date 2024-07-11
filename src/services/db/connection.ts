import { config } from "@/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const connection = new Pool({
  database: "arena",
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
});

export const db = drizzle(connection);
