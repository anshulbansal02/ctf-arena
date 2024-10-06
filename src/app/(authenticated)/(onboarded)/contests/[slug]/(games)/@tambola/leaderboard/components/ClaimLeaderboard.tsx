"use client";

import { useLeaderboard } from "@/services/contest/client";
import { useMemo } from "react";

export function ClaimLeaderboard(props: { contestId: number }) {
  const { leaderboard: leaderboardItems, lastUpdated } = useLeaderboard<{
    userId: string;
    userName: string;
    claim: string;
    createdAt: Date;
    points: number;
  }>({
    contestId: props.contestId,
    name: "main",
  });

  const leaderboardByClaim = useMemo(() => {
    if (!leaderboardItems) return [];
    const board = Object.values(
      leaderboardItems.reduce<
        Record<
          string,
          {
            name: string;
            winners: Array<{
              userId: string;
              name: string;
              claimedAt: Date;
            }>;
          }
        >
      >((board, item) => {
        if (!board[item.claim])
          board[item.claim] = { name: item.claim, winners: [] };

        board[item.claim].winners.push({
          userId: item.userId,
          name: item.userName,
          claimedAt: item.createdAt,
        });

        return board;
      }, {}),
    );

    // Sort board lexicographically
    board.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );

    // Sort winners by time
    board.forEach((item) => {
      item.winners.sort((a, b) => +a.claimedAt - +b.claimedAt);
    });

    return board;
  }, [leaderboardItems]);

  return <section>By Claim</section>;
}
