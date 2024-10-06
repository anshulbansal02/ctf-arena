"use client";

import { useLeaderboard } from "@/services/contest/client";
import { Avatar } from "@/shared/components";
import { useMemo } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

export function ClaimLeaderboard(props: { contestId: number }) {
  const { leaderboard: leaderboardItems, lastUpdated } = useLeaderboard<{
    user: User;
    claim: {
      title: string;
      name: string;
    };
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
            title: string;
            winners: Array<{
              user: User;
              claimedAt: Date;
            }>;
          }
        >
      >((board, item) => {
        if (!board[item.claim.name])
          board[item.claim.name] = {
            name: item.claim.name,
            title: item.claim.title,
            winners: [],
          };

        board[item.claim.name].winners.push({
          user: item.user,
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

  return (
    <div role="table" className="flex w-full flex-col gap-2">
      <div
        role="rowheader"
        className="flex gap-4 px-3 py-1 text-left text-base text-zinc-400"
      >
        <div role="cell" className="flex-[2]">
          Claim
        </div>
        <div role="cell" className="flex-[6]">
          Winners
        </div>
      </div>

      <div className="no-scrollbar flex max-h-[360px] w-full flex-col gap-2 overflow-auto rounded-xl">
        {leaderboardByClaim?.map((entry) => (
          <div
            key={entry.name}
            role="row"
            className="flex items-center gap-4 rounded-e-xl rounded-s-xl bg-zinc-950 p-3"
          >
            <div role="cell" className="flex-[2]">
              {entry.title}
            </div>
            <div role="cell" className="flex-[6]">
              <ul className="flex flex-wrap items-center gap-3">
                {entry.winners.map((winner) => (
                  <li key={winner.user.id} className="flex items-center gap-1">
                    <Avatar
                      username={winner.user.email}
                      title={winner.user.name}
                      size={24}
                      className="-ml-2 rounded-full border border-zinc-950 bg-slate-400 first:ml-0"
                    />
                    <span>{winner.user.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
