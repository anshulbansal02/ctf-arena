import { config } from "@/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/services/**/entities.ts"],

  dialect: "postgresql",
  out: "./db",
  dbCredentials: {
    ssl: false,
    database: "arena",
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
  },
});
