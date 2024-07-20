import { getContests } from "@/services/contest";
import Link from "next/link";

export async function Contests() {
  const [_activeContests, upcomingContests] = await Promise.all([
    getContests("active"),
    getContests("upcoming"),
  ]);

  return (
    <section className="mb-32 mt-16 w-[560px]">
      <h2 className="mb-8 text-2xl">Contests</h2>
      <div className="mb-12">
        <h4 className="mt-4 text-left font-medium text-slate-400">Ongoing</h4>
        {upcomingContests.length ? (
          upcomingContests.map((contest) => (
            <div className="contest-card mt-4 flex items-center justify-between gap-8 rounded-lg bg-[#282D31] px-6 py-4">
              <div className="text-left">
                <h3 className="text-xl font-medium">{contest.name}</h3>
                <p className="mt-1 text-sm font-light leading-snug text-slate-300">
                  {contest.description}
                </p>
              </div>
              <div className="whitespace-nowrap">
                <p className="font-medium">Starts In</p>
                <p>03:24 Hr</p>
              </div>
            </div>
          ))
        ) : (
          <p className="mt-4 text-slate-400">
            No active contests going on.<br></br> Checkout the upcoming
            contests.
          </p>
        )}
      </div>

      <h4 className="mt-4 text-left font-medium text-slate-400">Upcoming</h4>
      {activeContests.length ? (
        activeContests.map((contest) => (
          <Link href={`contests/${contest.id}`}>
            <div className="contest-card mt-4 flex items-center justify-between gap-8 rounded-lg bg-[#282D31] px-6 py-4 transition-colors hover:bg-[#424a51]">
              <div className="text-left">
                <h3 className="text-xl font-medium">{contest.name}</h3>
                <p className="mt-1 text-sm font-light leading-snug text-slate-300">
                  {contest.description}
                </p>
              </div>
              <div className="whitespace-nowrap">
                <p className="font-medium">Starts In</p>
                <p>03:24 Hr</p>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <p className="mt-4 text-slate-400">No upcoming contests</p>
      )}
    </section>
  );
}
