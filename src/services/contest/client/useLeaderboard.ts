import { useState } from "react";
import { useAction, useServerEvent } from "@/shared/hooks";
import { getLeaderboardData } from "../services";
import { randomInt } from "@/lib/utils";
import contestEvents from "@/services/contest/events";

interface Props {
  name: string;
  contestId: number;
}

export function useLeaderboard<T>(props: Props) {
  const {
    data: leaderboardData,
    setState: setLeaderboardData,
    execute: getUpdate,
  } = useAction(
    async () => {
      const result = await getLeaderboardData<T>(props.contestId, props.name);

      if ("error" in result) return null;
      return result;
    },
    { immediate: true, args: [], preserveData: true },
  );

  const [hasContestEnded, setContestEnded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>();

  useServerEvent<T[]>(
    contestEvents.leaderboard(props.contestId, "update"),
    (data) => {
      setTimeout(getUpdate, randomInt(0, 500));
      // setLeaderboardData(data);
      setLastUpdated(new Date());
    },
    { active: !hasContestEnded },
  );

  useServerEvent(
    contestEvents.game(props.contestId, "ended"),
    () => {
      setContestEnded(true);
    },
    { active: !hasContestEnded },
  );

  return { leaderboard: leaderboardData, hasContestEnded, lastUpdated };
}
