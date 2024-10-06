import { Button, TimeFormatted, Timer } from "@/shared/components";
import { JoinContestButton } from "../components/JoinContestButton";
import {
  getContest,
  getContestStats,
  isParticipantRegistered,
} from "@/services/contest";
import { formatDistanceStrict, formatDistanceToNow } from "date-fns";
import { SvgCalendar, SvgGameController, SvgTimer } from "@/assets/icons";
import { getAuthUser } from "@/services/auth";

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
  const [user, contest, hasAlreadyJoined, contestStats] = await Promise.all([
    getAuthUser(),
    getContest(params.slug),
    isParticipantRegistered(params.slug),
    getContestStats(params.slug),
  ]);

  const contestStatus = getEventStatus(contest.startsAt, contest.endsAt);

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <div className="flex flex-col items-center">
        <h2 className="mb-3 mt-12 text-3xl font-medium">{contest.name}</h2>
        {contestStatus === "yet-to-start" && (
          <p className="text-lg">
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

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <div>
          <p className="flex gap-2 rounded-full bg-slate-700 px-3 py-2 text-sm leading-none">
            <SvgGameController /> {contest.game.toUpperCase()}
          </p>
        </div>

        <div>
          <p className="flex gap-2 rounded-full bg-slate-700 px-3 py-2 text-sm leading-none">
            <SvgTimer />{" "}
            {formatDistanceStrict(contest.endsAt, contest.startsAt)}
          </p>
        </div>

        <div>
          <p className="flex gap-2 rounded-full bg-slate-700 px-3 py-2 text-sm leading-none">
            <SvgCalendar />{" "}
            <TimeFormatted time={contest.startsAt} format="dd/MM/yy hh:mm a" />
          </p>
        </div>

        <div>
          <p className="rounded-full bg-slate-700 px-3 py-2 text-sm leading-none">
            {contest.participation === "individual"
              ? contestStats.usersCount
              : contestStats.teamsCount}{" "}
            {contest.participation === "individual" ? "User(s)" : "Team(s)"}{" "}
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
        {user.roles.includes("host") ? (
          <Button as="link" href={`${contest.id}/host`}>
            Host Game
          </Button>
        ) : null}

        {!hasAlreadyJoined &&
          ["in-progress", "yet-to-start"].includes(contestStatus) && (
            <JoinContestButton contestId={contest.id} />
          )}

        {hasAlreadyJoined && contestStatus === "in-progress" && (
          <Button as="link" href={`${contest.id}/arena`}>
            Go To Arena
          </Button>
        )}

        {hasAlreadyJoined && contestStatus === "yet-to-start" && (
          <p>You have registered for the contest</p>
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
        className="prose prose-invert mt-8 pb-36 pt-8"
      ></div>
    </div>
  );
}
