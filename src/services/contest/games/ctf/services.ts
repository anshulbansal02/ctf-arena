import { and, desc, eq } from "drizzle-orm";
import {
  TB_contestChallenges,
  TB_contestEvents,
  TB_contests,
  TB_contestSubmissions,
} from "../..";
import { db } from "@/services/db";
import { getAuthUser } from "@/services/auth";
import { getTeamIdByUserId } from "@/services/team";
import { submissionComparator } from "@/lib/utils";
import { CONTEST_EVENTS } from "../../helpers";
import { contestQueue } from "@/services/queue";

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
      isUnranked: TB_contests.unranked,
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

  if (!contest.isUnranked)
    contestQueue.add("submission", {
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
