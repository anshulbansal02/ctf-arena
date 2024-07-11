import { MainLeaderboard } from "./components/MainLeaderboard";
import { QuickestAtLeaderboard } from "./components/QuickestAtLeaderboard";
import { SprintersLeaderboard } from "./components/SprintersLeaderboard";

export default function LeaderboardPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="px-4 md:px-16">
      <div className="mt-32 flex flex-col gap-12 lg:flex-row">
        <section className="flex-[2]">
          <h1 className="text-center text-3xl font-normal text-slate-300">
            Leaderboard &gt; CTF Challenge 1.0
          </h1>
          <div className="mt-8">
            <MainLeaderboard contestId={+params.slug} />
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
