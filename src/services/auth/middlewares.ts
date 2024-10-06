"use server";
import NextAuth, { Session } from "next-auth";
import { VerificationToken } from "next-auth/adapters";
import { NextRequest, NextResponse } from "next/server";

import { config } from "@/config";
import { authConfig } from "./config";

const { auth: getSession } = NextAuth({
  ...authConfig,
  adapter: {
    createVerificationToken: (_: VerificationToken) => undefined,
    useVerificationToken: (_: { identifier: string; token: string }) => null,
    getUserByEmail: (_: string) => null,
  },
  trustHost: true,
});

export async function attachSession() {
  try {
    return getSession();
  } catch (_) {}
}

async function getIsUserOnboarded(session: Session) {
  return Boolean(session?.user.onboarded);
}

export async function authenticatedUserRedirectionRules(
  request: NextRequest,
  session: Session,
) {
  const route = request.nextUrl.pathname;

  // Check if authenticated user is onboarded
  const isUserOnboarded = await getIsUserOnboarded(session);

  if (isUserOnboarded && route === "/onboarding") {
    return NextResponse.redirect(
      new URL(config.routes.default.AUTH, request.url),
    );
  } else if (!isUserOnboarded && route !== "/onboarding") {
    return NextResponse.redirect(new URL("onboarding", request.url));
  }
}
