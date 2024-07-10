import { config } from "@/config";
import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "./config";
import { getIsUserOnboarded } from "./services";

export const { auth: getSession } = NextAuth(authConfig);

export async function attachSession() {
  try {
    return getSession();
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
