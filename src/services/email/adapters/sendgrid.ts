import { EmailProvider, SendConfig } from "../types";

export class SendGridProvider implements EmailProvider {
  constructor(
    private readonly config: {
      API_URL: string;
      AUTH_KEY: string;
      headers?: Record<string, string>;
    },
  ) {}

  async send(config: SendConfig) {
    const res = await fetch(this.config.API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.AUTH_KEY}`,
        "Content-Type": "application/json",
        ...this.config.headers,
      },
      body: JSON.stringify({
        from: {
          email: config.address.from,
        },
        personalizations: [
          {
            to: [
              {
                email: config.address.to,
              },
            ],
            subject: config.subject,
          },
        ],
        content: [
          {
            type: "text/html",
            value: config.body,
          },
        ],
      }),
    });
  }

  async batchSend(config: SendConfig[]) {
    throw new Error("Method not implemented");
  }
}
