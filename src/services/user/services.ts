"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { TB_userNotifications, TB_users } from "./entities";
import { getAuthUser, updateSession } from "../auth";

export async function createNotification(data: {
  userId: string;
  content: string;
}) {
  await db
    .insert(TB_userNotifications)
    .values({ forUser: data.userId, content: data.content });
}

export async function markAllNotificationsAsRead() {
  const user = await getAuthUser();

  await db
    .update(TB_userNotifications)
    .set({ status: "seen" })
    .where(eq(TB_userNotifications.forUser, user.id));
}

export async function getNotifications() {
  const userId = (await getAuthUser()).id;

  const notifications = await db.transaction(async (tx) => {
    const notifications = await tx
      .select()
      .from(TB_userNotifications)
      .where(eq(TB_userNotifications.forUser, userId));

    const queuedNotifications = notifications
      .filter((n) => n.status === "queued")
      .map((n) => n.id);

    if (queuedNotifications.length) {
      await tx
        .update(TB_userNotifications)
        .set({ status: "delivered" })
        .where(inArray(TB_userNotifications.id, queuedNotifications));
    }
    return notifications;
  });

  return notifications;
}

export async function updateUserName(newName: string) {
  const user = await getAuthUser();

  await db
    .update(TB_users)
    .set({ name: newName })
    .where(eq(TB_users.id, user.id));

  await updateSession({ user: { name: newName } });
}
