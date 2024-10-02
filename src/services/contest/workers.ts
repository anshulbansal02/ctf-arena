import { differenceInMilliseconds, subHours } from "date-fns";
import type { Job } from "bull";
import { batchSendContestReminder, getUpcomingContestsOfHours } from ".";
import { contestQueue, eventChannel } from "@/services/queue";
import contestEvents from "./events";
import { initGameState } from "./games/tambola";

type Contest = {
  id: number;
  name: string;
  shortDescription: string | null;
  game: string;
  description: string | null;
  unranked: boolean | null;
  participationType: "individual" | "team";
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
};

export function setupContestQueues() {
  // Processor for contest submission
  contestQueue.process("submission", async (job: Job<{}>) => {
    //
  });

  // Processor for upcoming contests
  contestQueue.process(
    "upcoming_contests",
    async (job: Job<{ upcomingContestsTill: number }>) => {
      const contests = await getUpcomingContestsOfHours(
        job.data.upcomingContestsTill,
      );

      contests.forEach((contest) => {
        const now = new Date();

        contestQueue.add(
          "event",
          { name: "started", contest },
          {
            jobId: `event_contest_${contest.id}_started`,
            delay: differenceInMilliseconds(contest.startsAt, now),
          },
        );

        contestQueue.add(
          "event",
          { name: "ended", contest },
          {
            jobId: `event_contest_${contest.id}_ended`,
            delay: differenceInMilliseconds(contest.endsAt, now),
          },
        );

        contestQueue.add("minute_lap", contest, {
          jobId: `contest_${contest.id}_minute_lap`,
          repeat: {
            startDate: contest.startsAt,
            endDate: contest.endsAt,
            cron: "* * * * *", // At every minute
          },
        });

        contestQueue.add("reminder", contest, {
          jobId: `contest_${contest.id}_reminder`,
          delay: differenceInMilliseconds(subHours(contest.startsAt, 1), now),
        });
      });
    },
  );

  // Processor for arbitrary contest events
  contestQueue.process(
    "event",
    (job: Job<{ name: string; contest: Contest }>) => {
      const { name: eventName, contest } = job.data;
      eventChannel.publish(contestEvents.game(contest.id, eventName), contest);
    },
  );

  // Processor for each minute passed in a contest
  contestQueue.process("minute_lap", (job: Job<{ contest: Contest }>) => {
    const { contest } = job.data;
    // Update leaderboard
    // do other things
  });

  // Processor for contest reminders
  contestQueue.process("reminder", (job: Job<{ contest: Contest }>) => {
    const { contest } = job.data;
    batchSendContestReminder(contest.id);
  });

  // Init game for new contest
  contestQueue.process("new_contest", (job: Job<{ contest: Contest }>) => {
    const { contest } = job.data;
    if (contest.game === "tambola") initGameState(contest.id);
  });
}
