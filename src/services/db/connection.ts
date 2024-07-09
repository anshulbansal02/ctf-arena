import { config } from "@/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

export const connection = new Client({
  database: "arena",
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
});

export const db = drizzle(connection);
