import * as leaderboard from "@/services/contest/leaderboard";
import { cache } from "@/services/cache";
import { batchSendInvitations } from "@/services/team";
import {
  contestChannel,
  getContestsStartingInOneHour,
} from "@/services/contest/services";
import { connection as dbConnection } from "@/services/db";
import Bull from "bull";
import { loadUsersOnboardedIntoCache } from "./services/auth";

export async function register() {
  await dbConnection.connect();

  const jobQueue = new Bull("general-job-queue");

  jobQueue.process("batch-send-invitations", async () => {
    batchSendInvitations();
  });

  jobQueue.process(
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

  jobQueue.process("hourly-job", async () => {
    const contestsStartingInOneHour = await getContestsStartingInOneHour();

    contestsStartingInOneHour.forEach((contest) => {
      jobQueue.add("sprinting-teams-update", contest, {
        repeat: {
          cron: "* * * * *",
          startDate: contest.startsAt,
          endDate: contest.endsAt,
        },
      });
    });
  });

  jobQueue.add("batch-send-invitations", {
    repeat: {
      cron: "* * * * *",
    },
  });

  jobQueue.add("hourly-job", {
    repeat: {
      cron: "0 0 * * *",
    },
  });

  cache.subscribe(contestChannel("submission"), (data) => {
    const submission = JSON.parse(data);

    leaderboard.quickestFirstsProcessor(submission);
    leaderboard.sumOfScoresProcessor(submission);
    leaderboard.sprintingTeamsProcessor(submission);
  });

  await loadUsersOnboardedIntoCache();
}
