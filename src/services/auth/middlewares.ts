import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { config } from "@/config";
import { authConfig } from "./config";

export const { auth: getSession } = NextAuth({
  ...authConfig,
  trustHost: true,
});

export async function attachSession() {
  try {
    return getSession();
  } catch (_) {}
}

async function getIsUserOnboarded() {
  const session = await getSession();
  return Boolean(session?.user.onboarded);
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
