"use client";

import { config } from "@/config";
import { createBrowserClient } from "@/services/supabase/browser";

type AuthProvider = "azure";

export async function signInWith(provider: AuthProvider) {
  const supa = createBrowserClient();

  return await supa.auth.signInWithOAuth({
    provider,
    options: {
      scopes: "profile email offline_access",
      redirectTo: new URL(
        config.routes.auth.cbRedirectPath,
        window.location.origin,
      ).href,
    },
  });
}

export async function signOut() {
  const supa = createBrowserClient();

  await supa.auth.signOut();
}
