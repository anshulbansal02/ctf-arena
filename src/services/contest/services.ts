"use server";
import { and, asc, count, desc, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "../db";
import {
  TB_contestChallenges,
  TB_contestEvents,
  TB_contestSubmissions,
  TB_contests,
} from "./entities";
import { getAuthUser } from "../auth";
import { TB_teamMembers, getTeamIdByUserId } from "../team";
import { scrambleText, submissionComparator } from "./utils";
import { CONTEST_EVENTS } from "./helpers";
import { contestQueue } from "../queue";

export const contestChannel = (subChannel: "submission") => {
  return `channel:contest:${subChannel}`;
};

/**
 * Join a contest by contest id
 * @param contestId
 */
export async function joinContest(contestId: number) {
  const user = await getAuthUser();

  const teamId = await getTeamIdByUserId(user.id);

  if (!teamId) throw new Error("You are not in a team");

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
export async function getContests(type: "active" | "upcoming") {
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
  } else {
    return await contests.where(gt(TB_contests.startsAt, new Date()));
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
      description: TB_C.description,
      startsAt: TB_C.startsAt,
      endsAt: TB_C.endsAt,
      noOfChallenges: count(),
    })
    .from(TB_C)
    .leftJoin(TB_CC, eq(TB_CC.contestId, contestId))
    .where(eq(TB_C.id, contestId));

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
}): Promise<boolean> {
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

  if (!contest) throw new Error("Contest not found.");
  if (contest.startsAt > now) throw new Error("Contest is yet to begin.");
  if (contest.endsAt < now) throw new Error("Contest has ended.");

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

  const timeTaken =
    Date.now() - +(lastSubmission?.createdAt ?? contest.startsAt);

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
  const score =
    Math.max(
      challenge.maxPoints - (timeTaken / 1000) * pointsDecayFactor,
      challenge.minPoints ?? 0,
    ) - hintsDeduction;

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

  contestQueue.add(contestChannel("submission"), {
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

  const nextInOrder = (lastSubmission.order ?? 0) + 1;

  const [nextChallenge] = await db
    .select()
    .from(TB_contestChallenges)
    .where(
      and(
        eq(TB_contestChallenges.contestId, contestId),
        eq(TB_contestChallenges.order, nextInOrder),
      ),
    );

  const { answer, ...redactedChallenge } = nextChallenge;

  const redactedHints = (
    redactedChallenge.hints as Array<{ text: string; cost: number }>
  ).map((hint) => ({ ...hint, text: scrambleText(hint.text) }));

  return {
    ...redactedChallenge,
    hints: redactedHints,
  };
}

export async function revealHint(challengeId: number, hintIndex: number) {
  const cc = TB_contestChallenges;
  const [res] = await db
    .select({ hints: cc.hints, contestId: cc.contestId })
    .from(cc)
    .where(eq(cc.id, challengeId));

  if (!res) throw new Error("Hint not found");

  const hintTaken = (res.hints as any[])[hintIndex];

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
