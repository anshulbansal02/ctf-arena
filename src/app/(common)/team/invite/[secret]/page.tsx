import { SvgInfoOutlined } from "@/assets/icons";
import { getAuthUser, signIn } from "@/services/auth";
import {
  getInviteFromSecret,
  getTeamDetails,
  getTeamIdByUserId,
} from "@/services/team";
import { Button, Logo } from "@/shared/components";

import Invitation from "@/assets/media/invitation.png";
import Image from "next/image";
import { AcceptInvitationButton } from "./components/AcceptInvitationButton";
import { SignInWithMicrosoft } from "@/app/(public)/components/SignInWithMicrosoft";

function Page(props: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-lvh place-items-center px-4 py-10">
      {props.children}
    </main>
  );
}

function InvalidInvite(props: {
  heading: React.ReactNode;
  body: React.ReactNode;
}) {
  return (
    <Page>
      <div className="flex flex-col items-center">
        <Logo />

        <h4 className="mt-10 text-center text-lg font-medium">
          {props.heading}
        </h4>
        <p className="mt-2 max-w-[360px] text-center text-gray-300">
          {props.body}
        </p>
        <Button variant="outlined" as="link" href="/" className="mt-8 w-full">
          Go Home
        </Button>
      </div>
    </Page>
  );
}

export default async function ViewInvitePage({
  params,
}: {
  params: { secret: string };
}) {
  // fetch invite
  const secret = params.secret;

  // fetch invite using secret
  const invite = await getInviteFromSecret(secret);
  if (!invite)
    return (
      <InvalidInvite
        heading="Invalid team invite"
        body="Please re-check invite link or the invite may have expired."
      />
    );

  const invitingTeam = await getTeamDetails(invite.teamId);
  if (!invitingTeam)
    return (
      <InvalidInvite
        heading="Team invite expired"
        body="Please re-check invite link or the invite may have expired."
      />
    );

  const user = await getAuthUser();
  if (!user)
    return (
      <Page>
        <div className="flex max-w-[560px] flex-col items-center">
          <Image
            src={Invitation}
            alt="Invitation Card"
            quality={100}
            width={100}
            height={100}
          />

          <h4 className="mt-8 text-center text-xl text-gray-300">
            Team Invite
          </h4>
          <h3 className="mt-2 text-center text-2xl">
            Team <b>{invitingTeam.name}</b> invites you to join them on CTF
            Arena
          </h3>

          <div className="mt-16">
            <p className="mb-4">You need to sign in to continue</p>
            <SignInWithMicrosoft />
            <p className="mt-1.5 flex cursor-default items-center justify-center gap-1 text-sm text-slate-400">
              <SvgInfoOutlined fill="currentColor" /> Sign In with your Veersa
              Account
            </p>
          </div>
        </div>
      </Page>
    );

  const userTeamId = await getTeamIdByUserId(user.id);
  if (userTeamId)
    return (
      <InvalidInvite
        heading="You are already in a team"
        body="You cannot join another team while being a member of a team."
      />
    );

  if (user.email !== invite.userEmail)
    return (
      <InvalidInvite
        heading="Invite not intended for you"
        body="This team invite was sent to someone else."
      />
    );

  return (
    <Page>
      <div className="flex max-w-[560px] flex-col items-center">
        <Image
          src={Invitation}
          alt="Invitation Card"
          quality={100}
          width={100}
          height={100}
        />

        <h4 className="mt-8 text-center text-xl text-gray-300">Team Invite</h4>
        <h3 className="mt-2 text-center text-2xl">
          Team <b>{invitingTeam.name}</b> invite you to join them on CTF Arena
        </h3>

        <div className="mt-16 flex items-center gap-4">
          <AcceptInvitationButton inviteId={invite.id} />

          <Button variant="outlined" as="link" href="/">
            Go Home
          </Button>
        </div>

        <p className="mt-4 text-center text-gray-400">
          By accepting this invite, you will become a member of the team{" "}
          <b>{invitingTeam.name}</b> and all your existing invites will be
          cancelled.
        </p>
      </div>
    </Page>
  );
}
