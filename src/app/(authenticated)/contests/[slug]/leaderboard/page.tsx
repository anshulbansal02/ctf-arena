import { MainLeaderboard } from "./components/MainLeaderboard";
import { QuickestAtLeaderboard } from "./components/QuickestAtLeaderboard";
import { SprintersLeaderboard } from "./components/SprintersLeaderboard";

export default function LeaderboardPage() {
  const leaderboard = [
    {
      team: "Guyanese Giants",
      challengesSolved: 3,
      score: 456,
      members: [1, 2, 3, 4],
    },
    {
      team: "Gradies",
      challengesSolved: 4,
      score: 613,
      members: [5, 6, 7, 8],
    },
    {
      team: "Watsicas",
      challengesSolved: 6,
      score: 792,
      members: [9, 10, 11, 12],
    },
    {
      team: "ADs",
      challengesSolved: 3,
      score: 432,
      members: [13, 21, 313, 43],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [143, 213, 3113, 443],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
    {
      team: "ADs",
      challengesSolved: 2,
      score: 432,
      members: [153, 211, 5313, 453],
    },
  ].toSorted((a, b) => b.score - a.score);

  const challengeTiming = [
    {
      number: 1,
      team: "Plantations",
      timeTaken: 634,
    },
    {
      number: 2,
      team: "Lake Elsinores",
      timeTaken: 901,
    },
    {
      number: 3,
      team: "Lafayettes",
      timeTaken: 136,
    },
    {
      number: 4,
      team: "Effertz",
      timeTaken: 178,
    },
    {
      number: 5,
      team: "Orchestrators",
      timeTaken: 53,
    },
    {
      number: 6,
      team: null,
      timeTaken: null,
    },
    {
      number: 7,
      team: null,
      timeTaken: null,
    },
    {
      number: 8,
      team: null,
      timeTaken: null,
    },
    {
      number: 9,
      team: null,
      timeTaken: null,
    },
  ];

  return (
    <div className="px-4 md:px-16">
      <div className="mt-32 flex flex-col gap-12 lg:flex-row">
        <section className="flex-[2]">
          <h1 className="text-center text-3xl font-normal text-slate-300">
            Leaderboard &gt; CTF Challenge 1.0
          </h1>
          <div className="mt-8">
            <MainLeaderboard contestId={1} />
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
            <QuickestAtLeaderboard data={challengeTiming} />
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
            <SprintersLeaderboard data={leaderboard} />
          </div>
        </section>
      </div>
    </div>
  );
}
