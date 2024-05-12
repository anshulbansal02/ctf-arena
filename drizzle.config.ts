import { config } from "@/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/services/**/entities.ts"],
  dialect: "postgresql",
  out: "./db",
  dbCredentials: {
    url: config.db.url,
  },
});
