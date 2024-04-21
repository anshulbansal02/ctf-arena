"use server";
import { createServerClient } from "@/services/supabase/server";

export async function setUserOnboarded() {
  const supa = createServerClient();

  await supa.auth.updateUser({
    data: {
      onboarded: true,
    },
  });
}
