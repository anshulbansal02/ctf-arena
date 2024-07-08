import { useEffect, useMemo } from "react";
import { getTeamsDetailsByIds, TeamDetails } from "../services";
import { atom, useAtom } from "jotai";

interface Options {
  teamIds: Array<number>;
}

const teamIdsBeingFetchedAtom = atom(new Set<number>());
const teamsByIdAtom = atom<Record<number, TeamDetails | undefined>>({});

export function useTeamsById(opts: Options) {
  const [teamIdsBeingFetched, setTeamIdsBeingFetched] = useAtom(
    teamIdsBeingFetchedAtom,
  );
  const [teamsById, setTeamsById] = useAtom(teamsByIdAtom);

  const teamIdsFetched = useMemo(
    () => new Set(Object.keys(teamsById).map(Number)),
    [teamsById],
  );

  async function fetchTeamIds(teamIds: Array<number>) {
    const teamIdsToFetch = teamIds.filter(
      (id) => !(teamIdsBeingFetched.has(id) || teamIdsFetched.has(id)),
    );

    setTeamIdsBeingFetched(teamIdsBeingFetched.union(new Set(teamIdsToFetch)));

    const teams = await getTeamsDetailsByIds(teamIdsToFetch);
    setTeamsById({ ...teamsById, ...teams });

    setTeamIdsBeingFetched(
      teamIdsBeingFetched.difference(new Set(teamIdsToFetch)),
    );
  }

  useEffect(() => {
    fetchTeamIds(opts.teamIds);
  }, [opts.teamIds]);

  return {
    teamsById,
  };
}
