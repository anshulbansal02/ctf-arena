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

interface TeamInviteEmailProps {
  inviteeEmail: string;
  inviterName: string;
  inviterEmail: string;
  teamName: string;
  inviteLink: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const TeamInviteEmail = ({
  inviteeEmail,
  inviterName,
  inviterEmail,
  teamName,
  inviteLink,
}: TeamInviteEmailProps) => {
  return (
    <Html>
      <Head />

      <Preview>Join {teamName} on CTF Arena</Preview>

      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                width="120"
                height="19"
                alt="CTF Arena"
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjIxIiB2aWV3Qm94PSIwIDAgMTI4IDIxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04LjY3NyAyMC4wMjVxLTIuNTU5IDAtNC41MzYtMS4xODctMS45NTItMS4yMTUtMy4wNi0zLjQ1NVEuMDAxIDEzLjExNyAwIDEwLjA0cTAtMy4wNSAxLjA4MS01LjMxNyAxLjA4Mi0yLjI2NyAzLjA2LTMuNDgyUTYuMTE4LjAwMSA4LjczIDBxMy41MDggMCA1LjUxMiAxLjc4MSAyLjAwNCAxLjc4MiAyLjYxIDUuMTI4bC0zLjU4Ni4xODlxLS4zNDMtMS45MTYtMS41MDMtMi45NjktMS4xMzQtMS4wOC0zLjAzMy0xLjA4LTIuMzc0IDAtMy43NzIgMS44OXQtMS4zOTggNS4xcTAgMi4xMzMuNjMzIDMuNjk4dDEuNzk0IDIuNDAycTEuMTYuODM2IDIuNzE2LjgzNiAyLjAzMSAwIDMuMTkyLTEuMTMzIDEuMTYtMS4xMzMgMS40NzYtMy4yNjZsMy41ODcuMTlxLS41NTQgMy40NTMtMi42NjMgNS4zNy0yLjExIDEuODktNS42MTggMS44ODlNMjMuNDQ1IDMuNDgxaC01LjY3Vi40MzFIMzIuNTd2My4wNWgtNS42OTd2MTYuMTEyaC0zLjQyOXpNNjIuOTE2LjQzMmg0LjE5M2w2Ljc1MiAxOS4xNjFoLTMuNTg3bC0xLjU1Ni00LjUzNGgtNy40MTFsLTEuNTU2IDQuNTM0aC0zLjU4N3ptNC44IDExLjYzMi0yLjY5LTguMDk3LTIuNzE3IDguMDk3em03Ljc4MS02Ljg4MmgzLjE2NWwuMDggMi43OHEuNDItMS40MzEgMS4yMzktMi4xMDYuODQ1LS42NzUgMi4xMzYtLjY3NGgxLjI5MlY4LjE1aC0xLjMxOHEtMS42MzYgMC0yLjQyNy43NTYtLjc5LjcyOS0uNzkgMi4zNzV2OC4zMTJoLTMuMzc3em0xNS41ODUgMTQuNzM1cS0yLjA4MyAwLTMuNjY1LS45MTgtMS41NTctLjk0NC0yLjQtMi42NDQtLjg0NC0xLjctLjg0NC0zLjk2OCAwLTIuMjQuODQzLTMuOTQuODQ0LTEuNzI3IDIuMzc0LTIuNjQ1IDEuNTU2LS45NDQgMy42MTMtLjk0NCAyLjAwNSAwIDMuNTA4LjkxNyAxLjUzLjkxOCAyLjM0NyAyLjY3Mi44NDQgMS43MjguODQ0IDQuMTN2Ljc4Mkg4Ny42OHEuMTA2IDEuODYyIDEuMDAyIDIuODM0Ljg5Ny45NyAyLjQyNy45NzEgMS4xMDcgMCAxLjg3Mi0uNTEzLjc2NS0uNTQgMS4wNTUtMS40ODRsMy40NTUuMjE2cS0uNTggMi4xMDYtMi4yOTQgMy4zMi0xLjY4OSAxLjIxNC00LjExNSAxLjIxNG0zLjExMy04Ljg3OXEtLjEwNS0xLjcyNy0uOTUtMi41OS0uODQ0LS44NjUtMi4yNDItLjg2NC0xLjM3MSAwLTIuMjY4Ljg5LS44Ny44OTEtMS4wNTUgMi41NjR6bTUuNjk0LTUuODU2aDMuMDU5bC4wNzkgMi40ODNxLjUyOC0xLjQzMSAxLjYzNi0yLjEwNSAxLjEwNy0uNzAyIDIuNTg0LS43MDIgMi4yOTUgMCAzLjUzNCAxLjUxMSAxLjI2NiAxLjQ4NSAxLjI2NiAzLjk2N3Y5LjI1N2gtMy4zNzZ2LTguMTVxMC0xLjg5LS41OC0yLjgzNC0uNTUzLS45NDUtMS44NzItLjk0NC0xLjM3MiAwLTIuMTYzLjk5OC0uNzkuOTcxLS43OTEgMi43OHY4LjE1aC0zLjM3NnptMTkuMTQ0IDE0LjczNXEtMi4yNDIgMC0zLjU4Ny0xLjAyNi0xLjMxOS0xLjA1Mi0xLjMxOS0yLjkxNCAwLTEuODM1IDEuMTA4LTIuODg4IDEuMTM1LTEuMDggMy40ODEtMS41MzhsNC42NjktLjk0NXEwLTEuNTEtLjY4Ni0yLjI5NC0uNjg1LS43ODItMi4wMDUtLjc4Mi0yLjQgMC0yLjg3NCAyLjI0bC0zLjQ1NS0uMTYycS40MjItMi4yNjggMi4wNTctMy41MDkgMS42MzUtMS4yNCA0LjI3Mi0xLjI0MSAyLjk4MSAwIDQuNTEgMS41NjUgMS41NTYgMS41MzkgMS41NTYgNC40MjZ2NS4yMzZxMCAuNTY3LjE4NS43ODIuMTg0LjIxNi42MDcuMjE2SDEyOHYyLjUxcS0uNDIyLjEwOC0xLjIxMy4xMDgtMS4yNCAwLTIuMDA1LS41NC0uNzM4LS41NC0uOTQ5LTEuODA4LS41MjggMS4xNjEtMS44MiAxLjg2Mi0xLjI2Ni43MDItMi45OC43MDJtLjY4Ni0yLjUxcTEuNjYgMCAyLjY2My0uOTk4IDEuMDAzLTEgMS4wMDMtMi42NDV2LS44MWwtMy42NC43NTZxLTEuMTA4LjIxNi0xLjYwOS43MDEtLjUwMS40ODYtLjUwMSAxLjI0MiAwIC44MzcuNTI4IDEuMjk1LjU1My40NiAxLjU1Ni40NiIgZmlsbD0iIzFDMUMxQyIgZmlsbC1vcGFjaXR5PSIuOTIiLz48cGF0aCBkPSJNMzcuODc3LjQ3N0gzNC42OWEuNjY3LjY2NyAwIDAgMC0uNjYuNjc1djE4LjQ0MWgzLjg0NnYtNS41NDdhMS4yIDEuMiAwIDAgMSAxLjItMS4yaDkuOTc0Yy41MTcgMCAuODMzLS41ODMuNTU5LTEuMDMybC0zLjI1MS01LjMyMmEuNjkuNjkgMCAwIDEgLjAzMi0uNzYzbDMuMDU4LTQuMTczYy4zMjYtLjQ0NC4wMTYtMS4wOC0uNTI4LTEuMDh6IiBmaWxsPSJ1cmwoI2EpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iNDkuMTQiIHkxPSIuNzU4IiB4Mj0iMzMuNzc2IiB5Mj0iMTIuMjI0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iIzU4QzJEOSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzQ3Q0NCQyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg=="
              />
            </Section>

            <Text className="mt-8 text-[14px] leading-[24px] text-black">
              Hey there!
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
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
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMy45MzMgMTMuMTMzIDMgMTIuMmwyLjg2Ny0yLjg2N2gtMi40VjhoNC42NjZ2NC42NjdINi44di0yLjR6TTEwLjggMTBWNS4zMzNINi4xMzNWNGg2djZ6IiBmaWxsPSIjMDAwIi8+PC9zdmc+"
                  width="18"
                  height="18"
                  alt=""
                  className="mb-1 ml-2 inline-block align-middle"
                />
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:
              <br />
              <Link
                href={inviteLink}
                className="break-all text-[#489FA4] no-underline"
              >
                {inviteLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-center text-[12px] leading-[18px] text-[#666666]">
              This invitation was intended for{" "}
              <span className="text-black">{inviteeEmail}</span>. You are
              receiving this email because{" "}
              <span className="text-black">{inviterName}</span> used the above
              email address to create an invitation for you on CTF Arena. If you
              do not wish to accept the invitation, you can ignore this email.
              If you'd rather not receive future emails from CTF Arena,{" "}
              <Link href="#" className="text-[#666666] underline">
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

export default TeamInviteEmail;

// TeamInviteEmail.PreviewProps = {
//   inviteeEmail: "Kory.Johnston@yahoo.com",
//   inviteLink:
//     "https://ctf-arena.sh/teams/invite?t=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
//   inviterEmail: "Haylee_Botsford@gmail.com",
//   inviterName: "Darrell Pfannerstill",
//   teamName: "Roxanne Club",
// } as TeamInviteEmailProps;
