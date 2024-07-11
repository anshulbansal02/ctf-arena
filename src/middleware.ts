import { config as appConfig } from "@/config";
import {
  attachSession,
  authenticatedUserRedirectionRules,
} from "@/services/auth/middlewares";
import { NextRequest, NextResponse } from "next/server";

const routesType = {
  // Can only be viewed by authenticated user
  protected: [
    /^\/onboarding/,
    /^\/home/,
    /^\/team/,
    /^\/contest\/[a-zA-Z0-9]+\/arena/,
  ],
  // Cannot be viewed by authenticated user
  public: [/^\/$/],
};

function isRouteType(patterns: Array<RegExp>, route: string): boolean {
  return patterns.some((pattern) => pattern.test(route));
}

export async function middleware(request: NextRequest) {
  const session = await attachSession();

  if (isRouteType(routesType.protected, request.nextUrl.pathname)) {
    if (!(session && session.user))
      return NextResponse.redirect(
        new URL(appConfig.routes.default.NO_AUTH, request.url),
      );
    else return authenticatedUserRedirectionRules(request);
  } else if (isRouteType(routesType.public, request.nextUrl.pathname)) {
    if (session && session.user) {
      return NextResponse.redirect(
        new URL(appConfig.routes.default.AUTH, request.url),
      );
    }
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
