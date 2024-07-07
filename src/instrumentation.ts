import * as leaderboard from "@/services/contest/leaderboard";
import { cache } from "@/services/cache";
import { batchSendInvitations } from "@/services/team";
import { contestChannel } from "@/services/contest/services";
import { CronJob } from "cron";
import { connection as dbConnection } from "@/services/db";

export async function register() {
  await dbConnection.connect();

  // At every minute
  const cron = new CronJob("* * * * *", async () => {
    // contest start hooks
    // contest end hooks
    batchSendInvitations();
  });

  // notifications, emails, leaderboard updates

  cron.start();

  cache.subscribe(contestChannel("submission"), (data) => {
    const submission = JSON.parse(data);

    leaderboard.quickestFirstsProcessor(submission);
    leaderboard.sumOfScoresProcessor(submission);
    leaderboard.sprintingTeamsProcessor(submission);
  });
}
