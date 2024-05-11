"use server";

import { getUser } from "@/services/auth";
import { createServerClient } from "@/services/supabase/server";
import { db } from "../db";
import {
  TB_teamMembers,
  TB_teamRequest,
  TB_teams,
  View_currentTeamMembers,
} from "./entities";
import { TB_users } from "../user";
import { eq, sql } from "drizzle-orm";
import { randomItem } from "@/lib/utils";
import teamNames from "./team_names.json";

export async function createTeamAndSendInvites(data: {
  name: string;
  invitees: Array<string>;
}) {
  const user = await getUser();

  await db.transaction(async (tx) => {
    const [{ teamId }] = await tx
      .insert(TB_teams)
      .values({ name: data.name, leader: user.id })
      .returning({ teamId: TB_teams.id });

    await tx.insert(TB_teamMembers).values({ teamId, userId: user.id });

    await tx.insert(TB_teamRequest).values(
      data.invitees.map((i) => ({
        type: "invite" as any,
        teamId,
        userEmail: i,
        createdBy: user.id,
      })),
    );
  });
}

export async function getTeams() {
  const teams = await db
    .select({
      id: View_currentTeamMembers.teamId,
      name: View_currentTeamMembers.teamName,
      members: sql<
        { name: string }[]
      >`array_agg(json_build_object('name', ${TB_users.full_name}))`,
    })
    .from(View_currentTeamMembers)
    .innerJoin(TB_users, eq(View_currentTeamMembers.memberId, TB_users.id))
    .groupBy(View_currentTeamMembers.teamId);

  return teams;
}

export async function generateTeamName(): Promise<string> {
  return randomItem(teamNames);
}
