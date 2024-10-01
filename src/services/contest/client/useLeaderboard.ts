import { useState } from "react";
import { Leaderboard } from "../leaderboard";
import { useServerEvent } from "@/shared/hooks";

interface Props {
  name: Leaderboard;
  contestId: number;
}

export function useLeaderboard<T>(props: Props) {
  const [leaderboard, setLeaderboard] = useState<Array<T>>([]);
  const [hasContestEnded, setContestEnded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>();

  useServerEvent<T[]>(
    "leaderboard_update",
    (data) => {
      setLeaderboard(data);
      setLastUpdated(new Date());
    },
  );

  useServerEvent(
    "contest_ended",
    () => {
      setContestEnded(true);
    },
  );

  return { leaderboard, hasContestEnded, lastUpdated };
}
