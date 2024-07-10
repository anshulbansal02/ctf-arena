import { NextAuthConfig } from "next-auth";
import EntraID from "next-auth/providers/microsoft-entra-id";

import { config } from "@/config";
import { JWT } from "next-auth/jwt";

import type { AdapterUser as BaseAdapterUser } from "next-auth/adapters";

declare module "@auth/core/adapters" {
  interface AdapterUser extends BaseAdapterUser {
    metadata: any;
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
    metadata: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    onboarded: boolean;
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
    jwt({ token, user }) {
      token.onboarded = Boolean(user.metadata.onboarded);
      return token;
    },
    session({ session, token }) {
      session.user.onboarded = token.onboarded;
      return session;
    },
  },
} satisfies NextAuthConfig;
