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

interface ContestIntimationEmailProps {
  userEmail: string;
  userName: string;
  contestURL: string;
  contestName: string;
  startsAt: Date;
}

export const ContestIntimationEmail = ({
  userEmail,
  userName,
  contestURL,
  contestName,
  startsAt,
}: ContestIntimationEmailProps) => {
  return (
    <Html>
      <Head />

      <Preview>CTF Contest is starting soon.</Preview>

      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]"></Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ContestIntimationEmail;
