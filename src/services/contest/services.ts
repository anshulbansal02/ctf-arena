"use server";
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  isNull,
  lt,
} from "drizzle-orm";
import { db } from "../db";
import {
  TB_contestChallenges,
  TB_contestEvents,
  TB_contestSubmissions,
  TB_contests,
} from "./entities";
import { getAuthUser } from "../auth";
import { getTeamIdByUserId, TB_teams } from "../team";
import { scrambleText, submissionComparator } from "./utils";
import { CONTEST_EVENTS } from "./helpers";
import { contestQueue } from "../queue";
import { getTeamRankAndScore } from "./leaderboard";
import { TB_users } from "../user";
import { getEmailService, renderTemplate } from "../email";
import { config } from "@/config";

export const contestChannelName = async (subChannel: "submission") => {
  return `channel:contest:${subChannel}`;
};

/**
 * Join a contest by contest id
 * @param contestId
 */
export async function joinContest(contestId: number) {
  const user = await getAuthUser();

  const teamId = await getTeamIdByUserId(user.id);

  console.log("NOT IN A TEAM", !teamId);
  if (!teamId)
    return { error: "You need to be in a team to register for a contest" };

  await db.insert(TB_contestEvents).values({
    name: CONTEST_EVENTS.TEAM_ENTERED_CONTEST,
    contestId,
    teamId: teamId,
  });
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

/**
 * Create a submission for correct solution to a contest challenge
 * @param contestId
 * @param challengeId
 * @param submission
 * @returns
 */
export async function checkAndCreateSubmission(data: {
  contestId: number;
  challengeId: number;
  submission: string;
}) {
  const { contestId, challengeId, submission } = data;
  const now = new Date();
  const user = await getAuthUser();
  const teamId = await getTeamIdByUserId(user.id);

  const [contest] = await db
    .select({
      startsAt: TB_contests.startsAt,
      endsAt: TB_contests.endsAt,
    })
    .from(TB_contests)
    .where(eq(TB_contests.id, contestId));

  if (!contest) return { error: "Contest not found." };
  if (contest.startsAt > now) return { error: "Contest is yet to begin." };
  if (contest.endsAt < now) return { error: "Contest has ended." };

  // Get challenge info
  const [challenge] = await db
    .select({
      answer: TB_contestChallenges.answer,
      maxPoints: TB_contestChallenges.maxPoints,
      minPoints: TB_contestChallenges.minPoints,
      pointsDecayFactor: TB_contestChallenges.pointsDecayFactor,
      order: TB_contestChallenges.order,
    })
    .from(TB_contestChallenges)
    .where(eq(TB_contestChallenges.id, challengeId));

  // If answer is not correct
  if (!submissionComparator(submission, challenge.answer)) return false;

  const [lastSubmission] = await db
    .select({ createdAt: TB_contestSubmissions.createdAt })
    .from(TB_contestSubmissions)
    .where(eq(TB_contestSubmissions.contestId, contestId))
    .orderBy(desc(TB_contestSubmissions.createdAt))
    .limit(1);

  const timeTaken = +now - +(lastSubmission?.createdAt ?? contest.startsAt);

  const hintsTaken = (await db
    .select({ data: TB_contestEvents.data })
    .from(TB_contestEvents)
    .where(
      and(
        eq(TB_contestEvents.teamId, teamId!),
        eq(TB_contestEvents.name, CONTEST_EVENTS.HINT_TAKEN),
      ),
    )) as Array<{ data: { cost: number } }>;

  // Score calculation
  const hintsDeduction = hintsTaken.reduce((a, hint) => a + hint.data.cost, 0);
  const pointsDecayFactor = challenge.pointsDecayFactor ?? 0;
  const score = Math.round(
    Math.max(
      challenge.maxPoints - (timeTaken / 1000) * pointsDecayFactor,
      challenge.minPoints ?? 0,
    ) - hintsDeduction,
  );

  const [newSubmission] = await db
    .insert(TB_contestSubmissions)
    .values({
      contestId,
      challengeId,
      score,
      submittedByTeam: teamId!,
      submittedByUser: user.id,
      submission,
      timeTaken,
    })
    .returning({
      id: TB_contestSubmissions.id,
      createdAt: TB_contestSubmissions.createdAt,
    });

  contestQueue.add(await contestChannelName("submission"), {
    submissionId: newSubmission.id,
    contestId,
    challengeId,
    challengeOrder: challenge.order,
    teamId,
    score,
    timeTaken,
    createdAt: newSubmission.createdAt,
  });

  return true;
}

/**
 * Get the next challenge details to be solved by the contestant
 * @param contestId
 * @returns
 */
export async function getNextContestChallenge(contestId: number) {
  const [lastSubmission] = await db
    .select({ order: TB_contestChallenges.order })
    .from(TB_contestSubmissions)
    .leftJoin(
      TB_contestChallenges,
      eq(TB_contestSubmissions.challengeId, TB_contestChallenges.id),
    )
    .where(eq(TB_contestSubmissions.contestId, contestId))
    .orderBy(desc(TB_contestSubmissions.createdAt))
    .limit(1);

  const nextInOrder = (lastSubmission?.order ?? 0) + 1;

  const [nextChallenge] = await db
    .select()
    .from(TB_contestChallenges)
    .where(
      and(
        eq(TB_contestChallenges.contestId, contestId),
        eq(TB_contestChallenges.order, nextInOrder),
      ),
    );

  if (!nextChallenge) return;

  const { answer, hints, ...redactedChallenge } = nextChallenge;

  return redactedChallenge;
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

  if (!res) return { error: "Hint not found" };

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

export async function getContestsStartingInOneHour() {
  const now = new Date();
  const after1Hour = new Date(+now + 1 * (60 * 60 * 1000));

  const contestsStartingInOneHour = await db
    .select()
    .from(TB_contests)
    .where(
      and(gt(TB_contests.startsAt, now), lt(TB_contests.startsAt, after1Hour)),
    );

  return contestsStartingInOneHour;
}

export async function createContest(data: {
  name: string;
  description: string;
  shortDescription: string;
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
        shortDescription: data.shortDescription,
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

export async function hasTeamAlreadyJoinedContest(contestId: number) {
  const teamId = await getTeamIdByUserId((await getAuthUser()).id);
  const ce = TB_contestEvents;

  const [contestJoinedEvent] = await db
    .select({ createdAt: ce.createdAt })
    .from(ce)
    .where(
      and(
        eq(ce.name, CONTEST_EVENTS.TEAM_ENTERED_CONTEST),
        eq(ce.teamId, teamId!),
        eq(ce.contestId, contestId),
      ),
    );

  return Boolean(contestJoinedEvent);
}

export async function getTeamContestStats(contestId: number) {
  const teamId = await getTeamIdByUserId((await getAuthUser()).id);

  if (!teamId) return { error: "Team not found" };

  const lastSubmissionAt = await getTeamLastSubmissionAt(contestId, teamId);

  if (typeof lastSubmissionAt === "object" && "error" in lastSubmissionAt)
    return lastSubmissionAt;

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

  users.forEach((user) => {
    getEmailService().send({
      address: { from: config.app.sourceEmailAddress, to: user.email },
      body: renderTemplate("contest-reminder", {
        contestName: contest.name,
        contestURL: new URL(`contests/${contest.id}`, config.host).href,
        startsAt: contest.startsAt,
        userEmail: user.email,
        userName: user.name!,
      }),
      subject: `Contest ${contest.name} is starting in less than an hour.`,
    });
  });
}

export async function getContestStats(contestId: number) {
  const ce = TB_contestEvents,
    cs = TB_contestSubmissions;
  const p1 = db
    .select({
      count: countDistinct(ce.teamId),
    })
    .from(ce)
    .where(
      and(
        eq(ce.contestId, contestId),
        eq(ce.name, CONTEST_EVENTS.TEAM_ENTERED_CONTEST),
      ),
    );

  const p2 = db
    .select({
      count: count(),
    })
    .from(cs)
    .where(and(eq(cs.contestId, contestId)));

  const [[teams], [submissions]] = await Promise.all([p1, p2]);

  return {
    teamsCount: teams.count,
    submissionsCount: submissions.count,
  };
}

export async function getContestParticipatingTeamIds(contestId: number) {
  const ce = TB_contestEvents;

  const participants = await db
    .select({
      teamId: ce.id,
    })
    .from(ce)
    .where(
      and(
        eq(ce.contestId, contestId),
        eq(ce.name, CONTEST_EVENTS.TEAM_ENTERED_CONTEST),
      ),
    );

  return participants.map((p) => p.teamId);
}
