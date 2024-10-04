import { groupBy } from "@/lib/utils";
import { EmailProvider, SendConfig } from "../types";
import {
  SESv2Client,
  SendBulkEmailCommand,
  SendEmailCommand,
  SendBulkEmailCommandInput,
} from "@aws-sdk/client-sesv2";

export class SESProvider implements EmailProvider {
  ses: SESv2Client;

  constructor(
    private readonly sesConfig: {
      AWS_REGION: string;
      ACCESS_KEY_ID: string;
      SECRET_ACCESS_KEY: string;
    },
  ) {
    this.ses = new SESv2Client({
      region: sesConfig.AWS_REGION,
      apiVersion: "2010-12-01",
      credentials: {
        accessKeyId: sesConfig.ACCESS_KEY_ID,
        secretAccessKey: sesConfig.SECRET_ACCESS_KEY,
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

  async batchSend(configs: SendConfig[]) {
    if (!configs.length) return;

    const configsGroupedByFrom = Object.entries(
      groupBy(configs, (config) => config.address.from),
    );

    const batches = configsGroupedByFrom.map<SendBulkEmailCommandInput>(
      ([fromAddress, emails]) => ({
        DefaultContent: {
          Template: {
            TemplateName: "FullReplacementTemplate",
            TemplateData: JSON.stringify({
              subject: "{{subject}}",
              body: "{{body}}",
            }),
          },
        },
        FromEmailAddress: fromAddress,

        BulkEmailEntries: emails?.map((email) => ({
          Destination: { ToAddresses: [email.address.to] },
          ReplacementEmailContent: {
            ReplacementTemplate: {
              ReplacementTemplateData: JSON.stringify({
                subject: email.subject,
                body: email.body,
              }),
            },
          },
        })),
      }),
    );

    await Promise.allSettled(
      batches.map(async (batch) => {
        const command = new SendBulkEmailCommand(batch);
        await this.ses.send(command);
      }),
    );
  }
}
