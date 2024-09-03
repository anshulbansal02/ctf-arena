"use server";

import { getAuthUser, setUserOnboarded } from "@/services/auth";
import { db } from "../db";
import { TB_teamMembers, TB_teamRequest, TB_teams } from "./entities";
import { TB_users } from "../user";
import {
  aliasedTable,
  and,
  asc,
  count,
  eq,
  gt,
  ilike,
  inArray,
  isNull,
  lt,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import {
  intersection,
  joinNamesWithConjunction,
  randomItem,
} from "@/lib/utils";
import teamNames from "./team_names.json";
import { cache } from "../cache";
import { getEmailService, renderTemplate } from "../email";
import { config } from "@/config";
import { TB_contestEvents, TB_contests } from "../contest";
import { CONTEST_EVENTS } from "../contest/helpers";
import { nanoid } from "nanoid";
import { notificationsQueue } from "../queue";
import { startOfDay } from "date-fns";

export type TeamDetails = {
  id: number;
  name: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
    isLeader: boolean;
  }>;
};

const teamCacheKey = (teamId: number) => `team:${teamId}:details`;

async function preconditionIsTeamInContest(teamId: number) {
  const [r] = await db
    .select({})
    .from(TB_contestEvents)
    .where(
      and(
        eq(TB_contestEvents.teamId, teamId),
        eq(TB_contestEvents.name, CONTEST_EVENTS.TEAM_ENTERED_CONTEST),
        lt(TB_contests.startsAt, new Date()),
        gt(TB_contests.endsAt, new Date()),
      ),
    )
    .leftJoin(TB_contests, eq(TB_contests.id, TB_contestEvents.contestId));

  return !!r;
}

export async function generateTeamName(): Promise<string> {
  return randomItem(teamNames);
}

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
  const user = await getAuthUser();

  if (await getTeamIdByUserId(user.id))
    return { error: "You are already in a team" };

  await db.transaction(async (tx) => {
    const [{ teamId }] = await tx
      .insert(TB_teams)
      .values({ name: props.name, leader: user.id })
      .returning({ teamId: TB_teams.id });

    await tx.insert(TB_teamMembers).values({ teamId, userId: user.id });

    if (props.invitees?.length) {
      const emails = props.invitees.map((e) => e.toLowerCase());

      if (emails.includes(user.email))
        return {
          error: "You cannot include your own email address in the invites.",
        };

      if (emails.length > config.app.team.INVITE_USER_DAY_LIMIT)
        return {
          error: `You cannot invite more than ${config.app.team.INVITE_USER_DAY_LIMIT} members in a day`,
        };

      await tx.insert(TB_teamRequest).values(
        emails.map((i) => ({
          type: "invite" as any,
          teamId,
          userEmail: i,
          createdBy: user.id,
          metadata: {
            secret: nanoid(40),
          },
        })),
      );

      const usersWithAccount = await tx
        .select({ id: TB_users.id })
        .from(TB_users)
        .where(inArray(TB_users.email, emails));

      notificationsQueue.addBulk(
        usersWithAccount.map((user) => ({
          name: "new-notification",
          data: {
            userId: user.id,
            content: `Received a team invite from <b>${props.name}</b>. View invite on the Team page.`,
          },
        })),
      );
    }
  });
}

export async function sendTeamInvites(inputEmails: Array<string>) {
  const user = await getAuthUser();

  const teamId = await getTeamIdByUserId(user.id);
  if (!teamId) return { error: "You are not in a team." };

  const [team] = await db
    .select({ leaderId: TB_teams.leader, name: TB_teams.name })
    .from(TB_teams)
    .where(eq(TB_teams.id, teamId));

  if (team.leaderId !== user.id)
    return { error: "You are not the team leader." };

  const emails = inputEmails.map((e) => e.toLowerCase());

  if (emails.includes(user.email))
    return {
      error: "You cannot include your own email address in the invites.",
    };

  // check sent team invites count
  const invitesSentInThisDay = await db
    .select({ userEmail: TB_teamRequest.userEmail })
    .from(TB_teamRequest)
    .where(
      and(
        eq(TB_teamRequest.type, "invite"),
        eq(TB_teamRequest.teamId, teamId),
        gt(TB_teamRequest.createdAt, startOfDay(new Date())),
      ),
    );

  const alreadySentTo = intersection(
    invitesSentInThisDay.map((i) => i.userEmail!),
    emails,
  );

  if (alreadySentTo.length)
    return {
      error: `You have already sent invite(s) to ${joinNamesWithConjunction(alreadySentTo)} in this day.`,
    };

  if (
    invitesSentInThisDay.length + emails.length >
    config.app.team.INVITE_USER_DAY_LIMIT
  )
    return {
      error: `A team can only send invitations to maximum of ${config.app.team.INVITE_USER_DAY_LIMIT} users in a day.`,
    };

  await db.transaction(async (tx) => {
    await tx.insert(TB_teamRequest).values(
      emails.map((email) => ({
        type: "invite" as any,
        teamId,
        userEmail: email,
        createdBy: user.id,
        metadata: {
          secret: nanoid(40),
        },
      })),
    );

    const usersWithAccount = await tx
      .select({ id: TB_users.id })
      .from(TB_users)
      .where(inArray(TB_users.email, emails));

    notificationsQueue.addBulk(
      usersWithAccount.map((user) => ({
        name: "new-notification",
        data: {
          userId: user.id,
          content: `Received a team invite from <b>${team.name}</b>. View invite on the Team page.`,
        },
      })),
    );
  });
}

