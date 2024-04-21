import { useAction } from "@/shared/hooks";
import { getTeams } from "../actions";
import { useEffect } from "react";

export function useTeams() {
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
