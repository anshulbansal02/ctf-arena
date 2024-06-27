import { Avatar } from "@/shared/components";

import GoldMedal from "@/assets/media/gold-medal.png";
import SilverMedal from "@/assets/media/silver-medal.png";
import BronzeMedal from "@/assets/media/bronze-medal.png";
import Image from "next/image";

const medalURIs = {
  1: GoldMedal,
  2: SilverMedal,
  3: BronzeMedal,
};

function ProgressBar(props: { total: number; value: number }) {
  return (
    <div className="h-2 w-28 rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-[#20b58d]"
        style={{ width: (props.value / props.total) * 100 + "%" }}
      ></div>
    </div>
  );
}

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
      challengesSolved: 2,
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

  function Rank({ index }: { index: number }) {
    const rank = index + 1;
    if (rank > 3) return rank;

    return (
      <Image
        src={medalURIs[rank] as any}
        alt="Picture of the author"
        className="mx-auto w-8"
        width={100}
        height={100}
      />
    );
  }

  return (
    <div className="px-4 md:px-16">
      <div className="mt-32 flex flex-col gap-12 lg:flex-row">
        <section className="flex-[2]">
          <h1 className="text-center text-3xl font-normal text-slate-300">
            Leaderboard
          </h1>
          <div className="mt-8">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-base">
                  <th className="p-2 font-medium text-zinc-400"></th>
                  <th className="p-2 font-medium text-zinc-400">Team</th>
                  <th className="p-2 font-medium text-zinc-400">
                    Challenges Solved
                  </th>
                  <th className="p-2 font-medium text-zinc-400">Points</th>
                </tr>
              </thead>
              <tbody className="max-h-44 overflow-auto">
                {leaderboard.map((entry, i) => (
                  <tr className="bg-zinc-950">
                    <td className="rounded-s-xl p-3 px-4 text-center">
                      <Rank index={i} />
                    </td>
                    <td className="flex items-center gap-2 p-3">
                      <div className="flex items-center">
                        {entry.members.map((id) => (
                          <Avatar
                            rounded
                            username={id}
                            size={20}
                            className="-ml-2 rounded-full border border-zinc-950"
                          />
                        ))}
                      </div>
                      <span className="text-ellipsis text-nowrap">
                        {entry.team}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar total={8} value={entry.challengesSolved} />
                        <span className="text-sm text-zinc-400">
                          {entry.challengesSolved}/8
                        </span>
                      </div>
                    </td>
                    <td className="rounded-e-xl p-3 px-4 text-lg">
                      {entry.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20 flex-1 lg:-order-1">
          <h2 className="text-center text-xl font-normal text-slate-300">
            Quickest At
          </h2>
          <p className="mt-2 text-balance text-center text-sm text-zinc-500">
            Least time taken (in seconds) to solve challenge
          </p>

          <table className="mt-4 w-full border-separate border-spacing-y-1">
            <thead>
              <tr className="text-left text-base">
                <th className="p-2 font-medium text-zinc-400">Challenge</th>
                <th className="p-2 font-medium text-zinc-400">Team</th>
                <th className="p-2 font-medium text-zinc-400">Timing</th>
              </tr>
            </thead>
            <tbody className="max-h-44 overflow-auto">
              {challengeTiming.map((entry) => (
                <tr className="bg-zinc-950">
                  <td className="rounded-s-xl p-3 px-4">{entry.number}</td>
                  <td className="text-nowrap p-3">{entry.team ?? "-"}</td>
                  <td className="rounded-e-xl p-3 px-4">
                    {entry.timeTaken ? entry.timeTaken + "s" : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-20 flex-1">
          <h2 className="text-center text-xl font-normal text-slate-300">
            Sprinters
          </h2>
          <p className="mt-2 text-balance text-center text-sm text-zinc-500">
            Most number of challenges solved in last 30 minutes
          </p>

          <table className="mt-4 w-full border-separate border-spacing-y-1">
            <thead>
              <tr className="text-left text-base">
                <th className="p-2 font-medium text-zinc-400">Team</th>
                <th className="p-2 font-medium text-zinc-400">Solved</th>
              </tr>
            </thead>
            <tbody className="max-h-44 overflow-auto">
              {leaderboard.map((entry, i) => (
                <tr className="bg-zinc-950">
                  <td className="rounded-s-xl p-3 px-4">{entry.team}</td>
                  <td className="rounded-e-xl p-3 px-4">
                    {entry.challengesSolved}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
