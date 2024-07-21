import { Button, Timer } from "@/shared/components";
import { JoinContestButton } from "../components/JoinContestButton";
import { getContest, hasTeamAlreadyJoinedContest } from "@/services/contest";
import { formatDistanceToNow } from "date-fns";

function getEventStatus(start: Date, end: Date) {
  const now = new Date();
  if (start > now) return "yet-to-start";
  else if (end < now) return "ended";
  return "in-progress";
}

export default async function ContestPage({
  params,
}: {
  params: { slug: string };
}) {
  const contest = await getContest(+params.slug);
  const hasAlreadyJoined = await hasTeamAlreadyJoinedContest(+params.slug);
  const contestStatus = getEventStatus(contest.startsAt, contest.endsAt);

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <h2 className="mt-12 text-3xl font-medium">{contest.name}</h2>

      <div className="mt-8 flex w-full items-center justify-between">
        {contestStatus === "yet-to-start" && (
          <p>
            Starts In: <Timer till={contest.startsAt} running />
          </p>
        )}

        {contestStatus === "ended" && (
          <p>
            Ended {formatDistanceToNow(contest.endsAt, { addSuffix: true })}
          </p>
        )}

        {["ended", "present"].includes(contestStatus) && (
          <div>
            <p>Number of submissions: </p>
            <Button>View Leaderboard</Button>
          </div>
        )}

        {["present", "future"].includes(contestStatus) && <div></div>}

        {["present", "future"].includes(contestStatus) && !hasAlreadyJoined && (
          <JoinContestButton contestId={contest.id} />
        )}

        {hasAlreadyJoined && contestStatus === "in-progress" ? (
          <Button variant="ghost" as="link" href="arena">
            Make Submissions
          </Button>
        ) : null}
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: contest.description ?? "" }}
        className="prose prose-invert mt-8"
      ></div>
    </div>
  );
}

/**
 * (not joined) present, future - BTN Join Contest,
 * (joined, not joined) past - TEXT Ended,
 * (joined, not joined) past, present - TEXT Number of Submissions,
 * (joined, not joined) past, present - BTN Go to leaderboard,
 * (joined, not joined) past, present, future - TEXT Number of participants,
 * (joined, not joined) present, future - TEXT Timer,
 * (joined) present - BTN Go to arena,
 */
