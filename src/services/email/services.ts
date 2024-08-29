import { config } from "@/config";
import { ResendProvider } from "./adapters/resend";
import { EmailProvider, SendConfig } from "./types";

class EmailService {
  constructor(private readonly provider: EmailProvider) {}

  async send(config: SendConfig) {
    await this.provider.send(config);
  }
}

export const emailService = new EmailService(
  new ResendProvider({
    API_URL: "https://api.resend.com/emails",
    AUTH_KEY: config.email.provider.resend.key!,
  }),
);
