import { useEffect } from "react";

import { useAction } from "@/shared/hooks";
import { getTeams } from "@/services/team";

interface Options {
  search?: string;
}

export function useTeams(opts?: Options) {
  const { error, data, execute, loading } = useAction(getTeams);

  useEffect(() => {
    execute(opts?.search);
  }, [opts?.search]);

  return {
    teams: data ?? [],
    error,
    loading,
  };
}
