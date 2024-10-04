"use client";
import { Avatar, ProgressBar, Spinner } from "@/shared/components";
import Image, { StaticImageData } from "next/image";

import GoldMedal from "@/assets/media/gold-medal.png";
import SilverMedal from "@/assets/media/silver-medal.png";
import BronzeMedal from "@/assets/media/bronze-medal.png";
import { useMemo } from "react";
import { useTeamsById } from "@/services/team/client";
import { useLeaderboard } from "@/services/contest/client";

const medalURIs: Record<number, StaticImageData> = {
  1: GoldMedal,
  2: SilverMedal,
  3: BronzeMedal,
};

interface Props {
  contestId: number;
  totalChallenges: number;
}

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

export function MainLeaderboard(props: Props) {
  const { leaderboard, hasContestEnded, lastUpdated } = useLeaderboard<{
    rank: number;
    teamId: number;
    score: number;
    challengesSolved: number;
  }>({
    contestId: props.contestId,
    name: "sum_of_scores",
  });

  const teamsOnLeaderboard = useMemo(
    () => leaderboard.map((l) => l.teamId),
    [leaderboard],
  );

  const { teamsById } = useTeamsById({ teamIds: teamsOnLeaderboard });

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
          Challenges Solved
        </div>
        <div role="cell" className="flex-1">
          Points
        </div>
      </div>

      {!hasContestEnded && !leaderboard.length && (
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

      {hasContestEnded && !leaderboard.length && (
        <div className="flex w-full flex-col items-center">
          <p className="py-40 text-gray-300">No data to show here</p>
        </div>
      )}

      <div className="no-scrollbar flex max-h-[560px] w-full flex-col gap-2 overflow-auto rounded-xl">
        {leaderboard.map((entry, i) => (
          <div
            key={entry.teamId}
            role="row"
            className="flex items-center gap-4 rounded-e-xl rounded-s-xl bg-zinc-950 p-3"
          >
            <div role="cell" className="flex flex-1 justify-center">
              <Rank index={i} />
            </div>
            <div role="cell" className="flex flex-[4] items-center gap-2">
              <div className="flex items-center">
                {teamsById[entry.teamId]?.members?.map((member) => (
                  <Avatar
                    key={member.id}
                    rounded
                    username={member.email}
                    title={member.name}
                    size={20}
                    className="-ml-2 rounded-full border border-zinc-950 bg-slate-400 first:ml-0"
                  />
                ))}
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-nowrap">
                {teamsById[entry.teamId]?.name}
              </div>
            </div>
            <div role="cell" className="flex flex-[4] items-center gap-2">
              <div className="w-36">
                <ProgressBar
                  total={props.totalChallenges}
                  value={entry.challengesSolved}
                />
              </div>
              <span className="text-sm text-zinc-400">
                {entry.challengesSolved}/{props.totalChallenges}
              </span>
            </div>
            <div role="cell" className="flex-1 text-lg">
              {entry.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
