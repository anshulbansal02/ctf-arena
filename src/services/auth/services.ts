import NextAuth from "next-auth";
import EntraID from "next-auth/providers/microsoft-entra-id";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { db } from "../db";
import {
  TB_userAccounts,
  TB_users,
  TB_userSessions,
  TB_userVerificationTokens,
} from "../user";
import { eq, sql } from "drizzle-orm";
import { cache } from "../cache";
import { config } from "@/config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
}

const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    EntraID({
      clientId: config.auth.azure.accountId,
      clientSecret: config.auth.azure.secret,
    }),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: TB_users,
    accountsTable: TB_userAccounts,
    sessionsTable: TB_userSessions,
    verificationTokensTable: TB_userVerificationTokens,
  }),
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;

      return session;
    },
  },
});

export async function getSession() {
  return await auth();
}

export async function getAuthUser() {
  const session = await auth();
  return session?.user!;
}

export async function getIsUserOnboarded() {
  const authUser = await getAuthUser();

  if (!authUser) throw new Error("User is not authenticated");

  const isOnboarded = cache.sIsMember("cache:users:onboarded", authUser.id);

  if (!isOnboarded) {
    const [{ metadata }] = await db
      .select({ metadata: TB_users.metadata })
      .from(TB_users)
      .where(eq(TB_users.id, authUser.id));

    return Boolean((metadata as any).onboarded);
  }

  return true;
}

export async function loadUsersOnboardedIntoCache() {
  const users = await db
    .select({ id: TB_users.id })
    .from(TB_users)
    .where(sql`metadata->>'onboarded' = 'true'`);
  const usersOnboarded = users.map((u) => u.id);
  if (usersOnboarded.length)
    await cache.sAdd("cache:users:onboarded", usersOnboarded);
}

export async function setUserOnboarded() {
  const authUser = await getAuthUser();

  if (!authUser) throw new Error("User is not authenticated");

  await db.transaction(async (tx) => {
    await cache.sAdd("cache:users:onboarded", authUser.id);
    await tx
      .update(TB_users)
      .set({
        metadata: sql`jsonb_set(
        coalesce(metadata, '{}'::jsonb),
        '{onboarded}',
        'true'::jsonb,
        true
        )`,
      })
      .where(eq(TB_users.id, authUser.id));
  });
}

export { handlers, signIn, signOut, auth };