export async function getTeams(search?: string): Promise<Array<TeamDetails>> {
  const ctm = CTE_currentTeamMembers(),
    t = TB_teams,
    u = TB_users;

  const teams = await db
    .with(ctm)
    .select({
      id: t.id,
      name: t.name,
      members: sql<TeamDetails["members"]>`json_agg(json_build_object(
      'id', current_team_members.user_id, 
      'name', users.name,
      'email', users.email,
      'isLeader', current_team_members.user_id = teams.leader
    ))`,
    })
    .from(t)
    .leftJoin(ctm, eq(ctm.teamId, t.id))
    .leftJoin(u, eq(ctm.userId, u.id))
    .where(
      and(
        search ? ilike(t.name, `%${search}%`) : sql`true`,
        eq(t.abandoned, false),
      ),
    )
    .groupBy(t.id);

  return teams;
}

export async function getTeamsDetailsByIds(
  teamIds: Array<number>,
): Promise<Record<number, TeamDetails | undefined>> {
  const ctm = CTE_currentTeamMembers(),
    t = TB_teams,
    u = TB_users;

  if (!teamIds.length) return {};

  const teams = await db
    .with(ctm)
    .select({
      id: t.id,
      name: t.name,
      members: sql<TeamDetails["members"]>`json_agg(json_build_object(
      'id', current_team_members.user_id, 
      'name', users.name, 
      'email', users.email,
      'isLeader', current_team_members.user_id = teams.leader
    ))`,
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
      leaderId: t.leader,
      members: sql<TeamDetails["members"]>`json_agg(json_build_object(
      'id', current_team_members.user_id, 
      'name', users.name, 
      'email', users.email,
      'isLeader', current_team_members.user_id = teams.leader
    ))`,
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
  const user = await getAuthUser();

  const teamId = await getTeamIdByUserId(user.id);
  if (teamId) return { error: "You are already in a team" };

  const [userRequests] = await db
    .select({ count: count() })
    .from(TB_teamRequest)
    .where(
      and(
        eq(TB_teamRequest.createdBy, user.id),
        eq(TB_teamRequest.type, "request"),
        gt(TB_teamRequest.createdAt, startOfDay(new Date())),
      ),
    );

  const limit = config.app.team.REQUEST_TEAM_DAY_LIMIT;
  if (userRequests.count + teamIds.length > limit)
    return { error: `Cannot send request to more than ${limit} teams` };

  await db.transaction(async (tx) => {
    await tx
      .insert(TB_teamRequest)
      .values(
        teamIds.map((teamId) => ({
          type: "request" as any,
          status: "delivered" as any,
          teamId,
          createdBy: user.id,
        })),
      )
      .returning();

    const teams = await tx
      .select({ leader: TB_teams.leader })
      .from(TB_teams)
      .where(inArray(TB_teams.id, teamIds));

    notificationsQueue.addBulk(
      teams.map((team) => ({
        name: "new-notification",
        data: {
          userId: team.leader,
          content: `Received a join request from <b>${user.name}</b>. View request on the Team page.`,
        },
      })),
    );
  });
}

export async function cancelTeamRequest(requestId: number) {
  const user = await getAuthUser();

  await db
    .update(TB_teamRequest)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(TB_teamRequest.id, requestId),
        eq(TB_teamRequest.createdBy, user.id),
      ),
    );
}

// As a user, to which teams I have sent requests to
export async function getSentTeamRequests() {
  const user = await getAuthUser();

  const tr = TB_teamRequest;

  const requests = await db
    .select()
    .from(tr)
    .where(
      and(
        eq(tr.createdBy, user.id),
        eq(tr.status, "delivered"),
        eq(tr.type, "request"),
      ),
    );

  return requests;
}

