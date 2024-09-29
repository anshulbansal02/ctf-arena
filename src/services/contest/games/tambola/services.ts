"use server";

import {
  generateShuffledRange,
  isSubset,
  jsonSafeParse,
  popRandom,
  randomInt,
} from "@/lib/utils";
import { getAuthUser } from "@/services/auth";
import { cache } from "@/services/cache";
import { db } from "@/services/db";
import {
  TB_contestChallenges,
  TB_contests,
  TB_participantContestChallenges,
} from "../..";
import { and, eq } from "drizzle-orm";
import { eventChannel } from "@/services/queue";
import { getTeamIdByUserId } from "@/services/team";

export type TicketItem = number;
export type Ticket = TicketItem[][];
type RuleChecker = (ticket: Ticket, marked: TicketItem[]) => boolean;

export async function getNewTicket(seed: number | string): Promise<Ticket> {
  let ticket: Ticket;

  const cacheKey = `contest:game:tambola:tickets:${seed}`;
  const cachedTicketsForContest = jsonSafeParse<Ticket[]>(
    await cache.get(cacheKey),
  );

  if (cachedTicketsForContest) {
    ticket = cachedTicketsForContest.pop()!;

    if (cachedTicketsForContest.length) await cache.del(cacheKey);
    else await cache.set(cacheKey, JSON.stringify(cachedTicketsForContest));
  }

  const tickets = batchCreateTickets();
  ticket = tickets.pop()!;

  await cache.set(cacheKey, JSON.stringify(cachedTicketsForContest));

  return ticket;
}

const rules: Record<string, RuleChecker> = {
  TopLine: (ticket, marked) => {
    const topRowNumbers = ticket.at(0)!.filter(Boolean);
    return isSubset(marked, topRowNumbers);
  },
  MiddleLine: (ticket, marked) => {
    const middleRowNumbers = ticket[~~(ticket.length / 2)];
    return isSubset(marked, middleRowNumbers);
  },
  BottomLine: (ticket, marked) => {
    const bottomRowNumbers = ticket.at(-1)!.filter(Boolean);
    return isSubset(marked, bottomRowNumbers);
  },
  Corners: (ticket, marked) => {
    const topRow = ticket.at(-1)!.filter(Boolean);
    const bottomRow = ticket.at(-1)!.filter(Boolean);
    const corners = [
      topRow.at(0)!,
      topRow.at(-1)!,
      bottomRow.at(0)!,
      bottomRow.at(-1)!,
    ];
    return isSubset(marked, corners);
  },
  CornersWithStar: (ticket, marked) => {
    const topRow = ticket.at(-1)!.filter(Boolean);
    const bottomRow = ticket.at(-1)!.filter(Boolean);
    const corners = [
      topRow.at(0)!,
      topRow.at(-1)!,
      bottomRow.at(0)!,
      bottomRow.at(-1)!,
    ];
    const centerNumber =
      ticket[~~(ticket.length / 2)][~~(ticket[0].length / 2)];
    return isSubset(marked, [...corners, centerNumber]);
  },
  FullHouse: (ticket, marked) => {
    const allNumbers = ticket.flatMap((row) => row).filter(Boolean);
    return isSubset(marked, allNumbers);
  },
  EarlyFive: (ticket, marked) => {
    return marked.length >= 5;
  },
  EarlySeven: (ticket, marked) => {
    return marked.length >= 7;
  },
  Center: (ticket, marked) => {
    const centerNumber =
      ticket[~~(ticket.length / 2)][~~(ticket[0].length / 2)];
    return isSubset(marked, [centerNumber]);
  },
};

export async function checkAndClaimWin(
  contestId: number,
  forPattern: keyof typeof rules,
  markedItems: TicketItem[],
) {
  const user = await getAuthUser();

  // get current challenge
  // get ticket for user, contest, challenge
  // check if claims are remaining for pattern from contest config and submissions
  // check numbers that should be marked for rule for given ticket
  // check user marked numbers are valid from contest global state and also all pattern numbers are matched
  // create submission for claim
  // update user_contest_challenge ticket marked numbers to be claimed

  const ticket: Ticket = [];

  const rule = rules[forPattern];
  rule(ticket, markedItems);
}

