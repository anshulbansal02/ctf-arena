import { useTeamsById } from "@/services/team/client";
import { useEffect, useMemo, useState } from "react";

interface Props {
  contestId: number;
}

export function SprintersLeaderboard(props: Props) {
  const [leaderboard, setLeaderboard] = useState<
    Array<{
      teamId: number;
      challengesSolved: number;
    }>
  >([]);

  const teamsOnLeaderboard = useMemo(
    () => leaderboard.map((l) => l.teamId),
    [leaderboard],
  );

  const { teamsById } = useTeamsById({ teamIds: teamsOnLeaderboard });

  useEffect(() => {
    const leaderboardEvents = new EventSource(
      `/hook/leaderboard/${props.contestId}/update?type=sprinting_teams`,
    );

    leaderboardEvents.onmessage = (event) => {
      const data = event.data;
      try {
        const updatedLeaderboard = JSON.parse(data);
        setLeaderboard(updatedLeaderboard);
      } catch {}
    };

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
        <div role="cell" className="flex-[4]">
          Team
        </div>
        <div role="cell" className="flex-1">
          Solved
        </div>
      </div>

      <div className="no-scrollbar flex max-h-[360px] w-full flex-col gap-2 overflow-auto rounded-xl">
        {leaderboard.map((entry) => (
          <div
            key={teamsById[entry.teamId]?.name}
            role="row"
            className="flex items-center gap-4 rounded-e-xl rounded-s-xl bg-zinc-950 p-3"
          >
            <div role="cell" className="flex-[4]">
              {teamsById[entry.teamId]?.name}
            </div>
            <div role="cell" className="flex-1">
              {entry.challengesSolved}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
