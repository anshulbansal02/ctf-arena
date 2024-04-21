import { config } from "@/config";
import { createBrowserClient as supabaseBrowserClient } from "@supabase/ssr";
import { Database } from "../database.schema";

export function createBrowserClient() {
  return supabaseBrowserClient<Database>(
    config.supabase.projectURL,
    config.supabase.projectKey,
  );
}
