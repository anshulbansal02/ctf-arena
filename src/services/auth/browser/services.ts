"use client";

import { createBrowserClient } from "@/services/supabase/browser";

type AuthProvider = "azure";

export async function signInWith(provider: AuthProvider) {
  console.log("Called signInWith");

  const supa = createBrowserClient();

  return await supa.auth.signInWithOAuth({
    provider,
    options: {
      scopes: "profile email offline_access",
      redirectTo: "http://localhost:3000/auth/callback",
    },
  });
}

export async function signOut() {
  const supa = createBrowserClient();

  await supa.auth.signOut();
}
