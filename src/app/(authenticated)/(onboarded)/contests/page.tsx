import { getContests } from "@/services/contest";
import Link from "next/link";

export default async function ContestsPage() {
  const [activeContests, upcomingContests, pastContests] = await Promise.all([
    getContests("active"),
    getContests("upcoming"),
    getContests("ended"),
  ]);

  return (
    <div className="mx-auto mb-32 mt-16 w-[560px]">
      <section>
        <h2>Ongoing Contests</h2>
        <div>
          {activeContests.length ? (
            activeContests.map((contest) => (
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
            <p className="mt-4 text-slate-400">No active contests</p>
          )}
        </div>
      </section>
      <section>
        <h2>Upcoming Contests</h2>
        <div>
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
            <p className="mt-4 text-slate-400">No upcoming contests</p>
          )}
        </div>
      </section>
      <section>
        <h2>Past Contests</h2>
        <div>
          {pastContests.length ? (
            pastContests.map((contest) => (
              <div className="contest-card mt-4 flex items-center justify-between gap-8 rounded-lg bg-[#282D31] px-6 py-4">
                <div className="text-left">
                  <Link
                    href={`contests/${contest.id}`}
                    className="text-xl font-medium"
                  >
                    {contest.name}
                  </Link>
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
            <p className="mt-4 text-slate-400">No past contests</p>
          )}
        </div>
      </section>
    </div>
  );
}
