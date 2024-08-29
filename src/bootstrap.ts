import { connection as dbConnection } from "@/services/db";
import { contestQueue, jobQueue, notificationsQueue } from "@/services/queue";
import * as leaderboard from "@/services/contest/leaderboard";
import { cache } from "@/services/cache";
import { batchSendInvitations } from "@/services/team";
import {
  batchSendContestIntimation,
  contestChannel,
  getContestsStartingInOneHour,
} from "@/services/contest";
import Bull from "bull";
import { formatDistanceToNow } from "date-fns";

export async function bootstrap() {
  try {
    console.info(`[Bootstrap] Connecting to database`);
    await dbConnection.connect();
    console.info(`[Bootstrap] Successfully connected to database`);
  } catch (e) {
    console.error(`[Bootstrap] Failed to connect to database: `, e);
    throw e;
  }

  try {
    console.info(`[Bootstrap] Connecting to cache`);
    if (!cache.isOpen) await cache.connect();
    console.info(`[Bootstrap] Successfully connected to cache`);
  } catch (e) {
    console.error(`[Bootstrap] Failed to connect to cache: `, e);
    throw e;
  }

  console.info("[Bootstrap] Instantiating job queues");

  jobQueue.process("batch-send-invitations", () => {
    console.info("[Job] Batch sending invitations");
    batchSendInvitations();
  });
  jobQueue.add("batch-send-invitations", null, {
    repeat: { cron: "* * * * *" },
  });

  jobQueue.process("notifications", async () => {
    console.info(`[Job] Creating notifications`);
    // create new notification
  });

  contestQueue.process(
    "minutely-contest-update",
    async (job: Bull.Job<{ id: number }>) => {
      console.info(
        `[Job] Updating sprinting teams leaderboard for contest id ${job.data.id}`,
      );
      const contest = job.data;

      leaderboard.purgeBuildAndNotify("sprinting_teams", contest.id);
    },
  );

  contestQueue.process("hourly-contest-update", async () => {
    console.info(`[Job] Hourly contest updates`);
    const contestsStartingInOneHour = await getContestsStartingInOneHour();

    notificationsQueue.addBulk(
      contestsStartingInOneHour.flatMap((contest) => ({
        name: "new-notification",
        data: {
          content: `Contest <b>${contest.name}</b> is starting in ${formatDistanceToNow(contest.startsAt)}`,
        },
      })),
    );

    contestsStartingInOneHour.forEach((contest) => {
      batchSendContestIntimation(contest.id);
    });

    contestsStartingInOneHour.forEach((contest) => {
      contestQueue.add("minutely-contest-update", contest, {
        repeat: {
          cron: "* * * * *",
          startDate: contest.startsAt,
          endDate: contest.endsAt,
        },
      });
    });
  });

  contestQueue.add("hourly-contest-update", null, {
    repeat: { cron: "0 0 * * *" },
  });

  contestQueue.process(
    await contestChannel("submission"),
    (job: Bull.Job<leaderboard.ContestSubmission>) => {
      console.info(`[Job] Processing submission id ${job.data.submissionId}`);
      const submission = job.data;
      leaderboard.quickestFirstsProcessor(submission);
      leaderboard.sumOfScoresProcessor(submission);
      leaderboard.sprintingTeamsProcessor(submission);
    },
  );
}