// As a team, which users have sent request to join
export async function getReceivedJoinRequests(teamId: number) {
  const tr = TB_teamRequest,
    u = TB_users;
  const requests = await db
    .select({
      id: tr.id,
      createdAt: tr.createdAt,
      userName: u.name,
      userEmail: u.email,
    })
    .from(tr)
    .leftJoin(u, eq(tr.createdBy, u.id))
    .where(
      and(
        eq(tr.teamId, teamId),
        inArray(tr.status, ["delivered"]),
        eq(tr.type, "request"),
      ),
    );

  return requests;
}

// As a user, which teams have sent me invites
export async function getReceivedTeamInvites() {
  const user = await getAuthUser();
  const tr = TB_teamRequest,
    t = TB_teams;
  const invites = await db
    .select({
      id: tr.id,
      createdAt: tr.createdAt,
      teamName: t.name,
      createdBy: tr.createdBy,
    })
    .from(tr)
    .leftJoin(t, eq(tr.teamId, t.id))
    .where(
      and(
        eq(tr.userEmail, user.email),
        inArray(tr.status, ["queued", "sent", "delivered"]),
        eq(tr.type, "invite"),
      ),
    );
  return invites;
}

// As a team, which users were invited to team
export async function getSentTeamInvites(teamId: number) {
  const tr = TB_teamRequest;
  const invites = await db
    .select()
    .from(tr)
    .where(
      and(
        eq(tr.teamId, teamId),
        inArray(tr.status, ["queued", "sent", "delivered"]),
        eq(tr.type, "invite"),
      ),
    );

  return invites;
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
  if (!request) return { error: "Request not found" };
  if (!["delivered", "sent"].includes(request.status))
    return { error: `Request not ${response}able.` };

  await db.transaction(async (tx) => {
    const predicate =
      request.type === "invite"
        ? { by: TB_users.email, value: request.userEmail! }
        : { by: TB_users.id, value: request.userId };

    if (response === "accept") {
      const [user] = await tx
        .select({ id: TB_users.id, email: TB_users.email, name: TB_users.name })
        .from(TB_users)
        .where(eq(predicate.by, predicate.value));

      if (!user) return { error: "User does not exist" };

      if (request.type === "request") {
        const [team] = await db
          .select({ leaderId: TB_teams.leader })
          .from(TB_teams)
          .where(eq(TB_teams.id, request.teamId));
        if (team.leaderId !== (await getAuthUser()).id)
          return { error: "You are not a team leader." };
      }

      // Check if user already in team
      if (await getTeamIdByUserId(user.id)) {
        await tx
          .update(tr)
          .set({ status: "cancelled" })
          .where(eq(tr.id, requestId));
        return { error: "You are already in a team" };
      }

      // Check if team accepting the request is not in contest
      // Check if user accepting the invite from team is not in contest
      if (await preconditionIsTeamInContest(request.teamId))
        return { error: "Team is currently in a contest." };

      // Check if team is full
      const cte = CTE_currentTeamMembers(request.teamId);
      const teamMembers = await db
        .with(cte)
        .select({ userId: cte.userId })
        .from(cte);
      if (teamMembers.length >= config.app.team.MEMBERS_LIMIT)
        return { error: "Team already has maximum number of members." };

      // Update team members
      await tx.insert(TB_teamMembers).values({
        teamId: request.teamId,
        userId: user.id,
      });

      await setUserOnboarded();

      const otherTeamMembers = teamMembers.filter((m) => m.userId !== user.id);
      notificationsQueue.addBulk(
        otherTeamMembers.map((member) => ({
          name: "new-notification",
          data: {
            content: `Team member <b>${user.name}</b> left your team.`,
            userId: member.userId,
          },
        })),
      );

      cacheTeamDetails({ teamId: request.teamId, invalidate: true });

      // Update all requests created by the user.
      // Update all invites sent to the user.
      await tx
        .update(tr)
        .set({ status: "cancelled" })
        .where(or(eq(tr.userEmail, user.email), eq(tr.createdBy, user.id)));
    }

    // Update invite status
    const newStatus = response === "accept" ? "accepted" : "rejected";
    await tx.update(tr).set({ status: newStatus }).where(eq(tr.id, requestId));
  });
}

