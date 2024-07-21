import { getAuthUser } from "@/services/auth";
import { TeamCard } from "../home/components/TeamCard";
import {
  getReceivedJoinRequests,
  getSentTeamInvites,
  getTeamIdByUserId,
} from "@/services/team";

export default async function TeamPage() {
  const user = await getAuthUser();
  const teamId = await getTeamIdByUserId(user.id);

  const [sentInvites, joinRequests] = await Promise.all([
    teamId ? getSentTeamInvites(teamId) : null,
    teamId ? getReceivedJoinRequests(teamId) : null,
  ]);

  return (
    <section className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center">
      <section className="mt-8 flex w-[420px] flex-col items-center">
        <h2 className="text-2xl">My Team</h2>
        <TeamCard userId={user.id} />
      </section>

      <section className="mt-8 flex w-[420px] flex-col items-center">
        <h2 className="text-2xl">Join Requests</h2>
      </section>

      <section className="mt-8 flex w-[420px] flex-col items-center">
        <h2 className="text-2xl">Team Invites Sent</h2>
        {sentInvites!.map((invite) => (
          <div key={invite.id}>
            <p>
              Sent to {invite.userEmail} at {invite.createdAt.toString()}
            </p>
          </div>
        ))}
      </section>
    </section>
  );
}
