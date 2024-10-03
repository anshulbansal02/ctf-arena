import { config as appConfig } from "@/config";
import {
  attachSession,
  authenticatedUserRedirectionRules,
} from "@/services/auth/middlewares";
import { NextRequest, NextResponse } from "next/server";

const routesType = {
  // Can only be viewed by authenticated user
  protected: [/^\/onboarding/, /^\/home/, /^\/team/, /^\/contests/, /^\/admin/],
  // Cannot be viewed by authenticated user
  public: [/^\/$/],
  // Can be viewed by all users irrespective of authentication
  common: [/^\/team\/invite\/\w+/],
};

function isRouteType(patterns: Array<RegExp>, route: string): boolean {
  return patterns.some((pattern) => pattern.test(route));
}

export async function middleware(request: NextRequest) {
  const session = await attachSession();

  const route = request.nextUrl.pathname;

  if (isRouteType(routesType.common, route)) return;

  if (isRouteType(routesType.protected, route)) {
    if (!(session && session.user))
      return NextResponse.redirect(
        new URL(appConfig.routes.default.NO_AUTH, request.url),
      );
    else return authenticatedUserRedirectionRules(request);
  } else if (isRouteType(routesType.public, route)) {
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
