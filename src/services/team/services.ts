"use server";

import { getUser } from "@/services/auth";
import { db } from "../db";
import { TB_teamMembers, TB_teamRequest, TB_teams } from "./entities";
import { TB_users } from "../user";
import { and, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";
import { randomItem } from "@/lib/utils";
import teamNames from "./team_names.json";
import { cache } from "../cache";
import { emailService, renderTemplate } from "../email";
import { config } from "@/config";

export type TeamDetails = {
  id: number;
  name: string;
  members: Array<{ id: string; name: string }>;
};

export async function generateTeamName(): Promise<string> {
  return randomItem(teamNames);
}

const teamCacheKey = (teamId: number) => `team:${teamId}:details`;

const CTE_currentTeamMembers = (teamId?: number) =>
  db.$with("current_team_members").as(
    db
      .select()
      .from(TB_teamMembers)
      .where(
        and(
          teamId ? eq(TB_teamMembers.teamId, teamId) : sql`true`,
          isNull(TB_teamMembers.leftAt),
        ),
      ),
  );

export async function createTeamAndSendInvites(props: {
  name: string;
  invitees: Array<string>;
}) {
  const user = await getUser();

  if (await getTeamIdByUserId(user.id))
    throw new Error("User is already in a team");

  await db.transaction(async (tx) => {
    const [{ teamId }] = await tx
      .insert(TB_teams)
      .values({ name: props.name, leader: user.id })
      .returning({ teamId: TB_teams.id });

    await tx.insert(TB_teamMembers).values({ teamId, userId: user.id });

    await tx.insert(TB_teamRequest).values(
      props.invitees.map((i) => ({
        type: "invite" as any,
        teamId,
        userEmail: i,
        createdBy: user.id,
      })),
    );
  });
}

export async function getTeams(): Promise<Array<TeamDetails>> {
  const ctm = CTE_currentTeamMembers(),
    t = TB_teams,
    u = TB_users;

  const teams = await db
    .with(ctm)
    .select({
      id: t.id,
      name: t.name,
      members: sql<
        Array<{ id: string; name: string }>
      >`json_agg(json_build_object('id', current_team_members.user_id, 'name', u.full_name))`,
    })
    .from(t)
    .leftJoin(ctm, eq(ctm.teamId, t.id))
    .leftJoin(u, eq(ctm.userId, u.id))
    .groupBy(t.id);

  return teams;
}

export async function getTeamsDetailsByIds(
  teamIds: Array<number>,
): Promise<Record<number, TeamDetails | undefined>> {
  const ctm = CTE_currentTeamMembers(),
    t = TB_teams,
    u = TB_users;

  const teams = await db
    .with(ctm)
    .select({
      id: t.id,
      name: t.name,
      members: sql<
        Array<{ id: string; name: string }>
      >`json_agg(json_build_object('id', current_team_members.user_id, 'name', u.full_name))`,
    })
    .from(t)
    .leftJoin(ctm, eq(ctm.teamId, t.id))
    .leftJoin(u, eq(ctm.userId, u.id))
    .where(inArray(t.id, teamIds))
    .groupBy(t.id);

  return Object.fromEntries(teams.map((t) => [t.id, t]));
}

export async function getTeamDetails(
  teamId: number,
): Promise<TeamDetails | undefined> {
  const cachedTeam = await cache.get(teamCacheKey(teamId));
  if (cachedTeam) return JSON.parse(cachedTeam);

  const ctm = CTE_currentTeamMembers(teamId),
    t = TB_teams,
    u = TB_users;

  const [team] = await db
    .with(ctm)
    .select({
      id: t.id,
      name: t.name,
      members: sql<
        Array<{ id: string; name: string }>
      >`json_agg(json_build_object('id', current_team_members.user_id, 'name', u.full_name))`,
    })
    .from(t)
    .leftJoin(ctm, eq(ctm.teamId, t.id))
    .leftJoin(u, eq(ctm.userId, u.id))
    .where(eq(t.id, teamId))
    .groupBy(t.id);

  cacheTeamDetails({ team });

  return team;
}

export async function getTeamDetailsByUserId(userId: string) {
  const teamId = await getTeamIdByUserId(userId);
  if (!teamId) return;
  return getTeamDetails(teamId);
}

export async function getTeamIdByUserId(
  userId: string,
): Promise<number | undefined> {
  const ctm = CTE_currentTeamMembers();

  const [team] = await db
    .with(ctm)
    .select({ id: ctm.teamId })
    .from(ctm)
    .where(eq(ctm.userId, userId));

  return team?.id;
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

export async function sendTeamInvites(teamId: number, emails: string[]) {
  const user = await getUser();

  await db.insert(TB_teamRequest).values(
    emails.map((email) => ({
      type: "invite" as any,
      teamId,
      userEmail: email,
      createdBy: user.id,
    })),
  );
}

export async function cancelTeamRequest(requestId: number) {
  await db
    .update(TB_teamRequest)
    .set({ status: "cancelled" })
    .where(eq(TB_teamRequest.id, requestId));
}

export async function respondToTeamRequest(
  requestId: number,
  response: "accept" | "reject",
) {
  const tr = TB_teamRequest;

  const [request] = await db
    .select({
      status: tr.status,
      teamId: tr.teamId,
      userEmail: tr.userEmail,
      userId: tr.createdBy,
      type: tr.type,
    })
    .from(tr)
    .where(eq(tr.id, requestId));

  // Check invite and status
  if (!request) throw new Error("Request not found");
  if (request.status !== "delivered")
    throw new Error(`Request not ${response}able.`);

  await db.transaction(async (tx) => {
    const predicate =
      request.type === "invite"
        ? { by: TB_users.email, value: request.userEmail! }
        : { by: TB_users.id, value: request.userId };

    if (response === "accept") {
      const [user] = await tx
        .select({ id: TB_users.id })
        .from(TB_users)
        .where(eq(predicate.by, predicate.value));

      if (!user) throw new Error("User does not exist");

      // Check if user already in team
      if (await getTeamIdByUserId(user.id)) {
        await tx
          .update(tr)
          .set({ status: "cancelled" })
          .where(eq(tr.id, requestId));
        throw new Error("User is already in a team");
      }

      // Update team members
      await tx.insert(TB_teamMembers).values({
        teamId: request.teamId,
        userId: user.id,
      });

      cacheTeamDetails({ teamId: request.teamId });
    }

    // Update invite status
    const newStatus = response === "accept" ? "accepted" : "rejected";
    await tx.update(tr).set({ status: newStatus }).where(eq(tr.id, requestId));
  });
}

export async function leaveTeam() {
  const user = await getUser();
  const teamId = await getTeamIdByUserId(user.id);

  if (!teamId) throw new Error("User is not in a team.");

  await db
    .update(TB_teamMembers)
    .set({ leftAt: new Date() })
    .where(
      and(isNull(TB_teamMembers.leftAt), eq(TB_teamMembers.userId, user.id)),
    );

  cacheTeamDetails({ teamId: teamId });
}

async function cacheTeamDetails(
  props: { team: TeamDetails } | { teamId: number },
) {
  let team: TeamDetails | undefined;
  if ("teamId" in props) {
    team = await getTeamDetails(props.teamId);
  } else {
    team = props.team;
  }

  if (team) await cache.setEx(teamCacheKey(team.id), 60, JSON.stringify(team));
}

export async function batchSendInvitations() {
  // Fetch queued invites excluding those already under processing
  const invitationsAlreadyUnderProcessing = (
    await cache.sMembers("lock:invitation:processing")
  ).map((id) => +id);

  const TB_T = TB_teams,
    TB_TR = TB_teamRequest,
    TB_U = TB_users;

  const invites = await db
    .select({
      id: TB_TR.id,
      teamName: TB_T.name,
      status: TB_TR.status,
      metadata: TB_TR.metadata,
      inviter: {
        email: TB_U.email,
        name: TB_U.full_name,
      },
      inviteeEmail: TB_TR.userEmail,
    })
    .from(TB_TR)
    .leftJoin(TB_T, eq(TB_T.id, TB_TR.teamId))
    .leftJoin(TB_U, eq(TB_U.email, TB_TR.userEmail))
    .where(
      and(
        eq(TB_TR.type, "invite"),
        eq(TB_TR.status, "queued"),
        notInArray(TB_TR.id, invitationsAlreadyUnderProcessing),
      ),
    );

  // Lock invites
  const invitationsToProcess = invites.map((i) => i.id.toString());
  await cache.sAdd("lock:invitation:processing", invitationsToProcess);

  // Store which invites were sent successfully
  const invitesSent: Array<number> = [];

  // Render template and send invite for each
  await Promise.all(
    invites.map(async (invite) => {
      const emailBody = renderTemplate("team-invite", {
        inviteeEmail: invite.inviteeEmail!,
        inviterEmail: invite.inviter?.email!,
        inviteLink: "",
        inviterName: invite.inviter?.name!,
        teamName: invite.teamName!,
      });

      try {
        await emailService.send({
          address: {
            from: config.app.sourceEmailAddress,
            to: invite.inviteeEmail!,
          },
          subject: `Join ${invite.teamName} on CTF Arena`,
          body: emailBody,
        });

        invitesSent.push(invite.id);
      } catch {}
    }),
  );

  // Update status
  await db
    .update(TB_TR)
    .set({ status: "sent" })
    .where(inArray(TB_TR.id, invitesSent));
  // Release lock
  await cache.sRem("lock:invitation:processing", invitationsToProcess);
}
