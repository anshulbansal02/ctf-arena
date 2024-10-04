import "next-auth/jwt";
import { NextAuthConfig } from "next-auth";

import { config } from "@/config";

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
    user: {
      onboarded: boolean;
      roles: string[];
      id: string;
    };
  }
}

export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ user }) {
      const isOrganizationProvidedEmail = config.app.org.domains.some((org) =>
        user.email?.endsWith(`@${org}`),
      );
      return isOrganizationProvidedEmail;
    },

    async jwt({ token, user, session, trigger }) {
      if (trigger === "update") {
        token.user = { ...token.user, ...session.user };
      }

      if (user) {
        token.user = {
          onboarded: Boolean(user.metadata.onboarded),
          roles: user.metadata.roles ?? [],
          id: user.id!,
        };
      }

      return token;
    },
    session({ session, token }) {
      session.user = { ...session.user, ...token.user };

      return session;
    },
  },
} satisfies NextAuthConfig;
