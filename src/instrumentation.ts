import Bull from "bull";
import * as leaderboard from "@/services/contest/leaderboard";
// import { cache } from "@/services/cache";
import { batchSendInvitations } from "@/services/team";
import {
  contestChannel,
  getContestsStartingInOneHour,
} from "@/services/contest/services";
import { connection as dbConnection } from "@/services/db";
import { loadUsersOnboardedIntoCache } from "./services/auth";
import { contestQueue, jobQueue } from "@/services/queue";

async function bootstrapServer() {
  const { cache } = await import("@/services/cache");

  try {
    console.info(`[Bootstrap] Connecting to database ${dbConnection.host}`);
    await dbConnection.connect();
    console.info(`[Bootstrap] Successfully connected to database`);
  } catch (e) {
    console.error(`[Bootstrap] Failed to connect to database: `, e);
    throw e;
  }

  try {
    console.info(`[Bootstrap] Connecting to cache`);
    await cache.connect();
    console.info(`[Bootstrap] Successfully connected to cache`);
  } catch (e) {
    console.error(`[Bootstrap] Failed to connect to cache: `, e);
    throw e;
  }

  console.info("[Bootstrap] Instantiating job queues.");

  jobQueue.process("batch-send-invitations", async () => {
    batchSendInvitations();
  });
  jobQueue.add("batch-send-invitations", {
    repeat: { cron: "* * * * *" },
  });

  contestQueue.process(
    "sprinting-teams-update",
    async (
      job: Bull.Job<{
        id: number;
      }>,
    ) => {
      const contest = job.data;

      leaderboard.purgeBuildAndNotify("sprinting_teams", contest.id);
    },
  );

  contestQueue.process("hourly-contest-update", async () => {
    const contestsStartingInOneHour = await getContestsStartingInOneHour();

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

  contestQueue.process(contestChannel("submission"), (job: Bull.Job<any>) => {
    const submission = job.data;
    leaderboard.quickestFirstsProcessor(submission);
    leaderboard.sumOfScoresProcessor(submission);
    leaderboard.sprintingTeamsProcessor(submission);
  });

  await loadUsersOnboardedIntoCache();
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await bootstrapServer();
  }
}
