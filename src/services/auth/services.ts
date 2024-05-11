"use server";
import { createServerClient } from "@/services/supabase/server";

export async function getSessionUser() {
  const supa = createServerClient();
  const user = await supa.auth.getUser();

  return user;
}

export async function getUser() {
  const supa = createServerClient();
  const session = await supa.auth.getSession();
  return session.data.session?.user!;
}

export async function getIsUserOnboarded() {
  const user = await getUser();

  return Boolean(user.user_metadata.onboarded);
}

export async function setUserOnboarded() {
  const supa = createServerClient();

  await supa.auth.updateUser({
    data: {
      onboarded: true,
    },
  });
}
