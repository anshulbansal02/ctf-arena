import { getAuthUser } from "@/services/auth";
import { TeamCard } from "../home/components/TeamCard";
import {
  getReceivedJoinRequests,
  getSentTeamInvites,
  getTeamIdByUserId,
  getReceivedTeamInvites,
  respondToTeamRequest,
  getSentTeamRequests,
} from "@/services/team";
import { Button } from "@/shared/components";

export default async function TeamPage() {
  const user = await getAuthUser();
  const teamId = await getTeamIdByUserId(user.id);

  const [sentInvites, joinRequests, receivedInvites, sentRequests] =
    await Promise.all([
      teamId ? getSentTeamInvites(teamId) : null,
      teamId ? getReceivedJoinRequests(teamId) : null,
      !teamId ? getReceivedTeamInvites() : null,
      !teamId ? getSentTeamRequests() : null,
    ]);

  return (
    <section className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center">
      <section className="mt-8 flex w-[420px] flex-col items-center">
        <h2 className="text-2xl">My Team</h2>
        <TeamCard userId={user.id} />
      </section>

      <section>
        <h2 className="text-xl">Team Invites Received</h2>
        {receivedInvites?.map((invite) => (
          <div key={invite.id}>
            <p>Received invite from {invite.teamName}</p>
            <p>Received at {invite.createdAt.toString()}</p>
            <Button onClick={() => respondToTeamRequest(invite.id, "accept")}>
              Accept
            </Button>
            <Button
              variant="outlined"
              onClick={() => respondToTeamRequest(invite.id, "reject")}
            >
              Ignore
            </Button>
          </div>
        ))}
      </section>

      <section className="mt-8 flex w-[420px] flex-col items-center">
        <h2 className="text-xl">Join Requests</h2>
        {joinRequests?.map((request) => (
          <div key={request.id}>
            <p>{request.createdBy}</p>
            <Button onClick={() => respondToTeamRequest(request.id, "accept")}>
              Accept
            </Button>
            <Button
              onClick={() => respondToTeamRequest(request.id, "reject")}
              variant="outlined"
            >
              Ignore
            </Button>
          </div>
        ))}
      </section>

      <section className="mt-8 flex w-[420px] flex-col items-center">
        <h2 className="text-xl">Team Invites Sent</h2>
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