export async function leaveTeam() {
  const user = await getAuthUser();
  const team = await getTeamDetailsByUserId(user.id);

  if (!team?.id) return { error: "You are not in a team." };

  if (await preconditionIsTeamInContest(team.id))
    return { error: "Your team is currently in a contest." };

  await db.transaction(async (tx) => {
    const leader = team.members.find((u) => u.isLeader);

    const ctm = CTE_currentTeamMembers(team.id);
    if (user.id === leader?.id) {
      const [newLeader] = await db
        .with(ctm)
        .select()
        .from(ctm)
        .orderBy(asc(ctm.joinedAt))
        .offset(1)
        .limit(1);

      if (newLeader)
        await tx
          .update(TB_teams)
          .set({ leader: newLeader.userId })
          .where(eq(TB_teams.id, team.id));
    }

    const otherTeamMembers = team.members.filter((m) => m.id !== user.id);
    notificationsQueue.addBulk(
      otherTeamMembers.map((member) => ({
        name: "new-notification",
        data: {
          content: `Team member <b>${user.name}</b> left your team.`,
          userId: member.id,
        },
      })),
    );

    await tx
      .update(TB_teamMembers)
      .set({ leftAt: new Date() })
      .where(
        and(isNull(TB_teamMembers.leftAt), eq(TB_teamMembers.userId, user.id)),
      );

    // Mark team abandoned if no member is left
    if (team.members.length === 1) {
      await tx
        .update(TB_teams)
        .set({ abandoned: true, leader: null })
        .where(eq(TB_teams.id, team.id));
    }

    cacheTeamDetails({ teamId: team.id, invalidate: true });
  });
}

async function cacheTeamDetails(
  props:
    | { team: TeamDetails }
    | { teamId: number }
    | { invalidate: true; teamId: number },
) {
  let team: TeamDetails | undefined;
  if ("teamId" in props) {
    if ("invalidate" in props) {
      cache.del(teamCacheKey(props.teamId));
      return;
    }
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

  const inviterTable = aliasedTable(TB_U, "inviter");
  const invites = await db
    .select({
      id: TB_TR.id,
      teamName: TB_T.name,
      status: TB_TR.status,
      metadata: TB_TR.metadata,
      inviter: {
        email: inviterTable.email,
        name: inviterTable.name,
      },
      inviteeEmail: TB_TR.userEmail,
    })
    .from(TB_TR)
    .leftJoin(TB_T, eq(TB_T.id, TB_TR.teamId))
    .leftJoin(TB_U, eq(TB_U.email, TB_TR.userEmail))
    .leftJoin(inviterTable, eq(inviterTable.id, TB_TR.createdBy))
    .where(
      and(
        eq(TB_TR.type, "invite"),
        eq(TB_TR.status, "queued"),
        invitationsAlreadyUnderProcessing.length
          ? notInArray(TB_TR.id, invitationsAlreadyUnderProcessing)
          : sql`true`,
      ),
    );

  // Lock invites
  const invitationsToProcess = invites.map((i) => i.id.toString());
  if (invitationsToProcess.length)
    await cache.sAdd("lock:invitation:processing", invitationsToProcess);

  // Store which invites were sent successfully
  const invitesSent: Array<number> = [];

  // Render template and send invite for each
  await Promise.all(
    invites.map(async (invite) => {
      const emailBody = renderTemplate("team-invite", {
        inviteeEmail: invite.inviteeEmail!,
        inviterEmail: invite.inviter?.email!,
        inviteLink: new URL(
          `team/invite/${(invite.metadata as { secret: string }).secret}`,
          config.host,
        ).href,
        inviterName: invite.inviter?.name!,
        teamName: invite.teamName!,
      });

      try {
        await getEmailService().send({
          address: {
            from: config.app.sourceEmailAddress,
            to: invite.inviteeEmail!,
          },
          subject: `Invite to join ${invite.teamName} on CTF Arena`,
          body: emailBody,
        });

        invitesSent.push(invite.id);
      } catch (err) {
        console.error("Error sending invite: ", err);
      }
    }),
  );

  if (invitesSent.length)
    // Update status
    await db
      .update(TB_TR)
      .set({ status: "sent" })
      .where(inArray(TB_TR.id, invitesSent));
  // Release lock
  if (invitationsToProcess.length)
    await cache.sRem("lock:invitation:processing", invitationsToProcess);
}

export async function getInviteFromSecret(secret: string) {
  const [invite] = await db
    .select()
    .from(TB_teamRequest)
    .where(sql`metadata->>'secret' = ${secret}`);

  return invite;
}

export async function isUserTeamLeader(): Promise<boolean> {
  const user = await getAuthUser();
  const team = await getTeamDetailsByUserId(user.id);

  return !!team?.members.find((m) => m.id === user.id && m.isLeader);
}
