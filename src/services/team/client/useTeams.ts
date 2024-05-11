import { useAction } from "@/shared/hooks";
import { useEffect } from "react";
import { getTeams } from "../services";

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
