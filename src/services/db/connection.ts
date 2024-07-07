import { config } from "@/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

export const connection = new Client({
  connectionString: config.db.url,
});

export const db = drizzle(connection);
