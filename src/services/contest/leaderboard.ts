import { cache } from "@/services/cache";
import { db } from "../db";
import { TB_contestChallenges, TB_contestSubmissions } from "./entities";
import { desc, eq, gt, min, sum } from "drizzle-orm";
import { subMinutes } from "date-fns";
import { contestChannel } from "@/services/queue";

/** === TYPES === */

export type ContestSubmission = {
  submissionId: number;
  contestId: number;
  challengeId: number;
  challengeOrder: number;
  teamId: number;
  score: number;
  timeTaken: number;
  createdAt: string;
};

export type Leaderboard =
  | "sprinting_teams"
  | "quickest_firsts"
  | "sum_of_scores";

/** === HELPERS === */

export const leaderboardKey = (
  type: Leaderboard,
  contestId: number,
  detail: "raw" | "prepared",
) => `contest:${contestId}:leaderboard:${type}:${detail}`;

export const leaderboardUpdateChannelName = (
  type: Leaderboard,
  contestId: number,
) => `channel:${leaderboardKey(type, contestId, "prepared")}:update`;

export async function purgeBuildAndNotify(
  type: Leaderboard,
  contestId: number,
) {
  await cache.del(leaderboardKey(type, contestId, "prepared"));
  await getLeaderboardByName(type, contestId);
  contestChannel.publisher.publish(
    leaderboardUpdateChannelName(type, contestId),
    JSON.stringify(new Date()),
  );
}

/** === LEADERBOARDS === */

/** Sum Of Scores */
export async function sumOfScoresProcessor(submission: ContestSubmission) {
  const { contestId, score, teamId } = submission;

  await cache.zIncrBy(
    leaderboardKey("sum_of_scores", contestId, "raw"),
    score,
    teamId.toString(),
  );

  purgeBuildAndNotify("sum_of_scores", contestId);
}

export async function getSumOfScores(contestId: number) {
  const cacheKey = leaderboardKey("sum_of_scores", contestId, "prepared");
  const cached = await cache.get(cacheKey);

  if (cached) return JSON.parse(cached);

  if (
    !(await cache.exists(leaderboardKey("sum_of_scores", contestId, "raw")))
  ) {
    await rebuildSumOfScores(contestId);
  }

  const scores = await cache.zRangeWithScores(
    leaderboardKey("sum_of_scores", contestId, "raw"),
    0,
    -1,
  );

  const cs = TB_contestSubmissions;
  const challengesSolvedByEachTeam = await db
    .select({ teamId: cs.submittedByTeam, count: sum(cs.submittedByTeam) })
    .from(cs)
    .where(eq(cs.contestId, contestId))
    .groupBy(cs.submittedByTeam);

  let currentRank = 0,
    lastScore = 0;
  const leaderboard = scores.map((entry) => {
    const { score, value: teamId } = entry;

    if (lastScore !== score) currentRank++;
    lastScore = score;

    return {
      rank: currentRank,
      teamId: +teamId,
      score,
      challengesSolved: challengesSolvedByEachTeam.find(
        (k) => k.teamId === +teamId,
      )?.count,
    };
  });

  cache.set(cacheKey, JSON.stringify(leaderboard));

  return leaderboard;
}

export async function rebuildSumOfScores(contestId: number) {
  const cs = TB_contestSubmissions;
  const sumOfScores = await db
    .select({
      totalScore: sum(cs.score),
      teamId: cs.submittedByTeam,
    })
    .from(cs)
    .where(eq(cs.contestId, contestId))
    .groupBy(cs.submittedByTeam)
    .orderBy(desc(sum(cs.score)));

  const records = sumOfScores.map((record) => ({
    score: +record.totalScore!,
    value: record.teamId.toString(),
  }));

  const key = leaderboardKey("sum_of_scores", contestId, "raw");

  await cache.del(key);
  if (records.length) await cache.zAdd(key, records);

  purgeBuildAndNotify("sum_of_scores", contestId);
}

/** Sprinting Teams */
export async function sprintingTeamsProcessor(submission: ContestSubmission) {
  const { contestId, teamId, createdAt } = submission;

  const score = +`${+new Date(createdAt)}.${teamId}`;

  await cache.zAdd(leaderboardKey("sprinting_teams", contestId, "raw"), [
    { score, value: teamId.toString() },
  ]);

  purgeBuildAndNotify("sprinting_teams", contestId);
}

