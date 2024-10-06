"use client";
import { useLeaderboard } from "@/services/contest/client";
import { useTeamsById } from "@/services/team/client";
import { Spinner } from "@/shared/components";
import { intervalToDuration } from "date-fns";
import { useMemo } from "react";

interface Props {
  contestId: number;
}

function msToDuration(ms: number) {
  const duration = intervalToDuration({ start: 0, end: ms });
  return `${(duration.minutes ?? 0).toString().padStart(2, "0")}:${(duration.seconds ?? 0).toString().padStart(2, "0")}`;
}

export function QuickestAtLeaderboard(props: Props) {
  const { leaderboard, hasContestEnded, lastUpdated } = useLeaderboard<{
    challengeId: number;
    order: number;
    teamId: number;
    timing?: number;
  }>({
    contestId: props.contestId,
    name: "quickest_firsts",
  });

  const teamsOnLeaderboard = useMemo(
    () => leaderboard?.map((l) => l.teamId) ?? [],
    [leaderboard],
  );

  const { teamsById } = useTeamsById({ teamIds: teamsOnLeaderboard });

  return (
    <div role="table" className="flex w-full flex-col gap-2">
      <div
        role="rowheader"
        className="flex gap-4 px-3 py-1 text-left text-base text-zinc-400"
      >
        <div role="cell" className="flex-[2]">
          Challenge
        </div>
        <div role="cell" className="flex-[4]">
          Team
        </div>
        <div role="cell" className="flex-[2]">
          Timing
        </div>
      </div>

      {!hasContestEnded && !leaderboard?.length && (
        <div className="flex w-full flex-col items-center">
          {!lastUpdated && (
            <Spinner
              color="rgba(255,255,255,0.25)"
              className="mt-20"
              size={16}
            />
          )}

          {lastUpdated && (
            <p className="py-40">
              Waiting for someone to make the first submission.
            </p>
          )}
        </div>
      )}

      {hasContestEnded && !leaderboard?.length && (
        <div className="flex w-full flex-col items-center">
          <p className="py-40 text-gray-300">No data to show here</p>
        </div>
      )}

      <div className="no-scrollbar flex max-h-[360px] w-full flex-col gap-2 overflow-auto rounded-xl">
        {leaderboard?.map((entry) => (
          <div
            key={entry.challengeId}
            role="row"
            className="flex items-center gap-4 rounded-e-xl rounded-s-xl bg-zinc-950 p-3"
          >
            <div role="cell" className="flex-[2]">
              {entry.order}
            </div>
            <div role="cell" className="flex-[4]">
              {teamsById[entry.teamId]?.name ?? "-"}
            </div>
            <div role="cell" className="flex-[2]">
              {entry.timing ? msToDuration(entry.timing) + " min" : "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
