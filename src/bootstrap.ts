import { connection as dbConnection } from "@/services/db";
import { contestQueue, jobQueue } from "@/services/queue";
import * as leaderboard from "@/services/contest/leaderboard";
import { cache } from "@/services/cache";
import { batchSendInvitations } from "@/services/team";
import {
  batchSendContestIntimation,
  contestChannel,
  getContestsStartingInOneHour,
} from "@/services/contest";
import Bull from "bull";

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
  jobQueue.add("batch-send-invitations", {
    repeat: { cron: "* * * * *" },
  });

  jobQueue.process("notifications", async () => {
    // create new notification
  });

  contestQueue.process(
    "sprinting-teams-update",
    async (job: Bull.Job<{ id: number }>) => {
      const contest = job.data;

      leaderboard.purgeBuildAndNotify("sprinting_teams", contest.id);
    },
  );

  contestQueue.process("hourly-contest-update", async () => {
    const contestsStartingInOneHour = await getContestsStartingInOneHour();

    jobQueue.add("notifications", []);

    contestsStartingInOneHour.forEach((contest) => {
      batchSendContestIntimation(contest.id);
    });

    contestsStartingInOneHour.forEach((contest) => {
      contestQueue.add("sprinting-teams-update", contest, {
        repeat: {
          cron: "* * * * *",
          startDate: contest.startsAt,
          endDate: contest.endsAt,
        },
      });
    });
  });

  contestQueue.add("hourly-contest-update", {
    repeat: { cron: "0 0 * * *" },
  });

  contestQueue.process(
    await contestChannel("submission"),
    (job: Bull.Job<leaderboard.ContestSubmission>) => {
      const submission = job.data;
      leaderboard.quickestFirstsProcessor(submission);
      leaderboard.sumOfScoresProcessor(submission);
      leaderboard.sprintingTeamsProcessor(submission);
    },
  );
}
