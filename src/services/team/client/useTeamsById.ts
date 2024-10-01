"use client";
import { useEffect, useMemo } from "react";
import { getTeamsDetailsByIds, TeamDetails } from "../services";
import { create } from "zustand";

const store = create<{
  teamIdsBeingFetched: Set<number>;
  teamsById: Record<number, TeamDetails | undefined>;
}>()(() => ({ teamIdsBeingFetched: new Set(), teamsById: {} }));

function addTeamIdsBeingFetched(teamIds: number[]) {
  store.setState((state) => ({
    teamIdsBeingFetched: state.teamIdsBeingFetched.union(new Set(teamIds)),
  }));
}

function removeTeamIdsBeingFetched(teamIds: number[]) {
  store.setState((state) => ({
    teamIdsBeingFetched: state.teamIdsBeingFetched.difference(new Set(teamIds)),
  }));
}

function updateTeamsById(teamsById: Record<number, TeamDetails | undefined>) {
  store.setState((state) => ({
    teamsById: { ...state.teamsById, ...teamsById },
  }));
}

const useStore = () => store();

interface Options {
  teamIds: Array<number>;
}

export function useTeamsById(opts: Options) {
  const { teamIdsBeingFetched, teamsById } = useStore();

  const teamIdsFetched = useMemo(
    () => new Set(Object.keys(teamsById).map(Number)),
    [teamsById],
  );

  async function fetchTeamIds(teamIds: Array<number>) {
    const teamIdsToFetch = teamIds.filter(
      (id) => !(teamIdsBeingFetched.has(id) || teamIdsFetched.has(id)),
    );

    addTeamIdsBeingFetched(teamIdsToFetch);

    const teams = await getTeamsDetailsByIds(teamIdsToFetch);
    updateTeamsById(teams);

    removeTeamIdsBeingFetched(teamIdsToFetch);
  }

  useEffect(() => {
    fetchTeamIds(opts.teamIds);
  }, [opts.teamIds]);

  return {
    teamsById,
  };
}
