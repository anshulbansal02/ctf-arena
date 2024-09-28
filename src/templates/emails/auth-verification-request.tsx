import { TimeFormatted } from "@/shared/components";
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

interface AuthVerificationRequestEmailProps {
  userEmail: string;
  userName: string;
  contestURL: string;
  contestName: string;
  startsAt: Date;
}

export const AuthVerificationRequestEmail = ({
  userEmail,
  userName,
  contestURL,
  contestName,
  startsAt,
}: AuthVerificationRequestEmailProps) => {
  return (
    <Html>
      <Head />

      <Preview>Contest {contestName} is starting soon.</Preview>

      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Section className="mt-[32px]"></Section>
          <Container className="mx-auto mb-[40px] mt-6 max-w-[465px] rounded border border-solid border-[#eaeaea]">
            <Container className="p-[20px]">
              <Text className="text-center text-[24px] leading-[24px] text-black">
                Contest <span className="font-bold">{contestName}</span> is
                starting soon
              </Text>

              <Text className="text-center text-[16px]">
                Hey! {userName}, The contest is starting in less than an hour at{" "}
                <span className="font-semibold">
                  <TimeFormatted time={startsAt} format="dd MMM yy hh:mm a" />
                </span>
                . Be sure your team is ready for the thrilling series of
                challenges.
              </Text>

              <Section className="mb-[32px] mt-[32px] text-center">
                <Button
                  className="w-full rounded-md border-[0.5px] border-b-[3px] border-solid border-[#D2D2E6] bg-[#FAFAFB] pb-2 pt-3 text-center text-[14px] font-semibold text-black no-underline"
                  href={contestURL}
                >
                  Go To Contest
                  <Img
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMy45MzMgMTMuMTMzIDMgMTIuMmwyLjg2Ny0yLjg2N2gtMi40VjhoNC42NjZ2NC42NjdINi44di0yLjR6TTEwLjggMTBWNS4zMzNINi4xMzNWNGg2djZ6IiBmaWxsPSIjMDAwIi8+PC9zdmc+"
                    width="18"
                    height="18"
                    alt=""
                    className="mb-1 ml-2 inline-block align-middle"
                  />
                </Button>
              </Section>
              <Text className="text-center text-[16px] leading-[24px] text-black">
                or copy and paste this URL into your browser to know more about
                the contest:
                <br />
                <Link
                  href={contestURL}
                  className="break-all text-[#489FA4] no-underline"
                >
                  {contestURL}
                </Link>
              </Text>

              <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

              <Text className="text-center text-[12px] leading-[18px] text-[#666666]">
                This email reminder is intended for{" "}
                <span className="text-black">{userEmail}</span>. You are
                receiving this email because your team is participating in the
                contest <span className="text-black">{contestName}</span> on CTF
                Arena. If you'd rather not receive future emails from CTF Arena,{" "}
                <Link href="#" className="text-[#666666] underline">
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

export default AuthVerificationRequestEmail;
