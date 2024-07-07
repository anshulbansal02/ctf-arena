import { useEffect, useRef, useState } from "react";
import { getTeamsDetailsByIds } from "../services";

interface Options {
  teamIds: Array<Number>;
}

export function useTeamsById(opts: Options) {
  const [teamsById] = useState();
  const lastTeamIds = useRef<Array<number>>([]);

  useEffect(() => {
    if (lastTeamIds.current) {
    }
  }, [opts.teamIds]);

  return {
    teamsById,
  };
}
