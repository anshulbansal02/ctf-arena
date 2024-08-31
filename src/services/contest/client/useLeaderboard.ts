import { useEffect, useState } from "react";
import { Leaderboard } from "../leaderboard";

interface Props {
  name: Leaderboard;
  contestId: number;
}

export function useLeaderboard<T>(props: Props) {
  const [leaderboard, setLeaderboard] = useState<Array<T>>([]);
  const [hasContestEnded, setContestEnded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>();

  useEffect(() => {
    const leaderboardEvents = new EventSource(
      `/api/hook/leaderboard/${props.contestId}/update?type=${props.name}`,
    );

    leaderboardEvents.addEventListener("leaderboard_update", (e) => {
      const data = e.data;
      try {
        const updatedLeaderboard = JSON.parse(data);
        setLeaderboard(updatedLeaderboard);
        setLastUpdated(new Date());
      } catch {}
    });

    leaderboardEvents.addEventListener("contest_ended", () => {
      setContestEnded(true);
      leaderboardEvents.close();
    });

    return () => {
      leaderboardEvents.close();
    };
  }, [props.contestId]);

  return { leaderboard, hasContestEnded, lastUpdated };
}
