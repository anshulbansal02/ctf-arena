import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import { format } from "date-fns";
import { assetURI } from "./helpers";

interface AuthVerificationRequestEmailProps {
  magicLink: string;
  userEmail: string;
  expires: Date;
}

export const AuthVerificationRequestEmail = ({
  magicLink,
  userEmail,
  expires,
}: AuthVerificationRequestEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head />

        <Preview>Your magic link to sign in to CTF Arena</Preview>

        <Body className="mx-auto my-auto px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[16px]">
              <Img
                width="120"
                height="19"
                alt="CTF Arena"
                className="mb-4"
                src={assetURI("media/ctf-arena-logo.png")}
              />
            </Section>

            <Row>
              <Column style={{ width: "28px" }}>
                <Img
                  src={assetURI("media/lock-icon.png")}
                  height={20}
                  width={20}
                  alt="Lock Icon"
                />
              </Column>
              <Column>
                <Text className="text-[20px] font-medium leading-[24px] text-[#f97316]">
                  Authentication Request
                </Text>
              </Column>
            </Row>

            <Text className="text-[16px] text-black">
              Use the below button to access your account ({userEmail}) on CTF
              Arena. This link is valid until{" "}
              {format(expires, "hh:mm a 'on' dd/MM/yy")}
            </Text>

            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="w-[calc(100%-40px)] rounded-md border-[0.5px] border-b-[3px] border-solid border-[#D2D2E6] bg-[#FAFAFB] px-5 pb-2 pt-3 text-center text-[14px] font-semibold text-black no-underline"
                href={magicLink}
              >
                Login to CTF Arena
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
              <Link
                href={magicLink}
                className="break-all text-[#489FA4] no-underline"
              >
                {magicLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

            <Text className="text-center text-[12px] leading-[18px] text-[#666666]">
              If you didn&apos;t try to login, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

AuthVerificationRequestEmail.PreviewProps = {
  expires: new Date(),
  magicLink:
    "https://ctf-arena.com/auth/login?code=eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  userEmail: "fernando.considine@organization.com",
} satisfies AuthVerificationRequestEmailProps;

export default AuthVerificationRequestEmail;
