import { NextAuthConfig } from "next-auth";
import EntraID from "next-auth/providers/microsoft-entra-id";

import { config } from "@/config";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      onboarded: boolean;
      role?: string;
    };
  }

  interface User {
    metadata: { onboarded: boolean; role?: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    onboarded: boolean;
    role?: string;
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
        token.role = user.metadata.role;
        token.userId = user.id!;
      } else if (session?.user.onboarded) {
        token.onboarded = true;
      }
      return token;
    },
    session({ session, token }) {
      session.user.onboarded = token.onboarded;
      session.user.role = token.role;
      session.user.id = token.userId;
      return session;
    },
  },
} satisfies NextAuthConfig;
