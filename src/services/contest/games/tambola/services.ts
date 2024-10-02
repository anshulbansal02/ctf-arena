"use server";

import { generateShuffledRange, jsonSafeParse, randomItem } from "@/lib/utils";
import { getAuthUser } from "@/services/auth";
import { cache } from "@/services/cache";
import { db } from "@/services/db";
import {
  getContestParticipationType,
  TB_contestChallenges,
  TB_contests,
  TB_contestSubmissions,
  TB_participantContestChallenges,
} from "../..";
import { and, asc, count, eq } from "drizzle-orm";
import { contestQueue, eventChannel } from "@/services/queue";
import { getTeamIdByUserId } from "@/services/team";
import contestEvents from "../../events";
import { batchCreateTickets } from "./helpers";
import {
  TambolaGameState,
  TambolaChallengeConfig,
  Ticket,
  TicketItem,
  UserChallengeState,
} from "./types";
import { WinningPatterns } from "./patterns";

export async function initGameState(contestId: number) {
  const [firstChallenge] = await db
    .select({ id: TB_contestChallenges.id })
    .from(TB_contestChallenges)
    .where(eq(TB_contestChallenges.contestId, contestId))
    .orderBy(asc(TB_contestChallenges.order))
    .limit(1);

  const initialState: TambolaGameState = {
    currentChallengeId: firstChallenge.id,
    drawSequence: generateShuffledRange(1, 90),
    itemsDrawn: [],
  };

  await db
    .update(TB_contests)
    .set({ gameState: initialState })
    .where(eq(TB_contests.id, contestId));
}

export async function getNewTicket(seed: number | string): Promise<Ticket> {
  const cacheKey = `contest:game:tambola:tickets:${seed}`;
  const cachedTicketsForContest = jsonSafeParse<Ticket[]>(
    await cache.get(cacheKey),
  );

  if (cachedTicketsForContest) {
    const ticket = cachedTicketsForContest.pop()!;

    if (!cachedTicketsForContest.length) await cache.del(cacheKey);
    else await cache.set(cacheKey, JSON.stringify(cachedTicketsForContest));

    return ticket;
  } else {
    const tickets = batchCreateTickets();
    const ticket = tickets.pop()!;

    await cache.set(cacheKey, JSON.stringify(cachedTicketsForContest));

    return ticket;
  }
}

export async function checkAndClaimWin(
  contestId: number,
  forPattern: string,
  markedItems: TicketItem[],
) {
  return await db.transaction(async (tx) => {
    const user = await getAuthUser();
    const teamId = await getTeamIdByUserId(user.id);
    const participationType = await getContestParticipationType(contestId);

    const [contest] = await tx
      .select({ gameState: TB_contests.gameState })
      .from(TB_contests)
      .where(eq(TB_contests.id, contestId));
    const gameState = contest.gameState as TambolaGameState;
    const currentChallengeId = gameState.currentChallengeId;

    const [challenge] = await tx
      .select()
      .from(TB_contestChallenges)
      .where(eq(TB_contestChallenges.id, currentChallengeId));
    const challengeConfig = challenge.config as TambolaChallengeConfig;

    // Check if the challenge allows this pattern
    const patternConfig = challengeConfig.winningPatterns.find(
      (p) => p.name === forPattern,
    );
    if (!patternConfig) return { error: "Invalid pattern being claimed" };

    // Check if any claims are left for this pattern
    const cs = TB_contestSubmissions;
    const [submissions] = await tx
      .select({ count: count() })
      .from(cs)
      .where(
        and(
          eq(cs.contestId, contestId),
          eq(cs.challengeId, currentChallengeId),
          eq(cs.submission, forPattern),
        ),
      );
    if (submissions.count >= patternConfig.totalClaims)
      return { error: "Claims for this pattern are exhausted" };

    // Check user ticket for valid claim
    const pcc = TB_participantContestChallenges;
    const participantCriteria =
      participationType === "team"
        ? eq(pcc.teamId, teamId!)
        : eq(pcc.userId, user.id);
    const [userChallenge] = (await tx
      .select({ state: pcc.state })
      .from(pcc)
      .where(
        and(
          eq(pcc.contestId, contestId),
          eq(pcc.challengeId, currentChallengeId),
          participantCriteria,
        ),
      )) as [{ state: UserChallengeState }];
    const userTicket = userChallenge.state.ticket;

    const result = WinningPatterns[forPattern](
      userTicket,
      markedItems,
      gameState.itemsDrawn,
    );
    if (!result.isValid) return false;

    // Create submission and update user state
    await tx
      .update(pcc)
      .set({
        state: { ...userChallenge.state, claimedItems: result.claimedItems },
      })
      .where(
        and(
          eq(pcc.contestId, contestId),
          eq(pcc.challengeId, currentChallengeId),
          participantCriteria,
        ),
      );

    const submission = await tx
      .insert(cs)
      .values({
        challengeId: currentChallengeId,
        contestId,
        score: patternConfig.points,
        submittedByUser: user.id,
        submittedByTeam: participationType === "team" ? teamId : null,
        timeTaken: 0,
        submission: forPattern,
      })
      .returning();

    contestQueue.add("submission", submission);

    return submission;
  });
}

