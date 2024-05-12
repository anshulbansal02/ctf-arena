import { config } from "@/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

const connection = new Client({
  connectionString: config.db.url,
});

await connection.connect();
export const db = drizzle(connection);
