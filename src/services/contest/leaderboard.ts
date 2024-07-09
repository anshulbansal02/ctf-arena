import { cache } from "@/services/cache";

type ContestSubmission = {
  submissionId: number;
  contestId: number;
  challengeId: number;
  challengeOrder: number;
  teamId: number;
  score: number;
  timeTaken: number;
  createdAt: Date;
};

export type Leaderboard =
  | "sprinting_teams"
  | "quickest_firsts"
  | "sum_of_scores";

export const leaderboardKey = (
  type: Leaderboard,
  contestId: number,
  detail: "raw" | "prepared",
) => `contest:${contestId}:leaderboard:${type}:${detail}`;

export const leaderboardUpdateChannel = (
  type: Leaderboard,
  contestId: number,
) => `channel:${leaderboardKey(type, contestId, "prepared")}:update`;

export async function purgeBuildAndNotify(
  type: Leaderboard,
  contestId: number,
) {
  await cache.del(leaderboardKey(type, contestId, "prepared"));
  await getByName(type, contestId);
  cache.publish(
    leaderboardUpdateChannel(type, contestId),
    JSON.stringify(Date.now()),
  );
}

export async function sumOfScoresProcessor(submission: ContestSubmission) {
  const { contestId, score, teamId } = submission;

  await cache.zIncrBy(
    leaderboardKey("sum_of_scores", contestId, "raw"),
    score,
    teamId.toString(),
  );

  purgeBuildAndNotify("sum_of_scores", contestId);
}

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

export async function sprintingTeamsProcessor(submission: ContestSubmission) {
  const { contestId, teamId, createdAt } = submission;

  const score = +`${+createdAt}.${teamId}`;

  await cache.zAdd(leaderboardKey("sprinting_teams", contestId, "raw"), [
    { score, value: teamId.toString() },
  ]);

  purgeBuildAndNotify("sprinting_teams", contestId);
}

export async function getQuickestFirsts(contestId: number) {
  const cacheKey = leaderboardKey("quickest_firsts", contestId, "prepared");
  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

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

export async function getSprintingTeams(contestId: number) {
  const cacheKey = leaderboardKey("sprinting_teams", contestId, "prepared");
  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

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

export async function getSumOfScores(contestId: number) {
  const cacheKey = leaderboardKey("sum_of_scores", contestId, "prepared");
  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const scores = await cache.zRangeWithScores(
    leaderboardKey("sum_of_scores", contestId, "raw"),
    0,
    -1,
  );

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
      challengesSolved: 0,
    };
  });

  cache.set(cacheKey, JSON.stringify(leaderboard));

  return leaderboard;
}

export async function getByName(name: Leaderboard, contestId: number) {
  switch (name) {
    case "sum_of_scores":
      return getSumOfScores(contestId);
    case "quickest_firsts":
      return getQuickestFirsts(contestId);
    case "sprinting_teams":
      return getSprintingTeams(contestId);
  }
}