export async function getSprintingTeams(contestId: number) {
  const cacheKey = leaderboardKey("sprinting_teams", contestId, "prepared");
  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  if (
    !(await cache.exists(leaderboardKey("sprinting_teams", contestId, "raw")))
  ) {
    await rebuildSprintingTeams(contestId);
  }

  const timeBoundary = 30 * 60 * 1000;

  const submissionsTimeline = await cache.zRangeWithScores(
    leaderboardKey("sprinting_teams", contestId, "raw"),
    Date.now(),
    timeBoundary,
  );

  const submissionsByTeam: Record<string, number> = {};
  submissionsTimeline.forEach(({ value: teamId }) => {
    if (!submissionsByTeam[teamId]) submissionsByTeam[teamId] = 0;
    submissionsByTeam[teamId]++;
  });

  const leaderboard = Object.entries(submissionsByTeam).map((o) => ({
    teamId: +o[0],
    submissions: o[1],
  }));

  cache.set(cacheKey, JSON.stringify(leaderboard));

  return leaderboard;
}

export async function rebuildSprintingTeams(contestId: number) {
  const cs = TB_contestSubmissions;
  const last30MinutesSubmissions = await db
    .select({
      createdAt: cs.createdAt,
      teamId: cs.submittedByTeam,
    })
    .from(cs)
    .orderBy(desc(cs.createdAt))
    .where(gt(cs.createdAt, subMinutes(new Date(), 30)));

  const records = last30MinutesSubmissions.map((record) => ({
    score: +record.createdAt,
    value: record.teamId.toString(),
  }));

  const key = leaderboardKey("sprinting_teams", contestId, "raw");

  await cache.del(key);
  if (records.length) await cache.zAdd(key, records);

  purgeBuildAndNotify("sprinting_teams", contestId);
}

/** Quickest Firsts */
export async function quickestFirstsProcessor(submission: ContestSubmission) {
  const { contestId, timeTaken, teamId, challengeId, challengeOrder } =
    submission;

  const key = leaderboardKey("quickest_firsts", contestId, "raw");

  const challengeRecord = await cache.hGet(key, challengeId.toString());

  let newRecord;

  if (challengeRecord) {
    const { timing } = JSON.parse(challengeRecord);
    if (timeTaken < timing)
      newRecord = {
        order: challengeOrder,
        teamId,
        timing: timeTaken,
      };
  } else {
    newRecord = {
      order: challengeOrder,
      teamId,
      timing: timeTaken,
    };
  }

  if (newRecord) {
    await cache.hSet(key, challengeId.toString(), JSON.stringify(newRecord));
    purgeBuildAndNotify("quickest_firsts", contestId);
  }
}

export async function getQuickestFirsts(contestId: number) {
  const cacheKey = leaderboardKey("quickest_firsts", contestId, "prepared");
  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  if (
    !(await cache.exists(leaderboardKey("quickest_firsts", contestId, "raw")))
  ) {
    await rebuildQuickestFirsts(contestId);
  }

  const records = await cache.hGetAll(
    leaderboardKey("quickest_firsts", contestId, "raw"),
  );

  const leaderboard = Object.entries(records)
    .map<{
      challengeId: number;
      order: number;
      teamId: number | null;
      timing: number | null;
    }>(([challengeId, record]) => ({
      challengeId,
      ...JSON.parse(record),
    }))
    .toSorted((a, b) => a.order - b.order);

  cache.set(cacheKey, JSON.stringify(leaderboard));

  return leaderboard;
}

export async function rebuildQuickestFirsts(contestId: number) {
  const cs = TB_contestSubmissions,
    cc = TB_contestChallenges;
  const quickestFirsts = await db
    .select({
      challengeId: cs.challengeId,
      order: cc.order,
      timeTaken: min(cs.timeTaken),
      teamId: cs.submittedByTeam,
    })
    .from(cs)
    .leftJoin(cc, eq(cc.id, cs.challengeId))
    .where(eq(cs.contestId, contestId))
    .groupBy(cs.challengeId, cc.order, cs.submittedByTeam);

  const records = quickestFirsts.flatMap((record) => [
    record.challengeId.toString(),
    JSON.stringify({
      order: record.order,
      teamId: record.teamId,
      timing: record.timeTaken,
    }),
  ]);

  const key = leaderboardKey("quickest_firsts", contestId, "raw");

  await cache.del(key);
  if (records.length) await cache.hSet(key, records);

  purgeBuildAndNotify("quickest_firsts", contestId);
}

/* === SERVICES === */

export async function getLeaderboardByName(
  name: Leaderboard,
  contestId: number,
) {
  switch (name) {
    case "sum_of_scores":
      return getSumOfScores(contestId);
    case "quickest_firsts":
      return getQuickestFirsts(contestId);
    case "sprinting_teams":
      return getSprintingTeams(contestId);
  }
}

export async function getTeamRankAndScore(contestId: number, teamId: number) {
  const args = [
    leaderboardKey("sum_of_scores", contestId, "raw"),
    teamId.toString(),
  ];
  const [rank, score] = await Promise.all([
    cache.zRank(args[0], args[1]),
    cache.zScore(args[0], args[1]),
  ]);
  return { rank, score };
}

export async function commitLeaderboards(contestId: number) {}
