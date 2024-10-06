import { useState } from "react";
import { useAction, useServerEvent } from "@/shared/hooks";
import { getLeaderboardData } from "../services";

interface Props {
  name: string;
  contestId: number;
}

export function useLeaderboard<T>(props: Props) {
  const { data: leaderboardData, setState: setLeaderboardData } = useAction(
    async () => {
      console.log("Getting Leaderboard.............");
      const result = await getLeaderboardData<T>(props.contestId, props.name);
      console.log("Got Leaderboard.............", result);

      if ("error" in result) return null;
      return result;
    },
    { immediate: true, args: [] },
  );

  const [hasContestEnded, setContestEnded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>();

  useServerEvent<T[]>(
    "leaderboard_update",
    (data) => {
      setLeaderboardData(data);
      setLastUpdated(new Date());
    },
    { active: !hasContestEnded },
  );

  useServerEvent(
    "contest_ended",
    () => {
      setContestEnded(true);
    },
    { active: !hasContestEnded },
  );

  return { leaderboard: leaderboardData, hasContestEnded, lastUpdated };
}