function batchCreateTickets(): Ticket[] {
  const totalBuckets = 9;
  const bucketSize = 10;
  const batchSize = 6;
  const fullTicketSize = 15;

  // Create number buckets
  const buckets: Array<number>[] = Array.from(
    { length: totalBuckets },
    (_, bucketIdx) =>
      Array.from({ length: bucketSize }, (_, i) => bucketSize * bucketIdx + i),
  );
  // Remove 0 from first bucket
  buckets.at(0)!.shift();
  // Add 90 to last bucket
  buckets.at(-1)!.push(90);

  // Create tickets with column sets
  const tickets: Ticket[] = Array.from({ length: batchSize }, () =>
    Array.from({ length: totalBuckets }, () => []),
  );

  // Fill each column of each ticket with random item from corresponding bucket
  tickets.forEach((ticket) => {
    buckets.forEach((bucket, col) => {
      ticket[col].push(popRandom(bucket));
    });
  });

  const isTicketFull = (ticket: (typeof tickets)[0]) =>
    ticket.reduce((agg, col) => col.length + agg, 0) === fullTicketSize;

  let itemsLeft = bucketSize * totalBuckets - batchSize * totalBuckets;
  while (itemsLeft) {
    buckets.forEach((bucket, col) => {
      if (!bucket.length) return;

      let ticketIdx = randomInt(0, tickets.length);
      let ticket = tickets[ticketIdx];
      let pass = 1;

      while (ticket[col].length === 3 || isTicketFull(ticket)) {
        // Stuck
        if (!isTicketFull(ticket) && pass > 5) {
          // Find ticket having non-filled same column
          let exchangerIdx = (ticketIdx + 1) % tickets.length;
          while (tickets[exchangerIdx][col].length === 3)
            exchangerIdx = (exchangerIdx + 1) % tickets.length;

          // Since exchanger ticket could be filled, borrow from some other col of the ticket
          let exchangeCol = (col + 1) % totalBuckets;

          while (
            !(
              tickets[exchangerIdx][exchangeCol].length > 1 &&
              ticket[exchangeCol].length < 3 &&
              exchangeCol !== col
            )
          )
            exchangeCol = (exchangeCol + 1) % totalBuckets;

          // Add number to exchanger ticket
          itemsLeft--;
          tickets[exchangerIdx][col].push(popRandom(bucket));
          ticket[exchangeCol].push(
            popRandom(tickets[exchangerIdx][exchangeCol])!,
          );

          return;
        }

        pass++;
        ticketIdx = (ticketIdx + 1) % tickets.length;
        ticket = tickets[ticketIdx];
      }

      itemsLeft--;
      ticket[col].push(popRandom(bucket));
    });
  }

  const createEmptyTicket = (x: number, y: number): Ticket =>
    Array.from({ length: x }, () => Array(y).fill(0));

  // Distribute numbers
  return tickets.map((rawTicket) => {
    // Sort raw ticket col numbers
    rawTicket.forEach((col) => col.sort().reverse());

    const ticket = createEmptyTicket(3, 9);
    const rowFillCount = Array(3).fill(0);

    // Fill columns having 3 numbers
    rawTicket.forEach((nums, col) => {
      if (!(nums.length === 3)) return;
      ticket.forEach((row, i) => {
        row[col] = nums.pop()!;
        rowFillCount[i]++;
      });
    });

    // Fill column having 2 numbers
    rawTicket.forEach((nums, col) => {
      if (!(nums.length === 2)) return;

      let i = randomInt(0, 3);
      while (rowFillCount[i] === 5) i = (i + 1) % 3;

      let j = randomInt(0, 3);
      while (rowFillCount[j] === 5 || j === i) j = (j + 1) % 3;

      const num1 = nums.pop()!,
        num2 = nums.pop()!;

      if (i < j) {
        ticket[i][col] = num1;
        ticket[j][col] = num2;
      } else {
        ticket[j][col] = num1;
        ticket[i][col] = num2;
      }
      rowFillCount[i]++;
      rowFillCount[j]++;
    });

    // Fill columns having only 1 number
    rawTicket.forEach((nums, col) => {
      if (!(nums.length === 1)) return;
      let i = randomInt(0, 3);
      while (rowFillCount[i] === 5) i = (i + 1) % 3;
      ticket[i][col] = nums.pop()!;
      rowFillCount[i]++;
    });

    return ticket;
  });
}

export async function drawNumber(contestId: number) {
  const user = await getAuthUser();
  if (!user.roles.includes("host")) return { error: "You are not a host" };

  const [contest] = (await db
    .select({ gameState: TB_contests.gameState })
    .from(TB_contests)
    .where(eq(TB_contests.id, contestId))) as [
    {
      gameState?: {
        drawSequence: TicketItem[];
      };
    },
  ];

  const drawSequence =
    contest.gameState?.drawSequence ?? generateShuffledRange(1, 90);
  const nextDraw = popRandom(drawSequence);

  await db
    .update(TB_contests)
    .set({ gameState: { drawSequence, nextDraw } })
    .where(eq(TB_contests.id, contestId));

  eventChannel.publish("contest:game:tambola:event:draw_item", nextDraw);

  return nextDraw;
}

export async function getNextContestChallenge(contestId: number) {
  const user = await getAuthUser();
  const teamId = await getTeamIdByUserId(user.id);

  const [contest] = await db
    .select({
      gameState: TB_contests.gameState,
      participationType: TB_contests.participationType,
    })
    .from(TB_contests)
    .where(eq(TB_contests.id, contestId));

  const gameState = contest.gameState as { currentChallengeId: number };

  const currentChallengeId = gameState.currentChallengeId;

  const pcc = TB_participantContestChallenges,
    cc = TB_contestChallenges;

  const [challenge] = await db
    .select()
    .from(cc)
    .where(and(eq(cc.contestId, contestId), eq(cc.id, currentChallengeId)));

  let [userChallenge] = (await db
    .select({ state: pcc.state })
    .from(pcc)
    .where(
      and(
        eq(pcc.contestId, contestId),
        eq(pcc.challengeId, currentChallengeId),
        eq(pcc.userId, user.id),
      ),
    )) as [{ state: { ticket: Ticket; claimedItems: TicketItem[] } }];

  if (!userChallenge) {
    const ticket = await getNewTicket(contestId);

    console.table(ticket);

    await db.insert(pcc).values({
      contestId,
      challengeId: challenge.id,
      ...(contest.participationType === "individual"
        ? { userId: user.id }
        : { teamId: teamId }),
      state: {
        ticket,
        claimedItems: [],
      },
    });
  }

  return {
    id: challenge.id,
    name: challenge.name,
    description: challenge.description,
    ticket: userChallenge.state.ticket,
    claimedItems: userChallenge.state.claimedItems,
    winningRules: (challenge.metadata as { winningRules: [] }).winningRules,
  };
}
