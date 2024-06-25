import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  isNull,
  lt,
  sql,
  sum,
} from "drizzle-orm";
import { db } from "../db";
import {
  TB_contestChallenges,
  TB_contestEvents,
  TB_contestSubmissions,
  TB_contests,
} from "./entities";
import { getUser } from "../auth";
import { TB_teamMembers, getUserTeam, getUserTeamId } from "../team";
import { scrambleText, submissionComparator } from "./utils";
import { CONTEST_EVENTS } from "./helpers";

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
    name: CONTEST_EVENTS.TEAM_ENTERED_CONTEST,
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
  const now = new Date();
  const user = await getUser();
  const teamId = await getUserTeamId(user.id);

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
        eq(TB_contestEvents.teamId, teamId),
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

  await db.insert(TB_contestSubmissions).values({
    contestId,
    challengeId,
    score,
    submittedByTeam: teamId,
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

export async function revealHint(challengeId: number, hintIndex: number) {
  const cc = TB_contestChallenges;
  const [res] = await db
    .select({ hints: cc.hints, contestId: cc.contestId })
    .from(cc)
    .where(eq(cc.id, challengeId));

  if (!res) throw new Error("Hint not found");

  const hintTaken = (res.hints as any[])[hintIndex];

  const teamId = await getUserTeamId((await getUser()).id);

  await db.insert(TB_contestEvents).values({
    challengeId,
    contestId: res.contestId,
    name: CONTEST_EVENTS.HINT_TAKEN,
    data: hintTaken,
    teamId,
  });

  return hintTaken;
}

/**
 * Get current leaderboard status for contest
 * @param contestId
 */
export async function getLeaderBoard(contestId: number) {
  // get from cache
  // if found return
  // if not make
}

async function makeLeaderBoard(contestId: number) {
  // Use sum of scores method to make a leaderboard
  return sumOfScores(contestId);
}

async function sumOfScores(contestId: number) {
  const cs = TB_contestSubmissions;
  const sumOfScoresRes = await db
    .select({
      teamId: cs.submittedByTeam,
      totalScore: sum(cs.score),
      totalSubmissions: count(),
    })
    .from(cs)
    .where(eq(cs.contestId, contestId))
    .groupBy(cs.submittedByTeam)
    .orderBy(sql`total_score DESC`);

  return sumOfScoresRes;
}

async function quickestInChallenge(contestId: number) {
  const cc = TB_contestChallenges,
    cs = TB_contestSubmissions;

  const minTimeTakenToSolveChallenges = await db
    .select({
      challengeId: cc.id,
      teamId: cs.submittedByTeam,
      timeTaken: sum(cs.timeTaken),
    })
    .from(cc)
    .leftJoin(cs, eq(cc.id, cs.challengeId))
    .where(eq(cc.contestId, contestId))
    .groupBy(cc.id)
    .orderBy(asc(cc.order));

  return minTimeTakenToSolveChallenges;
}

async function sprintingTeam(contestId: number, interval: number) {
  // return {teamId, interval, challengesSolved}
  /**
   
   */

  const cs = TB_contestSubmissions;

  const mostChallengesSolvedInInterval = await db
    .select({
      teamId: cs.submittedByTeam,
      challengesSolved: count(),
    })
    .from(cs)
    .where(eq(cs.contestId, contestId))
    .groupBy(cs.submittedByTeam)
    .orderBy();
}
