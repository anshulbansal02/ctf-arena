"use client";
import { useTeamsById } from "@/services/team/client";
import { intervalToDuration } from "date-fns";
import { useEffect, useMemo, useState } from "react";

interface Props {
  contestId: number;
}

function msToDuration(ms: number) {
  const duration = intervalToDuration({ start: 0, end: ms });
  return `${(duration.minutes ?? 0).toString().padStart(2, "0")}:${(duration.seconds ?? 0).toString().padStart(2, "0")}`;
}

export function QuickestAtLeaderboard(props: Props) {
  const [leaderboard, setLeaderboard] = useState<
    Array<{
      challengeId: number;
      order: number;
      teamId: number;
      timing?: number;
    }>
  >([]);

  const [contestEnded, setContestEnded] = useState(false);

  const teamsOnLeaderboard = useMemo(
    () => leaderboard.map((l) => l.teamId),
    [leaderboard],
  );

  const { teamsById } = useTeamsById({ teamIds: teamsOnLeaderboard });

  useEffect(() => {
    const leaderboardEvents = new EventSource(
      `/api/hook/leaderboard/${props.contestId}/update?type=quickest_firsts`,
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
  }, [props.contestId]);

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

      <div className="no-scrollbar flex max-h-[360px] w-full flex-col gap-2 overflow-auto rounded-xl">
        {leaderboard.map((entry) => (
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
