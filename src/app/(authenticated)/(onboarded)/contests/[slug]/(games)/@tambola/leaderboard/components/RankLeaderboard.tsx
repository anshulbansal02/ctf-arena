"use client";

import { useLeaderboard } from "@/services/contest/client";
import { Avatar, ProgressBar, Spinner } from "@/shared/components";
import GoldMedal from "@/assets/media/gold-medal.png";
import SilverMedal from "@/assets/media/silver-medal.png";
import BronzeMedal from "@/assets/media/bronze-medal.png";
import { useMemo } from "react";
import Image, { StaticImageData } from "next/image";
import { useAction } from "@/shared/hooks";
import { getContestChallenges } from "@/services/contest/games/tambola";

const medalURIs: Record<number, StaticImageData> = {
  1: GoldMedal,
  2: SilverMedal,
  3: BronzeMedal,
};

function Rank({ index }: { index: number }) {
  const rank = index + 1;
  if (rank > 3) return rank;

  return (
    <Image
      src={medalURIs[rank]}
      alt="Medal"
      className="w-8"
      width={100}
      height={100}
    />
  );
}

type User = {
  id: string;
  name: string;
  email: string;
};

export function RankLeaderboard(props: { contestId: number }) {
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

  const { data: challenges, loading: loadingChallenges } = useAction(
    getContestChallenges,
    {
      args: [props.contestId],
      immediate: true,
    },
  );

  const totalWins = challenges?.reduce(
    (count, challenge) => challenge.config.winningPatterns.length + count,
    0,
  );

  const leaderboardByRank = useMemo(() => {
    if (!leaderboardItems) return [];
    const board = Object.values(
      leaderboardItems.reduce<
        Record<
          string,
          {
            user: User;
            points: number;
            wins: Array<{ claim: { name: string; title: string }; at: Date }>;
          }
        >
      >((board, item) => {
        if (!board[item.user.id])
          board[item.user.id] = {
            user: item.user,
            points: item.points,
            wins: [],
          };

        board[item.user.id].points += item.points;
        board[item.user.id].wins.push({
          at: item.createdAt,
          claim: item.claim,
        });

        return board;
      }, {}),
    ).toSorted((a, b) => b.points - a.points);

    // Sort each win of user by their time
    board.forEach((user) => {
      user.wins.sort((a, b) => +b.at - +a.at);
    });

    // Assign ranks
    let rank = 0,
      lastUserPoints = Infinity;
    return board.map((user) => {
      const newRank = user.points < lastUserPoints ? ++rank : rank;
      lastUserPoints = user.points;
      return { ...user, rank: newRank };
    });
  }, [leaderboardItems]);

  return (
    <div role="table" className="relative flex w-full flex-col gap-2">
      <div
        role="rowheader"
        className="flex gap-4 px-3 py-1 text-left text-base text-zinc-400"
      >
        <div role="cell" className="flex-1">
          &nbsp;
        </div>
        <div role="cell" className="flex-[4]">
          Team
        </div>
        <div role="cell" className="flex-[4]">
          Wins Claimed
        </div>
        <div role="cell" className="flex-1">
          Points
        </div>
      </div>

      {!leaderboardByRank.length && (
        <div className="flex w-full flex-col items-center">
          {!lastUpdated && (
            <Spinner
              color="rgba(255,255,255,0.25)"
              className="mt-20"
              size={24}
            />
          )}

          {lastUpdated && (
            <p className="py-40">
              Waiting for someone to make the first submission.
            </p>
          )}
        </div>
      )}

      <div className="no-scrollbar flex max-h-[560px] w-full flex-col gap-2 overflow-auto rounded-xl">
        {leaderboardByRank.map((entry, i) => (
          <div
            key={entry.user.id}
            role="row"
            className="flex items-center gap-4 rounded-e-xl rounded-s-xl bg-zinc-900 p-3"
          >
            <div role="cell" className="flex flex-1 justify-center">
              <Rank index={i} />
            </div>
            <div role="cell" className="flex flex-[4] items-center gap-2">
              <div className="flex items-center">
                <Avatar
                  rounded
                  username={entry.user.email}
                  title={entry.user.name}
                  size={24}
                  className="-ml-2 rounded-full border border-zinc-900 bg-slate-400 first:ml-0"
                />
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-nowrap">
                {entry.user.name}
              </div>
            </div>
            <div role="cell" className="flex flex-[4] items-center gap-2">
              {totalWins && (
                <>
                  <div className="w-36">
                    <ProgressBar total={totalWins} value={entry.wins.length} />
                  </div>
                  <span className="text-sm text-zinc-400">
                    {entry.wins.length}/{totalWins}
                  </span>
                </>
              )}
            </div>
            <div role="cell" className="flex-1 text-lg">
              {entry.points}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
