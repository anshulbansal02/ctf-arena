import { and, asc, desc, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "../db";
import {
  TB_contestChallenges,
  TB_contestEvents,
  TB_contestSubmissions,
  TB_contests,
} from "./entities";
import { getUser } from "../auth";
import { TB_teamMembers } from "../team";
import { scrambleText, submissionComparator } from "./utils";

/**
 * Join a contest by contest id
 * @param contestId
 */
export async function joinContest(contestId: number) {
  const user = await getUser();

  const [team] = await db
    .select({ id: TB_teamMembers.teamId })
    .from(TB_teamMembers)
    .where(
      and(eq(TB_teamMembers.userId, user.id), isNull(TB_teamMembers.leftAt)),
    );

  await db.insert(TB_contestEvents).values({
    name: "TEAM_JOINED_CONTEST",
    contestId,
    teamId: team.id,
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
      challenges: {
        id: TB_CC.id,
        order: TB_CC.order,
        name: TB_CC.name,
        description: TB_CC.description,
      },
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
  // Get challenge info
  const [challenge] = await db
    .select({
      answer: TB_contestChallenges.answer,
      maxPoints: TB_contestChallenges.maxPoints,
      minPoints: TB_contestChallenges.minPoints,
      pointsDecayFactor: TB_contestChallenges.pointsDecayFactor,
    })
    .from(TB_contestChallenges)
    .where(eq(TB_contestChallenges.id, challengeId));

  // If answer is not correct
  if (!submissionComparator(submission, challenge.answer)) {
    return false;
  }

  const user = await getUser();

  const [team] = await db
    .select({ id: TB_teamMembers.teamId })
    .from(TB_teamMembers)
    .where(
      and(eq(TB_teamMembers.userId, user.id), isNull(TB_teamMembers.leftAt)),
    );

  let timeTaken = 0;
  const lastSubmission = await db
    .select({ createdAt: TB_contestSubmissions.createdAt })
    .from(TB_contestSubmissions)
    .where(eq(TB_contestSubmissions.contestId, contestId))
    .orderBy(desc(TB_contestSubmissions.createdAt))
    .limit(1);

  if (lastSubmission.length) {
    timeTaken = Date.now() - +lastSubmission[0].createdAt;
  } else {
    const [{ createdAt: contestJoinedAt }] = await db
      .select({ createdAt: TB_contestEvents.createdAt })
      .from(TB_contestEvents)
      .where(
        and(
          eq(TB_contestEvents.teamId, team.id),
          eq(TB_contestEvents.name, "TEAM_JOINED_CONTEST"),
        ),
      );

    timeTaken = Date.now() - +contestJoinedAt;
  }

  const hintsTaken = (await db
    .select({ data: TB_contestEvents.data })
    .from(TB_contestEvents)
    .where(
      and(
        eq(TB_contestEvents.teamId, team.id),
        eq(TB_contestEvents.name, "HINT_TAKEN"),
      ),
    )) as Array<{ data: { cost: number } }>;

  const hintsDeduction = hintsTaken.reduce((a, hint) => a + hint.data.cost, 0);

  // Score calculation
  const pointsDecayFactor = challenge.pointsDecayFactor ?? 0;
  const score =
    Math.max(
      challenge.maxPoints - (timeTaken / 1000) * pointsDecayFactor,
      challenge.minPoints ?? 0,
    ) - hintsDeduction;

  await db.insert(TB_contestSubmissions).values({
    contestId,
    challengeId,
    score,
    submittedByTeam: team.id,
    submittedByUser: user.id,
    submission,
    timeTaken,
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

/**
 * Get current leaderboard status for contest
 * @param contestId
 */
export async function getLeaderBoard(contestId: number) {}
