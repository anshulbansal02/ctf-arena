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
import { format } from "date-fns";
import { assetURI } from "./helpers";
import { formatInUTC } from "@/lib/utils";

interface ContestReminderEmailProps {
  userEmail: string;
  userName: string;
  contestURL: string;
  contestName: string;
  startsAt: Date;
  participationType: "individual" | "team";
  coverImage?: string;
}

export const ContestReminderEmail = ({
  userEmail,
  userName,
  contestURL,
  contestName,
  startsAt,
  participationType,
  coverImage,
}: ContestReminderEmailProps) => {
  return (
    <Html>
      <Head />

      <Preview>Contest {contestName} is starting soon on CTF Arena.</Preview>

      <Tailwind>
        <Body
          className="mx-auto my-auto bg-white px-2 font-sans"
          style={{ backgroundColor: "#ffffff", color: "#000000" }}
        >
          <Section className="mt-[32px]">
            <Img
              width="120"
              height="19"
              alt="CTF Arena"
              className="mx-auto"
              src={assetURI("media/ctf-arena-logo.png")}
            />
          </Section>
          <Container className="mx-auto mb-[40px] mt-6 max-w-[465px] rounded border border-solid border-[#eaeaea]">
            <Img
              className="w-full object-cover"
              src={assetURI(coverImage ?? "media/puzzle-game-cover.jpg")}
            />

            <Container className="p-[20px]">
              <Text className="text-center text-[24px] leading-[24px] text-black">
                Contest <span className="font-bold">{contestName}</span> is
                starting soon
              </Text>

              <Text className="text-center text-[16px]">
                Hey! {userName}, The contest is starting in less than an hour at{" "}
                <span className="font-semibold">
                  {formatInUTC(startsAt, "HH:mm a")}
                </span>
                . Be sure{" "}
                {participationType === "individual"
                  ? "you are "
                  : "your team is "}
                ready for a thrilling series of challenges.
              </Text>

              <Section className="mb-[32px] mt-[32px] text-center">
                <Button
                  className="w-full rounded-md border-[0.5px] border-b-[3px] border-solid border-[#D2D2E6] bg-[#FAFAFB] pb-2 pt-3 text-center text-[14px] font-semibold text-black no-underline"
                  href={contestURL}
                >
                  Go To Contest
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
                or copy and paste this URL into your browser to know more about
                the contest:
                <br />
                <Text className="break-all no-underline">{contestURL}</Text>
              </Text>

              <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

              <Text className="text-center text-[12px] leading-[18px] text-[#666666]">
                This email reminder is intended for{" "}
                <span className="text-black">{userEmail}</span>. You are
                receiving this email because{" "}
                {participationType === "individual"
                  ? "you are "
                  : "your team is "}
                participating in the contest{" "}
                <span className="text-black">{contestName}</span> on CTF Arena.
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
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ContestReminderEmail.PreviewProps = {
  contestName: "Festive Tambola",
  contestURL: "https://ctf-arena.com/contests/1",
  startsAt: new Date("2024-10-27T11:30:00"),
  userEmail: "joseph.koss@organization.com",
  userName: "Joseph Koss",
  participationType: "individual",
} satisfies ContestReminderEmailProps;

export default ContestReminderEmail;
