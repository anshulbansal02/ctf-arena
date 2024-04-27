import { ResendProvider } from "./adapters/resend";
import { EmailProvider, SendConfig } from "./types";

class EmailService {
  constructor(
    private readonly provider: EmailProvider,
    private readonly defaultConfig?: {
      fromAddress: string;
    },
  ) {}

  async send(config: SendConfig) {
    await this.provider.send(config);
  }
}

export const emailService = new EmailService(
  new ResendProvider({
    API_URL: "https://api.resend.com/emails",
    AUTH_KEY: process.env.RESEND_API_KEY!,
  }),
);
