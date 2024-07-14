import { Button, Timer } from "@/shared/components";
import { JoinContestButton } from "../components/JoinContestButton";
import { getContest, hasTeamAlreadyJoinedContest } from "@/services/contest";

export default async function ContestPage({
  params,
}: {
  params: { slug: string };
}) {
  const contest = await getContest(+params.slug);
  const hasAlreadyJoined = await hasTeamAlreadyJoinedContest(+params.slug);
  const now = new Date();
  const contestStatus =
    contest.startsAt < now
      ? "yet-to-start"
      : contest.endsAt > now
        ? "in-progress"
        : "ended";

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <h2 className="mt-12 text-3xl font-medium">{contest.name}</h2>

      <div className="mt-8 flex w-full items-center justify-between">
        <p>
          Starts In: <Timer till={contest.startsAt} running />
        </p>

        {hasAlreadyJoined && contestStatus === "in-progress" ? (
          <Button variant="ghost" as="link" href="arena">
            Make Submissions
          </Button>
        ) : (
          <JoinContestButton contestId={contest.id} />
        )}
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: contest.description ?? "" }}
        className="prose prose-invert mt-8"
      ></div>
    </div>
  );
}
