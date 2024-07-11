"use server";
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { db } from "../db";
import { TB_userAccounts, TB_users } from "../user";
import { authConfig } from "./config";

const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: TB_users,
    accountsTable: TB_userAccounts,
  }),
  ...authConfig,
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
