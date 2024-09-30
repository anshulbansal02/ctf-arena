"use server";
import { and, asc, count, countDistinct, eq, gt, lt, or } from "drizzle-orm";
import { db } from "../db";
import {
  TB_contestChallenges,
  TB_contestEvents,
  TB_contestSubmissions,
  TB_contests,
} from "./entities";
import { getAuthUser } from "../auth";
import { getTeamIdByUserId } from "../team";
import { CONTEST_EVENTS } from "./helpers";
import { getTeamRankAndScore } from "./leaderboard";
import { TB_users } from "@/services/user";
import { getEmailService } from "@/services/email";
import { config } from "@/config";
import { addHours } from "date-fns";
import { scrambleText } from "@/lib/utils";

/**
 * Join a contest by contest id
 * @param contestId
 */
export async function joinContest(contestId: number) {
  const user = await getAuthUser();

  const participationType = await getContestParticipationType(contestId);

  if (participationType === "team") {
    const teamId = await getTeamIdByUserId(user.id);
    if (!teamId)
      return { error: "You need to be in a team to register for a contest" };

    await db.insert(TB_contestEvents).values({
      name: CONTEST_EVENTS.PARTICIPANT_REGISTERED,
      contestId,
      teamId: teamId,
    });
  } else {
    await db.insert(TB_contestEvents).values({
      name: CONTEST_EVENTS.PARTICIPANT_REGISTERED,
      contestId,
      userId: user.id,
    });
  }
}

/**
 * Get the upcoming or active contests
 * @param type
 * @returns
 */
export async function getContests(type: "active" | "upcoming" | "ended") {
  const contests = db
    .select()
    .from(TB_contests)
    .orderBy(asc(TB_contests.startsAt));

  if (type === "active") {
    return await contests.where(
      and(
        lt(TB_contests.startsAt, new Date()),
        gt(TB_contests.endsAt, new Date()),
      ),
    );
  } else if (type === "upcoming") {
    return await contests.where(gt(TB_contests.startsAt, new Date()));
  } else {
    return await contests.where(lt(TB_contests.endsAt, new Date()));
  }
}

export async function getContestParticipationType(contestId: number) {
  const [contest] = await db
    .select({
      participationType: TB_contests.participationType,
    })
    .from(TB_contests)
    .where(eq(TB_contests.id, contestId));

  return contest.participationType;
}

/**
 * Get a contest's details by id
 * @param contestId
 * @returns
 */
export async function getContest(contestId: number) {
  const TB_CC = TB_contestChallenges,
    TB_C = TB_contests;

  const [contest] = await db
    .select({
      id: TB_C.id,
      name: TB_C.name,
      game: TB_C.game,
      participation: TB_C.participationType,
      isUnranked: TB_C.unranked,
      description: TB_C.description,
      startsAt: TB_C.startsAt,
      endsAt: TB_C.endsAt,
      noOfChallenges: count(),
    })
    .from(TB_C)
    .leftJoin(TB_CC, eq(TB_CC.contestId, contestId))
    .where(eq(TB_C.id, contestId))
    .groupBy(TB_C.id);

  return contest;
}

export async function getChallengeHints(challengeId: number) {
  const cc = TB_contestChallenges,
    ce = TB_contestEvents;
  const [challenge] = await db
    .select({ hints: cc.hints })
    .from(cc)
    .where(eq(cc.id, challengeId));

  if (!challenge) return { error: "Challenge not found" };

  const teamId = (await getTeamIdByUserId((await getAuthUser()).id))!;

  // get hints already claimed
  const hintsClaimedEvents = await db
    .select({ hint: ce.data })
    .from(ce)
    .where(
      and(
        eq(ce.name, CONTEST_EVENTS.HINT_TAKEN),
        eq(ce.challengeId, challengeId),
        eq(ce.teamId, teamId),
      ),
    );

  const revealedHintIds = hintsClaimedEvents.map(
    ({ hint }) => (hint as { id: number }).id,
  );

  const redactedHints = (
    challenge.hints as Array<{
      id: number;
      text: string;
      cost: number;
      afterSeconds: number;
    }>
  ).map((hint) => {
    return {
      id: hint.id,
      hiddenText: scrambleText(hint.text),
      cost: hint.cost,
      afterSeconds: hint.afterSeconds,
      text: revealedHintIds.includes(hint.id) ? hint.text : null,
    };
  });

  return redactedHints;
}

export async function getTeamLastSubmissionAt(
  contestId: number,
  teamId?: number,
) {
  const cs = TB_contestSubmissions;

  const tId = teamId ?? (await getTeamIdByUserId((await getAuthUser()).id));
  if (!tId) return { error: "Cannot get team last submission" };

  const [submission] = await db
    .select({ createdAt: cs.createdAt })
    .from(cs)
    .where(and(eq(cs.contestId, contestId), eq(cs.submittedByTeam, tId)));

  if (submission) return submission.createdAt.toString();

  const [contest] = await db
    .select({ startedAt: TB_contests.startsAt })
    .from(TB_contests)
    .where(eq(TB_contests.id, contestId));

  return contest.startedAt.toString();
}

