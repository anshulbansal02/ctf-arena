import { useEffect, useState } from "react";

interface Props {
  name: "sum_of_scores" | "quickest_firsts" | "sprinting_teams";
  contestId: number;
}

export function useLeaderboard<T>(props: Props) {
  const [leaderboard, setLeaderboard] = useState<Array<T>>([]);
  const [contestEnded, setContestEnded] = useState(false);

  useEffect(() => {
    const leaderboardEvents = new EventSource(
      `/api/hook/leaderboard/${props.contestId}/update?type=${props.name}`,
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
      leaderboardEvents.close();
    });

    return () => {
      leaderboardEvents.close();
    };
  }, [props.contestId]);

  return { leaderboard, hasContestEnded: contestEnded };
}
