"use client";
import { Avatar, ProgressBar } from "@/shared/components";
import Image, { StaticImageData } from "next/image";

import GoldMedal from "@/assets/media/gold-medal.png";
import SilverMedal from "@/assets/media/silver-medal.png";
import BronzeMedal from "@/assets/media/bronze-medal.png";
import { useEffect, useMemo, useState } from "react";
import { useTeamsById } from "@/services/team/client";

const medalURIs: Record<number, StaticImageData> = {
  1: GoldMedal,
  2: SilverMedal,
  3: BronzeMedal,
};

type LeaderboardData = Array<{
  rank: number;
  teamId: number;
  score: number;
  challengesSolved: number;
}>;

interface Props {
  contestId: number;
  staticData?: LeaderboardData;
}

function Rank({ index }: { index: number }) {
  const rank = index + 1;
  if (rank > 3) return rank;

  return (
    <Image
      src={medalURIs[rank]}
      alt="Picture of the author"
      className="w-8"
      width={100}
      height={100}
    />
  );
}

export function MainLeaderboard(props: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>(
    () => props.staticData ?? [],
  );
  const [contestEnded, setContestEnded] = useState(false);

  const isStaticLeaderboard = Boolean(props.staticData);

  const teamsOnLeaderboard = useMemo(
    () => leaderboard.map((l) => l.teamId),
    [leaderboard],
  );

  const { teamsById } = useTeamsById({ teamIds: teamsOnLeaderboard });

  useEffect(() => {
    if (!isStaticLeaderboard) {
      const leaderboardEvents = new EventSource(
        `/api/hook/leaderboard/${props.contestId}/update?type=sum_of_scores`,
      );

      leaderboardEvents.addEventListener("leaderboard_update", (e) => {
        const data = e.data;
        try {
          const updatedLeaderboard = JSON.parse(data);
          setLeaderboard(updatedLeaderboard);
        } catch {}
      });

      leaderboardEvents.addEventListener("contest_ended", () => {
        setContestEnded(true);
      });

      return () => {
        leaderboardEvents.close();
      };
    }
  }, [props.contestId]);

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
                <ProgressBar total={8} value={entry.challengesSolved} />
              </div>
              <span className="text-sm text-zinc-400">
                {entry.challengesSolved}/8
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