export async function revealHint(challengeId: number, hintId: number) {
  const cc = TB_contestChallenges;
  const [res] = await db
    .select({ hints: cc.hints, contestId: cc.contestId })
    .from(cc)
    .where(eq(cc.id, challengeId));

  if (!res) throw new Error("Hint not available");

  const hintTaken = (
    res.hints as Array<{
      text: string;
      cost: number;
      afterSeconds: number;
      id: number;
    }>
  ).find((h) => h.id === hintId);

  const teamId = await getTeamIdByUserId((await getAuthUser()).id);

  await db.insert(TB_contestEvents).values({
    challengeId,
    contestId: res.contestId,
    name: CONTEST_EVENTS.HINT_TAKEN,
    data: hintTaken,
    teamId,
  });

  return hintTaken;
}

export async function getUpcomingContestsOfHours(hours: number) {
  const now = new Date();
  const afterNHours = addHours(now, hours);

  const contestsStartingInNHours = await db
    .select()
    .from(TB_contests)
    .where(
      and(gt(TB_contests.startsAt, now), lt(TB_contests.startsAt, afterNHours)),
    );

  return contestsStartingInNHours;
}

export async function createContest(data: {
  name: string;
  description: string;
  shortDescription: string;
  participationType: "individual" | "team";
  unranked: boolean;
  game: string;
  config: unknown;
  initialGameState: unknown;
  time: { start: Date; end: Date };
  challenges: Array<{
    name?: string;
    description?: string;
    points: { max: number; min: number };
    pointsDecayFactor: number;
    answer: string;
    hints: Array<{
      text: string;
      cost: number;
      afterSeconds: number;
      id: number;
    }>;
  }>;
}) {
  return await db.transaction(async (tx) => {
    const [contest] = await tx
      .insert(TB_contests)
      .values({
        name: data.name,
        description: data.description,
        config: data.config,
        game: data.game,
        unranked: data.unranked,
        gameState: data.initialGameState,
        shortDescription: data.shortDescription,
        participationType: data.participationType,
        startsAt: data.time.start,
        endsAt: data.time.end,
      })
      .returning({ id: TB_contests.id });

    await tx.insert(TB_contestChallenges).values(
      data.challenges.map((c, i) => ({
        contestId: contest.id,
        name: c.name,
        answer: c.answer,
        maxPoints: c.points.max,
        minPoints: c.points.min,
        order: i + 1,
        description: c.description,
        hints: c.hints,
        pointsDecayFactor: c.pointsDecayFactor,
      })),
    );

    return contest.id;
  });
}

export async function isParticipantRegistered(contestId: number) {
  const user = await getAuthUser();
  const teamId = await getTeamIdByUserId(user.id);

  const ce = TB_contestEvents;

  const [contestJoinedEvent] = await db
    .select({ createdAt: ce.createdAt })
    .from(ce)
    .where(
      and(
        eq(ce.name, CONTEST_EVENTS.PARTICIPANT_REGISTERED),
        eq(ce.contestId, contestId),
        or(eq(ce.teamId, teamId!), eq(ce.userId, user.id)),
      ),
    );

  return Boolean(contestJoinedEvent);
}

export async function getTeamContestStats(contestId: number) {
  const teamId = await getTeamIdByUserId((await getAuthUser()).id);

  if (!teamId) return { error: "Team not found" };

  const lastSubmissionAt = await getTeamLastSubmissionAt(contestId, teamId);

  if (typeof lastSubmissionAt === "object" && "error" in lastSubmissionAt)
    throw new Error(lastSubmissionAt.error);

  const p2 = db
    .select({ count: count() })
    .from(TB_contestSubmissions)
    .where(
      and(
        eq(TB_contestSubmissions.submittedByTeam, teamId),
        eq(TB_contestSubmissions.contestId, contestId),
      ),
    );

  const p3 = getTeamRankAndScore(contestId, teamId);

  const [[submissions], leaderboard] = await Promise.all([p2, p3]);

  return {
    teamId,
    contestId,
    submissionsCount: submissions.count,
    lastSubmissionAt,
    rank: leaderboard.rank,
    score: leaderboard.score,
  };
}

export async function batchSendContestReminder(contestId: number) {
  const [contest] = await db
    .select()
    .from(TB_contests)
    .where(eq(TB_contests.id, contestId));

  const users = await db
    .select({ name: TB_users.name, email: TB_users.email })
    .from(TB_users);

  const emailService = getEmailService();

  users.forEach(async (user) => {
    emailService.send({
      address: {
        from: config.app.sourceEmailAddress.notifications,
        to: user.email,
      },
      body: await emailService.renderTemplate("contest-reminder", {
        contestName: contest.name,
        contestURL: new URL(`contests/${contest.id}`, config.host).href,
        startsAt: contest.startsAt,
        userEmail: user.email,
        userName: user.name!,
      }),
      subject: `Contest ${contest.name} is starting soon on CTF Arena`,
    });
  });
}

export async function getContestStats(contestId: number) {
  const ce = TB_contestEvents,
    cs = TB_contestSubmissions;
  const p1 = db
    .select({
      teamsCount: countDistinct(ce.teamId),
      usersCount: countDistinct(ce.userId),
    })
    .from(ce)
    .where(
      and(
        eq(ce.contestId, contestId),
        eq(ce.name, CONTEST_EVENTS.PARTICIPANT_REGISTERED),
      ),
    );

  const p2 = db
    .select({
      count: count(),
    })
    .from(cs)
    .where(and(eq(cs.contestId, contestId)));

  const [[participants], [submissions]] = await Promise.all([p1, p2]);

  return {
    teamsCount: participants.teamsCount,
    usersCount: participants.usersCount,
    submissionsCount: submissions.count,
  };
}
