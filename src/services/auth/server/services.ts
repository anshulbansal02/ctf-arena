import { createServerClient } from "@/services/supabase/server";

export async function getSessionUser() {
  const supa = createServerClient();
  const user = await supa.auth.getUser();

  return user;
}

export async function getUser() {
  const session = await getSessionUser();
  return session.data.user!;
}

export async function getIsUserOnboarded() {
  const user = await getUser();

  return Boolean(user.user_metadata.onboarded);
}
