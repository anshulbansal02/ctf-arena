import { NextAuthConfig } from "next-auth";
import EntraID from "next-auth/providers/microsoft-entra-id";

import { config } from "@/config";

declare module "next-auth" {
  // interface Session {
  //   user: {
  //     id: string;
  //     name: string;
  //     email: string;
  //   };
  // }

  interface User {
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
      token.onboarded = user.onboarded;

      return token;
    },
    session({ session, token }) {
      session.user.onboarded = token.onboarded;
      return session;
    },
  },
} satisfies NextAuthConfig;
