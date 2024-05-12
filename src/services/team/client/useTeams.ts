import { useAction } from "@/shared/hooks";
import { useEffect } from "react";
import { getTeams } from "../services";

interface Options {
  search?: string;
}

export function useTeams(opts?: Options) {
  const { error, data, execute, loading } = useAction(getTeams);

  useEffect(() => {
    execute(null);
  }, [execute]);

  return {
    teams: data ?? [],
    error,
    loading,
  };
}
