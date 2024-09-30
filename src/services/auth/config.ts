import "next-auth/jwt";
import { NextAuthConfig } from "next-auth";
import { EmailConfig } from "next-auth/providers";
import EntraID from "next-auth/providers/microsoft-entra-id";

import { config } from "@/config";
import { getEmailService } from "@/services/email";

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

const sendVerificationRequestEmail: EmailConfig["sendVerificationRequest"] =
  async (params) => {
    const emailService = getEmailService();

    if (config.stage === "dev") {
      const { request, ...rest } = params;
      return console.table(rest);
    }

    emailService.send({
      address: {
        from: config.app.sourceEmailAddress.auth,
        to: params.identifier,
      },
      body: await emailService.renderTemplate("auth-verification-request", {
        authUrl: params.url,
        expires: params.expires,
        userEmail: params.identifier,
      }),
      subject: "Authentication Request",
    });
  };

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
      maxAge: 60 * 60 * 4,
      from: config.app.sourceEmailAddress.auth,
      options: {},
      sendVerificationRequest: sendVerificationRequestEmail,
    },
  ],
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
