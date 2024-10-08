import { arrayToMap, jsonSafeParse } from "@/lib/utils";
import { cache } from "@/services/cache";
import { db } from "@/services/db";
import { TB_contestChallenges, TB_contestSubmissions } from "../../entities";
import { eq } from "drizzle-orm";
import { TB_users } from "@/services/user";
import { TambolaChallengeConfig } from "./types";

export async function getLeaderboardByName(contestId: number, name: string) {
  const cacheKey = `contest:${contestId}:leaderboard:main`;
  const cached = await cache.get(cacheKey);

  if (cached) return jsonSafeParse(cached);

  const cs = TB_contestSubmissions,
    cc = TB_contestChallenges,
    u = TB_users;
  const submissions = await db
    .select({
      challengeId: cs.challengeId,
      userId: cs.submittedByUser,
      userEmail: u.email,
      userName: u.name,
      claim: cs.submission,
      createdAt: cs.createdAt,
      points: cs.score,
    })
    .from(cs)
    .leftJoin(u, eq(u.id, cs.submittedByUser))
    .where(eq(cs.contestId, contestId));

  const challenges = (await db
    .select({ id: cc.id, config: cc.config })
    .from(cc)
    .where(eq(cc.contestId, contestId))) as Array<{
    config: TambolaChallengeConfig;
    id: number;
  }>;

  const challengesById = arrayToMap(
    challenges.map((c) => ({
      ...c,
      patterns: arrayToMap(c.config.winningPatterns, (p) => p.name),
    })),
    (c) => c.id,
  );

  const leaderboardItems = submissions.map((s) => ({
    user: {
      id: s.userId,
      email: s.userEmail,
      name: s.userName,
    },
    claim: {
      title: challengesById[s.challengeId]!.patterns[s.claim!]!.title,
      name: s.claim,
    },
    createdAt: s.createdAt,
    points: s.points,
  }));

  cache.set(cacheKey, JSON.stringify(leaderboardItems));

  return leaderboardItems;
}
