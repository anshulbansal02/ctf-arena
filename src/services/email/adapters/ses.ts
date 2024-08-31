import { EmailProvider, SendConfig } from "../types";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export class SESProvider implements EmailProvider {
  ses: SESv2Client;

  constructor(
    private readonly config: {
      AWS_REGION: string;
      ACCESS_KEY_ID: string;
      SECRET_ACCESS_KEY: string;
    },
  ) {
    this.ses = new SESv2Client({
      region: config.AWS_REGION,
      apiVersion: "2010-12-01",
      credentials: {
        accessKeyId: config.ACCESS_KEY_ID,
        secretAccessKey: config.SECRET_ACCESS_KEY,
      },
    });
  }

  async send(config: SendConfig) {
    const command = new SendEmailCommand({
      FromEmailAddress: config.address.from,
      Destination: { ToAddresses: [config.address.to] },
      Content: {
        Simple: {
          Body: { Html: { Data: config.body } },
          Subject: { Data: config.subject },
        },
      },
    });

    await this.ses.send(command);
  }
}
