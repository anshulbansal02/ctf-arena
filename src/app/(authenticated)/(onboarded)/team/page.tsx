import { getAuthUser } from "@/services/auth";
import { TeamCard } from "../home/components/TeamCard";
import {
  getReceivedJoinRequests,
  getSentTeamInvites,
  getTeamIdByUserId,
  getReceivedTeamInvites,
  respondToTeamRequest,
  isUserTeamLeader,
} from "@/services/team";
import { Button } from "@/shared/components";
import { formatDistanceToNow } from "date-fns";

export default async function TeamPage() {
  const user = await getAuthUser();
  const teamId = await getTeamIdByUserId(user.id);
  const isUserLeader = await isUserTeamLeader();

  const [sentInvites, joinRequests, receivedInvites] = await Promise.all([
    teamId ? getSentTeamInvites(teamId) : null,
    teamId ? getReceivedJoinRequests(teamId) : null,
    !teamId ? getReceivedTeamInvites() : null,
  ]);

  return (
    <section className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center">
      <section className="mb-8 mt-8 flex w-[420px] flex-col items-center">
        <h2 className="text-2xl">My Team</h2>
        <TeamCard userId={user.id} />
      </section>

      {receivedInvites && (
        <section className="mt-8 flex w-[420px] flex-col items-center">
          <h2 className="text-xl">Team Invites Received</h2>

          {receivedInvites.map((invite) => (
            <div key={invite.id}>
              <p>
                {invite.teamName} is inviting you to join their team{" "}
                {formatDistanceToNow(invite.createdAt)}
              </p>
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

          {!receivedInvites.length && (
            <p className="mt-4 text-center text-slate-400">
              No team invites found
            </p>
          )}
        </section>
      )}

      {joinRequests && isUserLeader && (
        <section className="mt-8 flex w-[420px] flex-col items-center">
          <h2 className="text-xl">Join Requests</h2>
          {joinRequests.map((request) => (
            <div key={request.id}>
              <p>{request.createdBy}</p>
              <Button
                onClick={() => respondToTeamRequest(request.id, "accept")}
              >
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

          {!joinRequests.length && (
            <p className="mt-4 text-center text-slate-400">
              No active join requests
            </p>
          )}
        </section>
      )}

      {sentInvites && (
        <section className="mt-8 flex w-[420px] flex-col items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl">Team Invites Sent</h2>
            <div className="h-4 w-[2px] bg-slate-500" />
            <Button variant="ghost">Invite Members</Button>
          </div>
          {sentInvites.map((invite) => (
            <div key={invite.id}>
              <p>
                Sent to <span className="font-medium">{invite.userEmail}</span>{" "}
                {formatDistanceToNow(invite.createdAt)}
              </p>
            </div>
          ))}

          {!sentInvites.length && (
            <p className="mt-4 text-center text-slate-400">
              You have not sent any team invites
            </p>
          )}
        </section>
      )}
    </section>
  );
}
