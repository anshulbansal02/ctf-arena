import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import { assetURI } from "./helpers";

interface TeamInviteEmailProps {
  inviteeEmail: string;
  inviterName: string;
  inviterEmail: string;
  teamName: string;
  inviteLink: string;
}

export const TeamInviteEmail = ({
  inviteeEmail,
  inviterName,
  inviterEmail,
  teamName,
  inviteLink,
}: TeamInviteEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head />

        <Preview>{inviterName} is inviting you to join their team.</Preview>

        <Body className="mx-auto my-auto px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[16px]">
              <Img
                width="120"
                height="19"
                className="mb-4"
                alt="CTF Arena"
                src={assetURI("media/ctf-arena-logo.png")}
              />
            </Section>

            <Text className="text-[16px] leading-[24px] text-black">
              Hey there!
            </Text>
            <Text className="text-[16px] leading-[24px] text-black">
              <span style={{ fontWeight: 600 }}>{inviterName}</span> (
              <Link
                href={`mailto:${inviterEmail}`}
                className="text-[#489FA4] no-underline"
              >
                {inviterEmail}
              </Link>
              ) has invited you join their team{" "}
              <span style={{ fontWeight: 600 }}>{teamName}</span> on{" "}
              <span style={{ fontWeight: 600 }}>CTF Arena</span>.
            </Text>

            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded-md border-[0.5px] border-b-[3px] border-solid border-[#D2D2E6] bg-[#FAFAFB] px-5 pb-2 pt-3 text-center text-[14px] font-semibold text-black no-underline"
                href={inviteLink}
              >
                View Invite
                <Img
                  src={assetURI("media/link-icon.png")}
                  width="18"
                  height="18"
                  alt="External Link"
                  className="mb-1 ml-2 inline-block align-middle"
                />
              </Button>
            </Section>
            <Text className="text-center text-[16px] leading-[24px] text-black">
              or copy and paste this URL into your browser:
              <br />
              <Text className="break-all no-underline">{inviteLink}</Text>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-center text-[12px] leading-[18px] text-[#666666]">
              This invitation is intended for{" "}
              <span className="text-black">{inviteeEmail}</span>. You are
              receiving this email because{" "}
              <span className="text-black">{inviterName}</span> used the above
              email address to create an invitation for you on CTF Arena. If you
              do not wish to accept the invitation, you can ignore this email.
              If you&apos;d rather not receive future emails from CTF Arena,{" "}
              <Link
                href="/notifications/opt-out"
                className="text-[#666666] underline"
              >
                opt out here
              </Link>
              .
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

TeamInviteEmail.PreviewProps = {
  inviteeEmail: "Jeffrey Wuckert",
  inviteLink:
    "https://ctf-arena.com/team/invite/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  inviterEmail: "randolph.r@organization.com",
  inviterName: "Randolph Ratke",
  teamName: "Doomsday Defenders",
} satisfies TeamInviteEmailProps;

export default TeamInviteEmail;