export async function getNextContestChallenge(contestId: number) {
  const [contest] = await db
    .select({
      gameState: TB_contests.gameState,
      participationType: TB_contests.participationType,
    })
    .from(TB_contests)
    .where(eq(TB_contests.id, contestId));

  const gameState = contest.gameState as TambolaGameState;
  const currentChallengeId = gameState.currentChallengeId;

  const cc = TB_contestChallenges;

  const [challenge] = await db
    .select()
    .from(cc)
    .where(and(eq(cc.contestId, contestId), eq(cc.id, currentChallengeId)));

  return {
    id: challenge.id,
    name: challenge.name,
    description: challenge.description,
    config: challenge.config as TambolaChallengeConfig,
  };
}

export async function getUserChallenge(contestId: number, challengeId: number) {
  const user = await getAuthUser();
  const teamId = await getTeamIdByUserId(user.id);
  const pcc = TB_participantContestChallenges;

  const participationType = await getContestParticipationType(contestId);

  const participantCriteria =
    participationType === "team"
      ? eq(pcc.teamId, teamId!)
      : eq(pcc.userId, user.id);

  const [userChallenge] = await db
    .select()
    .from(pcc)
    .where(
      and(
        eq(pcc.contestId, contestId),
        eq(pcc.challengeId, challengeId),
        participantCriteria,
      ),
    );

  if (userChallenge) return userChallenge.state as UserChallengeState;

  const initialState: UserChallengeState = {
    ticket: await getNewTicket(contestId),
    claimedItems: [],
  };

  if (!userChallenge) {
    await db.insert(pcc).values({
      contestId,
      challengeId,
      state: initialState,
      ...(participationType === "team" ? { teamId } : { userId: user.id }),
    });
  }

  return initialState;
}

export async function getGameState(contestId: number) {
  const [contest] = await db
    .select({ gameState: TB_contests.gameState })
    .from(TB_contests)
    .where(eq(TB_contests.id, contestId));

  return contest.gameState as TambolaGameState;
}

export async function drawItem(contestId: number) {
  const user = await getAuthUser();
  if (!user.roles.includes("host")) return { error: "You are not a host" };

  const [contest] = (await db
    .select({ gameState: TB_contests.gameState })
    .from(TB_contests)
    .where(eq(TB_contests.id, contestId))) as [
    {
      gameState: TambolaGameState;
    },
  ];

  const nextDraw = randomItem(contest.gameState.drawSequence);

  await db
    .update(TB_contests)
    .set({
      gameState: {
        ...contest.gameState,
        lastDrawnItem: nextDraw,
        itemsDrawn: [...contest.gameState.itemsDrawn, nextDraw],
      } satisfies TambolaGameState,
    })
    .where(eq(TB_contests.id, contestId));

  eventChannel.publish(contestEvents.game(contestId, "item_drawn"), nextDraw);

  return nextDraw;
}

export async function getLastDrawnItem(contestId: number) {
  const [contest] = (await db
    .select({ gameState: TB_contests.gameState })
    .from(TB_contests)
    .where(eq(TB_contests.id, contestId))) as [{ gameState: TambolaGameState }];

  return contest.gameState.lastDrawnItem;
}
