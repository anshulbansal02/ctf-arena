"use server";
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { EmailConfig } from "next-auth/providers";

import { config } from "@/config";
import { getEmailService } from "@/services/email";
import { db } from "@/services/db";
import {
  TB_userAccounts,
  TB_users,
  TB_userVerificationTokens,
} from "@/services/user";
import { authConfig } from "./config";
import { RateLimiter } from "@/lib/rate-limiter";
import { headers } from "next/headers";

RateLimiter.new("auth:sign_in:ip", { windowMs: 10_000, maxRequests: 100 });
RateLimiter.new("auth:sign_in:email", { windowMs: 30_000, maxRequests: 2 });

const sendVerificationRequestEmail: EmailConfig["sendVerificationRequest"] =
  async (params) => {
    const emailService = getEmailService();

    const magicLink = new URL(
      `/letmein?${new URLSearchParams({ token: params.token, identifier: params.identifier })}`,
      config.host,
    ).toString();

    if (config.stage === "dev")
      return console.info({
        magicLink,
        token: params.token,
        email: params.identifier,
        rawLink: params.url,
      });

    emailService.send({
      address: {
        from: config.app.sourceEmailAddress.auth,
        to: params.identifier,
      },
      body: await emailService.renderTemplate("auth-verification-request", {
        magicLink,
        expires: params.expires,
        userEmail: params.identifier,
      }),
      subject: "Authentication Request",
    });
  };

const {
  handlers,
  signIn: authSignIn,
  signOut,
  auth,
  unstable_update,
} = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: TB_users,
    accountsTable: TB_userAccounts,
    verificationTokensTable: TB_userVerificationTokens,
  }),
  secret: config.auth.secret,
  trustHost: true,
  ...authConfig,
  providers: [
    {
      id: "magic-link",
      name: "Email",
      type: "email",
      secret: config.auth.secret,
      maxAge: 60 * 60 * 4,
      from: config.app.sourceEmailAddress.auth,
      options: {},
      sendVerificationRequest: sendVerificationRequestEmail,
    },
  ],
});

async function getHandlers() {
  return handlers;
}

async function signIn(
  ...args: Parameters<typeof authSignIn>
): ReturnType<typeof authSignIn> {
  const requestor = headers().get("x-forwarded-for") ?? "global";

  const isAllowed =
    (await RateLimiter.of("auth:sign_in:ip")!.allows(requestor)) &&
    (await RateLimiter.of("auth:sign_in:email")!.allows(
      (args[1] as Record<string, string>)["email"],
    ));
  if (!isAllowed)
    return {
      error: `Your request to sign in was not processed. Please wait for a while to use this action again. If you think it's an error please contact ${config.app.sourceEmailAddress.support}`,
    };

  return authSignIn(...args);
}

export {
  getHandlers,
  signIn,
  signOut,
  auth as getSession,
  unstable_update as updateSession,
};
