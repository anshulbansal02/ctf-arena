"use server";

import { db } from "../db";
import { TB_users } from "../user";
import { eq, sql } from "drizzle-orm";
import { getSession, updateSession } from "./auth";
import { redirect } from "next/navigation";
import type { EmailConfig } from "next-auth/providers";
import { getEmailService, renderTemplate } from "../email";
import { config } from "@/config";

export async function getAuthUser() {
  const session = await getSession();
  return session?.user!;
}

export async function setUserOnboarded() {
  const authUser = await getAuthUser();

  if (!authUser) return { error: "You are not authenticated" };

  if (authUser.onboarded) return;

  await db
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
  await updateSession({ user: { onboarded: true } });
  redirect("/");
}

export const sendVerificationRequest: EmailConfig["sendVerificationRequest"] =
  async (params) => {
    const emailService = getEmailService();
    emailService.send({
      address: {
        from: config.app.sourceEmailAddressForAuth,
        to: params.identifier,
      },
      body: renderTemplate("auth-verification-request", {}),
      subject: "",
    });
  };
