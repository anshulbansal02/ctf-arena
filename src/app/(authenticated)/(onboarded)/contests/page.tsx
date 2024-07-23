import { getContests } from "@/services/contest";
import { Avatar } from "@/shared/components";
import { nanoid } from "nanoid";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function ContestsPage() {
  const [activeContests, upcomingContests, pastContests] = await Promise.all([
    getContests("active"),
    getContests("upcoming"),
    getContests("ended"),
  ]);

  return (
    <div className="mx-auto mb-32 mt-32 w-[560px]">
      <h2 className="mb-4 text-center text-2xl">Contests</h2>
      <section className="mb-16">
        <h2 className="text-slate-400">Ongoing Contests</h2>
        <div>
          {activeContests.length ? (
            activeContests.map((contest) => (
              <Link href={`contests/${contest.id}`} key={contest.id}>
                <div className="contest-card mt-4 flex items-center justify-between gap-8 rounded-lg bg-[#282D31] px-6 py-4 transition-colors hover:bg-[#424a51]">
                  <div className="text-left">
                    <h3 className="text-xl font-medium">{contest.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center">
                        {Array(5)
                          .fill(0)
                          .map((_) => (
                            <Avatar
                              className="-ml-2 rounded-full border border-[#282D31] bg-slate-400 first:ml-0"
                              size={20}
                              rounded
                              username={nanoid()}
                            />
                          ))}
                      </div>
                      <p>17 teams participating</p>
                    </div>
                    <p className="mt-4 text-sm font-light leading-snug text-slate-300">
                      {contest.shortDescription}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-center">
                    <p className="font-medium">Ending</p>
                    <p>
                      {formatDistanceToNow(contest.endsAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="mt-4 text-slate-400">No active contests</p>
          )}
        </div>
      </section>
      <section className="mb-16">
        <h2>Upcoming Contests</h2>
        <div>
          {upcomingContests.length ? (
            upcomingContests.map((contest) => (
              <Link href={`contests/${contest.id}`} key={contest.id}>
                <div className="contest-card mt-4 flex items-center justify-between gap-8 rounded-lg bg-[#282D31] px-6 py-4 transition-colors hover:bg-[#424a51]">
                  <div className="text-left">
                    <h3 className="text-xl font-medium">{contest.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center">
                        {Array(5)
                          .fill(0)
                          .map((_) => (
                            <Avatar
                              className="-ml-2 rounded-full border border-[#282D31] bg-slate-400 first:ml-0"
                              size={20}
                              rounded
                              username={nanoid()}
                            />
                          ))}
                      </div>
                      <p>17 teams to participate</p>
                    </div>
                    <p className="mt-4 text-sm font-light leading-snug text-slate-300">
                      {contest.shortDescription}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-center">
                    <p className="font-medium">Starts</p>
                    <p>
                      {formatDistanceToNow(contest.startsAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="mt-4 text-slate-400">No past contests</p>
          )}
        </div>
      </section>
      <section className="mb-16">
        <h2>Past Contests</h2>
        <div>
          {pastContests.length ? (
            pastContests.map((contest) => (
              <Link href={`contests/${contest.id}`} key={contest.id}>
                <div className="contest-card mt-4 flex items-center justify-between gap-8 rounded-lg bg-[#282D31] px-6 py-4 transition-colors hover:bg-[#424a51]">
                  <div className="text-left">
                    <h3 className="text-xl font-medium">{contest.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center">
                        {Array(5)
                          .fill(0)
                          .map((_) => (
                            <Avatar
                              className="-ml-2 rounded-full border border-[#282D31] bg-slate-400 first:ml-0"
                              size={20}
                              rounded
                              username={nanoid()}
                            />
                          ))}
                      </div>
                      <p>17 teams participated</p>
                    </div>
                    <p className="mt-4 text-sm font-light leading-snug text-slate-300">
                      {contest.shortDescription}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-center">
                    <p className="font-medium">Ended</p>
                    <p>
                      {formatDistanceToNow(contest.endsAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="mt-4 text-slate-400">No past contests</p>
          )}
        </div>
      </section>
    </div>
  );
}
