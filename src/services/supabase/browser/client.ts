import { config } from "@/config";
import { createBrowserClient as supabaseBrowserClient } from "@supabase/ssr";

export function createBrowserClient() {
  return supabaseBrowserClient(
    config.supabase.projectURL,
    config.supabase.projectKey
  );
}
