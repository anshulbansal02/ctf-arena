import { jsonSafeParse } from "@/lib/utils";
import { cache } from "@/services/cache";
import { db } from "@/services/db";
import { TB_contestSubmissions } from "../../entities";
import { eq } from "drizzle-orm";
import { TB_users } from "@/services/user";

export async function getLeaderboardByName(contestId: number, name: string) {
  const cached = await cache.get(`contest:${contestId}:leaderboard:${name}`);
  if (cached) return jsonSafeParse(cached);

  const cc = TB_contestSubmissions,
    u = TB_users;
  const submissions = await db
    .select({
      userId: cc.submittedByUser,
      userEmail: u.email,
      userName: u.name,
      claim: cc.submission,
      createdAt: cc.createdAt,
      points: cc.score,
    })
    .from(cc)
    .leftJoin(u, eq(u.id, cc.submittedByUser))
    .where(eq(cc.contestId, contestId));

    console.log({submissions})

  const leaderboardItems = submissions.map((s) => ({
    user: {
      id: s.userId,
      email: s.userEmail,
      name: s.userName,
    },
    claim: {
      title: s.claim,
      name: s.claim,
    },
    createdAt: s.createdAt,
    points: s.points,
  }));

  return leaderboardItems;
}
