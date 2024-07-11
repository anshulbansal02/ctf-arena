import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { db } from "../db";
import { TB_userAccounts, TB_users } from "../user";
import { eq, sql } from "drizzle-orm";
import { cache } from "../cache";
import { authConfig } from "./config";

const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: TB_users,
    accountsTable: TB_userAccounts,
  }),
  ...authConfig,
});

export async function getSession() {
  return await auth();
}

export async function getAuthUser() {
  const session = await getSession();
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
