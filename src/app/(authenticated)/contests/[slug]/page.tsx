import { Timer } from "@/shared/components";
import { JoinContestButton } from "../components/JoinContestButton";
import { getContest } from "@/services/contest/services";

export default async function ContestPage({
  params,
}: {
  params: { slug: string };
}) {
  const contest = await getContest(+params.slug);

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <h2 className="mt-12 text-3xl font-medium">{contest.name}</h2>

      <div className="mt-8 flex w-full items-center justify-between">
        <p>
          Starts In: <Timer till={contest.startsAt} running />
        </p>

        <JoinContestButton contestId={contest.id} />
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: contest.description ?? "" }}
        className="prose prose-invert mt-8"
      ></div>
    </div>
  );
}
