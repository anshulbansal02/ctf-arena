import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "@/config";

const client = postgres(config.db.url);

export const db = drizzle(client);
