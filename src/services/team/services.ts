"use server";

import { getUser } from "@/services/auth";
import { db } from "../db";
import { TB_teamMembers, TB_teamRequest, TB_teams } from "./entities";
import { TB_users } from "../user";
import { eq, isNull } from "drizzle-orm";
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
  const records = await db
    .select({
      teamId: TB_teams.id,
      teamName: TB_teams.name,
      memberId: TB_teamMembers.userId,
      memberName: TB_users.full_name,
    })
    .from(TB_teams)
    .innerJoin(TB_teamMembers, eq(TB_teams.id, TB_teamMembers.teamId))
    .innerJoin(TB_users, eq(TB_teamMembers.userId, TB_users.id))
    .where(isNull(TB_teamMembers.leftAt));

  const teams = records.reduce<
    Record<
      number,
      { id: number; name: string; members: Array<{ name: string; id: string }> }
    >
  >((agg, record) => {
    if (!agg[record.teamId])
      agg[record.teamId] = {
        id: record.teamId,
        name: record.teamName,
        members: [],
      };
    agg[record.teamId].members.push({
      id: record.memberId,
      name: record.memberName,
    });

    return agg;
  }, {});

  return Object.values(teams);
}

export async function generateTeamName(): Promise<string> {
  return randomItem(teamNames);
}

export async function getTeamDetails(teamId: number) {
  /**
   * id, name, leader, members
   */

  const team = (
    await db.select().from(TB_teams).where(eq(TB_teams.id, teamId))
  ).at(0);

  return team;
}

export async function sendTeamRequest(teamId: number) {
  const user = await getUser();

  await db.insert(TB_teamRequest).values({
    type: "request",
    teamId,
    createdBy: user.id,
  });
}

export async function sendTeamRequests(teamIds: Array<number>) {
  const user = await getUser();

  await db.insert(TB_teamRequest).values(
    teamIds.map((teamId) => ({
      type: "request" as any,
      teamId,
      createdBy: user.id,
    })),
  );
}
