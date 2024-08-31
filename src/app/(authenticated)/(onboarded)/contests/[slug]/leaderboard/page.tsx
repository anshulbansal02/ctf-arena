import { getContest } from "@/services/contest";
import { MainLeaderboard } from "./components/MainLeaderboard";
import { QuickestAtLeaderboard } from "./components/QuickestAtLeaderboard";
import { SprintersLeaderboard } from "./components/SprintersLeaderboard";
import { redirect } from "next/navigation";
import { Timer } from "@/shared/components";

export default async function LeaderboardPage({
  params,
}: {
  params: { slug: number };
}) {
  // Check if contest is ended or not started
  const contest = await getContest(params.slug);

  if (contest.startsAt > new Date()) {
    redirect(`/contests/${contest.id}`);
  }

  if (contest.isUnranked) {
    redirect(`/contests/${contest.id}`);
  }

  return (
    <div className="px-4 md:px-16">
      <div className="fixed left-6 top-5 z-20 rounded-md bg-slate-700 px-4 py-2 shadow-md">
        <span className="font-mono text-lg font-semibold">
          {contest.endsAt < new Date() ? (
            "Contest has ended"
          ) : (
            <Timer till={contest.endsAt} running />
          )}
        </span>
      </div>

      <div className="mt-32 flex flex-col gap-12 lg:flex-row">
        <section className="flex-[2]">
          <h1 className="text-center text-3xl font-normal text-slate-300">
            Leaderboard
            <br />
            <span className="text-xl font-medium">{contest.name}</span>
          </h1>
          <div className="mt-8">
            <MainLeaderboard
              contestId={+params.slug}
              totalChallenges={contest.noOfChallenges}
            />
          </div>
        </section>

        <section className="mt-20 flex-1 lg:-order-1">
          <h2 className="text-center text-xl font-normal text-slate-300">
            Quickest At
          </h2>
          <p className="mt-2 text-balance text-center text-sm text-zinc-500">
            Least time taken (in seconds) to solve challenge
          </p>
          <div className="mt-8">
            <QuickestAtLeaderboard contestId={+params.slug} />
          </div>
        </section>

        <section className="mt-20 flex-1">
          <h2 className="text-center text-xl font-normal text-slate-300">
            Sprinters
          </h2>
          <p className="mt-2 text-balance text-center text-sm text-zinc-500">
            Most number of challenges solved in last 30 minutes
          </p>
          <div className="mt-8">
            <SprintersLeaderboard contestId={+params.slug} />
          </div>
        </section>
      </div>
    </div>
  );
}
