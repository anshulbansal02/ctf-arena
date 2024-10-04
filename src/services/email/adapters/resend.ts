import { EmailProvider, SendConfig } from "../types";

export class ResendProvider implements EmailProvider {
  constructor(
    private readonly config: {
      API_URL: string;
      AUTH_KEY: string;
      headers?: Record<string, string>;
    },
  ) {}

  async send(config: SendConfig) {
    await fetch(new URL("emails", this.config.API_URL), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.AUTH_KEY}`,
        "Content-Type": "application/json",
        ...this.config.headers,
      },
      body: JSON.stringify({
        from: config.address.from,
        to: config.address.to,
        subject: config.subject,
        html: config.body,
      }),
    });
  }

  async batchSend(configs: SendConfig[]) {
    if (!configs.length) return;

    await fetch(new URL("emails/batch", this.config.API_URL), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.AUTH_KEY}`,
        "Content-Type": "application/json",
        ...this.config.headers,
      },
      body: JSON.stringify(
        configs.map((config) => ({
          from: config.address.from,
          to: config.address.to,
          subject: config.subject,
          html: config.body,
        })),
      ),
    });
  }
}
