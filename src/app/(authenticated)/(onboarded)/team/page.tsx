import { getAuthUser } from "@/services/auth";
import { TeamCard } from "../home/components/TeamCard";
import {
  getReceivedJoinRequests,
  getSentTeamInvites,
  getReceivedTeamInvites,
  isUserTeamLeader,
  getTeamDetailsByUserId,
} from "@/services/team";
import { Avatar, Button } from "@/shared/components";
import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";
import { SvgEmailSent } from "@/assets/icons";
import { config } from "@/config";
import { RequestResponseButton } from "./components/RequestResponseButton";
import { MembersInviteDialog } from "./components/MembersInviteDialog";

export default async function TeamPage() {
  const user = await getAuthUser();

  const team = await getTeamDetailsByUserId(user.id);
  const isUserLeader = await isUserTeamLeader();

  const [sentInvites, joinRequests, receivedInvites] = await Promise.all([
    team ? getSentTeamInvites(team.id) : null,
    team ? getReceivedJoinRequests(team.id) : null,
    !team ? getReceivedTeamInvites() : null,
  ]);

  return (
    <section className="mx-auto mb-24 flex min-h-screen max-w-[480px] flex-col items-center">
      <section className="mt-12 flex w-[420px] flex-col items-center">
        <h2 className="text-2xl">My Team</h2>
        <TeamCard userId={user.id} />
      </section>

      {receivedInvites && (
        <section className="mt-16 flex w-[480px] flex-col items-center">
          <h2 className="text-xl">Team Invites Received</h2>

          {receivedInvites.length ? (
            <p className="mt-2 text-center text-sm leading-snug text-gray-400">
              Following teams have sent you an invite to join their team.
              Accepting an invite will cancel all other invites
            </p>
          ) : (
            <p className="mt-4 text-center text-slate-400">
              No team invites found
            </p>
          )}

          <ul className="mt-2">
            {receivedInvites.map((invite) => (
              <li key={invite.id} className="mt-6 flex gap-3">
                <div>
                  <p>
                    <span className="font-medium leading-tight">
                      {invite.teamName}
                    </span>{" "}
                    invites you to join their team
                  </p>
                  <p className="text-sm text-gray-300">
                    Received{" "}
                    {formatDistanceToNow(invite.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <div className="ml-auto flex gap-2">
                  <RequestResponseButton
                    requestId={invite.id}
                    action="accept"
                  />
                  <RequestResponseButton
                    requestId={invite.id}
                    action="reject"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {joinRequests && isUserLeader && (
        <section className="mt-16 flex w-[560px] flex-col items-center">
          <h2 className="text-xl">Join Requests</h2>

          {joinRequests.length ? (
            <p className="mt-2 text-center text-sm leading-snug text-gray-400">
              Following users are requesting to join your team. You can only
              accept at most{" "}
              {config.app.team.MEMBERS_LIMIT - team!.members.length} request(s)
              because a team can only have a maximum of{" "}
              {config.app.team.MEMBERS_LIMIT} members.
            </p>
          ) : (
            <p className="mt-4 text-center text-slate-400">
              No active join requests
            </p>
          )}

          <ul className="mt-2">
            {joinRequests.map((request) => (
              <li key={request.id} className="mt-6 flex items-center gap-3">
                <Avatar username={request.userEmail!} size={40} />
                <div className="mr-2">
                  <p className="font-medium leading-tight">
                    {request.userName}
                  </p>
                  <p className="text-sm text-gray-300">{request.userEmail}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <RequestResponseButton
                    requestId={request.id}
                    action="accept"
                  />
                  <RequestResponseButton
                    requestId={request.id}
                    action="reject"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sentInvites && (
        <section className="mt-16 flex w-[480px] flex-col items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl">Team Invites Sent</h2>
            <div className="h-4 w-[2px] bg-slate-500" />
            <MembersInviteDialog />
          </div>
          <ul className="mt-6">
            {sentInvites.map((invite) => (
              <li key={invite.id} className="mb-3 flex items-center gap-2">
                <SvgEmailSent width={18} height={18} />
                <p>
                  Sent to{" "}
                  <span className="font-medium">{invite.userEmail}</span>
                </p>
                <hr className="min-w-4 flex-grow border-gray-600" />
                <p>
                  {formatDistanceToNowStrict(invite.createdAt, {
                    addSuffix: true,
                  })}
                </p>
              </li>
            ))}
          </ul>

          {!sentInvites.length && (
            <p className="text-center text-slate-400">
              You have not sent any team invites
            </p>
          )}
        </section>
      )}
    </section>
  );
}
