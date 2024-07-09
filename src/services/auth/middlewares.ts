import { config } from "@/config";
import { NextRequest, NextResponse } from "next/server";
import { getIsUserOnboarded, getSession } from "./services";

export async function attachSession() {
  try {
    getSession();
  } catch (_) {}
}

export async function authenticatedUserRedirectionRules(request: NextRequest) {
  const route = request.nextUrl.pathname;

  // Check if authenticated user is onboarded
  const isUserOnboarded = await getIsUserOnboarded();
  if (isUserOnboarded && route === "/onboarding") {
    return NextResponse.redirect(
      new URL(config.routes.default.AUTH, request.url),
    );
  } else if (!isUserOnboarded && route !== "/onboarding") {
    return NextResponse.redirect(new URL("onboarding", request.url));
  }
}
