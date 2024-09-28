import "next-auth/jwt";
import { NextAuthConfig } from "next-auth";
import EntraID from "next-auth/providers/microsoft-entra-id";

import { config } from "@/config";
import { sendVerificationRequest } from ".";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      onboarded: boolean;
      roles: string[];
    };
  }

  interface User {
    metadata: { onboarded: boolean; roles: string[] };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    onboarded: boolean;
    roles: string[];
    userId: string;
  }
}

export const authConfig = {
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
      maxAge: 60 * 60 * 4, // Email link will expire in 4 hours
      from: config.app.sourceEmailAddressForAuth,
      options: {},
      sendVerificationRequest,
    },
  ],
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ user }) {
      const isOrganizationProvidedEmail = config.app.organizations.some((org) =>
        user.email?.endsWith(`@${org}`),
      );
      return isOrganizationProvidedEmail;
    },

    async jwt({ token, user, session }) {
      if (user) {
        token.onboarded = Boolean(user.metadata.onboarded);
        token.roles = user.metadata.roles;
        token.userId = user.id!;
      } else if (session?.user.onboarded) {
        token.onboarded = true;
      }
      return token;
    },
    session({ session, token }) {
      session.user.onboarded = token.onboarded;
      session.user.roles = token.roles;
      session.user.id = token.userId;
      return session;
    },
  },
} satisfies NextAuthConfig;
