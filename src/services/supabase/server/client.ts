import { config } from "@/config";
import {
  createServerClient as supabaseServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "../database.schema";

export function createServerClient() {
  const cookieStore = cookies();

  return supabaseServerClient<Database>(
    config.supabase.projectURL,
    config.supabase.adminKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (_) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (_) {}
        },
      },
    },
  );
}
