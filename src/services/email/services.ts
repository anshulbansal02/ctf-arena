import { ResendProvider } from "./adapters/resend";
import { EmailProvider, SendConfig } from "./types";

class EmailService {
  private defaultConfig: Partial<SendConfig> = {};

  constructor(private readonly provider: EmailProvider) {}

  setDefaults(config: Partial<SendConfig>) {
    this.defaultConfig = config;
  }

  async send(config: Partial<SendConfig>) {
    await this.provider.send({
      ...this.defaultConfig,
      ...config,
    } as SendConfig);
  }
}

export const emailService = new EmailService(
  new ResendProvider({
    API_URL: "https://api.resend.com/emails",
    AUTH_KEY: process.env.RESEND_API_KEY!,
  }),
);
