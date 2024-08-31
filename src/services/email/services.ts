import { config } from "@/config";
import { EmailProvider, SendConfig } from "./types";
import { SESProvider } from "./adapters/ses";
import { ResendProvider } from "./adapters/resend";
import { SendGridProvider } from "./adapters/sendgrid";

class EmailService {
  constructor(private readonly provider: EmailProvider) {}

  async send(config: SendConfig) {
    await this.provider.send(config);
  }
}

export function getEmailService(): EmailService {
  const activeProvider = config.email.activeProvider as
    | "ses"
    | "resend"
    | "sendgrid";

  const provider = (() => {
    switch (activeProvider) {
      case "ses":
        return new SESProvider({
          AWS_REGION: config.email.providers.ses.aws.region!,
          ACCESS_KEY_ID: config.email.providers.ses.accessKey!,
          SECRET_ACCESS_KEY: config.email.providers.ses.secret!,
        });
      case "resend":
        return new ResendProvider({
          API_URL: config.email.providers.resend.apiUrl!,
          AUTH_KEY: config.email.providers.resend.key!,
        });
      case "sendgrid":
        return new SendGridProvider({
          AUTH_KEY: config.email.providers.sendgrid.apiUrl!,
          API_URL: config.email.providers.sendgrid.key!,
        });
    }
  })();

  return new EmailService(provider);
}
