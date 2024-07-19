import { NextAuthConfig } from "next-auth";
import EntraID from "next-auth/providers/microsoft-entra-id";

import { config } from "@/config";
import { JWT } from "next-auth/jwt";

import type { AdapterUser as BaseAdapterUser } from "next-auth/adapters";

declare module "@auth/core/adapters" {
  interface AdapterUser extends BaseAdapterUser {
    metadata: { onboarded: boolean };
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      onboarded: boolean;
    };
  }

  interface User {
    metadata: { onboarded: boolean };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    onboarded: boolean;
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
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, session }) {
      if (user) {
        token.onboarded = Boolean(user.metadata.onboarded);
        token.userId = user.id!;
      } else if (session?.user.onboarded) {
        token.onboarded = true;
      }
      return token;
    },
    session({ session, token }) {
      session.user.onboarded = token.onboarded;
      session.user.id = token.userId;
      return session;
    },
  },
} satisfies NextAuthConfig;
