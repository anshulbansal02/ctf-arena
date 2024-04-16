import { createServerClient } from "@/services/supabase/server";
import { getIsUserOnboarded } from "./services";
import { NextRequest, NextResponse } from "next/server";
import { config } from "@/config";

export async function attachSession() {
  try {
    const supabase = createServerClient();
    return await supabase.auth.getUser();
  } catch (_) {}
}

export async function authenticatedUserRedirectionRules(request: NextRequest) {
  const route = request.nextUrl.pathname;

  // Check if authenticated user is onboarded
  const isUserOnboarded = await getIsUserOnboarded();
  if (isUserOnboarded && route === "/u/onboarding") {
    return NextResponse.redirect(
      new URL(config.routes.default.AUTH, request.url),
    );
  } else if (!isUserOnboarded && route !== "/u/onboarding") {
    return NextResponse.redirect(new URL("onboarding", request.url));
  }
}
