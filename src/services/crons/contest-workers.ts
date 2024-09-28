import Bull from "bull";
import {
  batchSendContestReminder,
  getUpcomingContestsOfHours,
} from "../contest";
import { contestQueue, eventChannel } from "../queue";
import { differenceInMilliseconds, subHours } from "date-fns";

type Contest = {
  id: number;
  name: string;
  shortDescription: string | null;
  description: string | null;
  unranked: boolean | null;
  participationType: "individual" | "team";
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
};

type ContestEvent = "contest_started" | "contest_ended";

// Processor for contest submission
contestQueue.process("submission", async (job: Bull.Job<{}>) => {
  //
});

// Processor for upcoming contests
contestQueue.process(
  "upcoming-contests",
  async (job: Bull.Job<{ upcomingContestsTill: number }>) => {
    const contests = await getUpcomingContestsOfHours(
      job.data.upcomingContestsTill,
    );

    contests.forEach((contest) => {
      const now = new Date();

      contestQueue.add(
        "event",
        { name: "contest_started", contest },
        {
          jobId: `event_contest_${contest.id}_started`,
          delay: differenceInMilliseconds(contest.startsAt, now),
        },
      );

      contestQueue.add(
        "event",
        { name: "contest_ended", contest },
        {
          jobId: `event_contest_${contest.id}_ended`,
          delay: differenceInMilliseconds(contest.endsAt, now),
        },
      );

      contestQueue.add("minute-lap", contest, {
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
  (job: Bull.Job<{ name: ContestEvent; contest: Contest }>) => {
    const { name: eventName, contest } = job.data;
    eventChannel.publish(`contest:${eventName}`, contest);
  },
);

// Processor for each minute passed in a contest
contestQueue.process("minute-lap", (job: Bull.Job<{ contest: Contest }>) => {
  const { contest } = job.data;
  // Update leaderboard
  // do other things
});

// Processor for contest reminders
contestQueue.process("reminder", (job: Bull.Job<{ contest: Contest }>) => {
  const { contest } = job.data;
  batchSendContestReminder(contest.id);
});
