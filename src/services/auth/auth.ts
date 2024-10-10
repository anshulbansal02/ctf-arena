"use server";
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { EmailConfig } from "next-auth/providers";
import EntraID from "next-auth/providers/microsoft-entra-id";

import { config } from "@/config";
import { getEmailService } from "@/services/email";
import { db } from "@/services/db";
import {
  TB_userAccounts,
  TB_users,
  TB_userVerificationTokens,
} from "@/services/user";
import { authConfig } from "./config";

const sendVerificationRequestEmail: EmailConfig["sendVerificationRequest"] =
  async (params) => {
    const emailService = getEmailService();

    const magicLink = new URL(
      `/api/auth/callback/magic-link?${new URLSearchParams({ token: params.token, email: params.identifier })}`,
      config.host,
    ).toString();

    if (config.stage === "dev") return console.info({ magicLink });

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

const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: TB_users,
    accountsTable: TB_userAccounts,
    verificationTokensTable: TB_userVerificationTokens,
  }),

  trustHost: true,
  ...authConfig,
  providers: [
    EntraID({
      clientId: config.auth.azure.accountId,
      clientSecret: config.auth.azure.secret,
      tenantId: config.auth.azure.tenantId,
    }),
    {
      id: "magic-link",
      name: "Email",
      type: "email",
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

export {
  getHandlers,
  signIn,
  signOut,
  auth as getSession,
  unstable_update as updateSession,
};
