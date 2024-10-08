import { config } from "@/config";
import { defineConfig } from "drizzle-kit";

console.log(process.env);

export default defineConfig({
  schema: ["./src/services/**/entities.ts"],

  dialect: "postgresql",
  out: "./db",

  dbCredentials: {
    ssl: config.stage === "prod" ? { rejectUnauthorized: false } : false,
    database: config.db.name,
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
  },
});
