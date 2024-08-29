import { SvgInfoOutlined } from "@/assets/icons";
import { getAuthUser, signIn } from "@/services/auth";
import {
  getInviteFromSecret,
  getTeamDetails,
  getTeamIdByUserId,
  respondToTeamRequest,
} from "@/services/team";
import { Avatar, Button } from "@/shared/components";

export default async function ViewInvitePage({
  params,
}: {
  params: { secret: string };
}) {
  // fetch invite
  const secret = params.secret;

  // fetch invite using secret
  const invite = await getInviteFromSecret(secret);
  if (!invite) return <div>Invalid Invite. Go Back or redirect maybe? 🤔</div>;

  const user = await getAuthUser();

  if (user?.email !== invite.userEmail)
    return <div>This Invite is not intended for your. Go back</div>;

  const teamId = await getTeamIdByUserId(user.id);
  if (teamId)
    return (
      <div>Cannot accept this invite you are already in a team. Go Back</div>
    );

  const team = await getTeamDetails(invite.teamId);

  if (!team) return <div>Invalid Invite. Go Back</div>;

  return (
    <div>
      <h2>You are invited to join {team.name}</h2>

      <div className="flex items-center">
        {team.members.map((member) => (
          <Avatar
            key={member.email}
            rounded
            username={member.id}
            title={member.name}
            size={80}
            className="-ml-2 rounded-full border border-zinc-950 first:ml-0"
          />
        ))}
      </div>

      <p>
        By accepting this invite, you will be a member of the team{" "}
        <b>{team.name}</b> and all your existing invites will be cancelled.
      </p>

      {user ? (
        <div className="">
          <form
            action={async () => {
              "use server";
              await respondToTeamRequest(invite.id, "accept");
            }}
          >
            <Button>Accept</Button>
          </form>
        </div>
      ) : (
        <div>
          <p>You need to sign in to continue</p>
          <form
            action={async () => {
              "use server";
              await signIn("microsoft-entra-id");
            }}
          >
            <Button type="submit">
              <svg
                width={16}
                viewBox="0 0 2499.6 2500"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1187.9 1187.9H0V0h1187.9z" fill="#f1511b" />
                <path
                  d="M2499.6 1187.9h-1188V0h1187.9v1187.9z"
                  fill="#80cc28"
                />
                <path d="M1187.9 2500H0V1312.1h1187.9z" fill="#00adef" />
                <path
                  d="M2499.6 2500h-1188V1312.1h1187.9V2500z"
                  fill="#fbbc09"
                />
              </svg>
              Continue with Microsoft
            </Button>
          </form>
          <p className="mt-1.5 flex cursor-default items-center justify-center gap-1 text-xs text-slate-400">
            <SvgInfoOutlined fill="currentColor" /> Sign In with your Veersa
            Account
          </p>
        </div>
      )}
    </div>
  );
}
