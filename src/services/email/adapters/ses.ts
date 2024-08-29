import { EmailProvider, SendConfig } from "../types";
import { SES } from "aws-sdk";

export class SESProvider implements EmailProvider {
  ses: SES;

  constructor(
    private readonly config: {
      AWS_REGION: string;
    },
  ) {
    this.ses = new SES({
      region: config.AWS_REGION,
      apiVersion: "2010-12-01",
    });
  }

  async send(config: SendConfig) {
    const result = await this.ses
      .sendEmail({
        Destination: { ToAddresses: config.address.to },
        Message: { Body: config.body, Subject: config.subject },
        Source: config.address.from,
      })
      .promise();
  }
}
