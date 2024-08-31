import { Button, Timer } from "@/shared/components";
import { JoinContestButton } from "../components/JoinContestButton";
import {
  getContest,
  getContestStats,
  hasTeamAlreadyJoinedContest,
} from "@/services/contest";
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
  params: { slug: number };
}) {
  const [contest, hasAlreadyJoined, contestStats] = await Promise.all([
    getContest(params.slug),
    hasTeamAlreadyJoinedContest(params.slug),
    getContestStats(params.slug),
  ]);

  const contestStatus = getEventStatus(contest.startsAt, contest.endsAt);

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <div className="flex flex-col items-center">
        <h2 className="mb-3 mt-12 text-3xl font-medium">{contest.name}</h2>
        {contestStatus === "yet-to-start" && (
          <p>
            Starts In: <Timer till={contest.startsAt} running />
          </p>
        )}
        {contestStatus === "in-progress" && (
          <p>
            Ends In: <Timer till={contest.endsAt} running />
          </p>
        )}
        {contestStatus === "ended" && (
          <p>
            Ended {formatDistanceToNow(contest.endsAt, { addSuffix: true })}
          </p>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <div>
          <p className="rounded-full bg-slate-700 px-3 py-2 text-sm leading-none">
            {contestStats.teamsCount} Teams{" "}
            {contestStatus === "ended" ? "Participated" : "Participating"}
          </p>
        </div>
        {["ended", "in-progress"].includes(contestStatus) && (
          <div>
            <p className="rounded-full bg-slate-700 px-3 py-2 text-sm leading-none">
              {contestStats.submissionsCount} Submissions
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-6">
        {!hasAlreadyJoined &&
          ["in-progress", "yet-to-start"].includes(contestStatus) && (
            <JoinContestButton contestId={contest.id} />
          )}

        {hasAlreadyJoined && contestStatus === "in-progress" && (
          <Button as="link" href={`${contest.id}/arena`}>
            Go To Arena
          </Button>
        )}

        {["in-progress", "ended"].includes(contestStatus) &&
          !contest.isUnranked && (
            <Button
              variant="ghost"
              as="link"
              href={`${contest.id}/leaderboard`}
            >
              View Leaderboard
            </Button>
          )}
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: contest.description ?? "" }}
        className="prose prose-invert mt-8"
      ></div>
    </div>
  );
}
