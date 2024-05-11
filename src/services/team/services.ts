"use server";

import { getUser } from "@/services/auth";
import { createServerClient } from "@/services/supabase/server";

export async function createTeamAndSendInvites(data: {
  name: string;
  invitees: Array<string>;
}) {
  const supa = createServerClient();
  const user = await getUser();

  await supa.rpc("create_team_with_leader", {
    team_name: data.name,
    leader: user.id,
    invitee_emails: data.invitees,
  });
}

export async function getTeams() {
  const supa = createServerClient();

  const teams = await supa
    .from("teams")
    .select(
      "id, name, members:team_members( ...users!user_id (name:full_name) )",
    );

  return teams.data;
}
