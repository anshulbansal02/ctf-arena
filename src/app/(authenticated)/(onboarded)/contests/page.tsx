import { getContests } from "@/services/contest";
import Link from "next/link";
import {
  formatDistanceStrict,
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from "date-fns";
import { SvgCalendar, SvgTimer } from "@/assets/icons";
import { TimeFormatted } from "@/shared/components";

function Chip(props: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-nowrap rounded-lg bg-[#353a3e] px-2 py-[6px] text-sm font-medium leading-none shadow-sm">
      {props.children}
    </p>
  );
}

export default async function ContestsPage() {
  const [activeContests, upcomingContests, pastContests] = await Promise.all([
    getContests("active"),
    getContests("upcoming"),
    getContests("ended"),
  ]);

  return (
    <div className="mx-auto mb-32 mt-32 w-full max-w-[560px] px-4">
      <h2 className="mb-8 text-center text-2xl">Contests</h2>
      <section className="mb-16">
        <h2 className="">Ongoing Contests</h2>
        <div>
          {activeContests.length ? (
            activeContests.map((contest) => (
              <Link href={`contests/${contest.id}`} key={contest.id}>
                <div className="mt-4 rounded-lg border border-[#353a3e] bg-[#272a2e] px-4 py-4 transition-colors hover:bg-[#272a2e8f]">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="text-left text-xl font-medium">
                        {contest.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          <>
                            <SvgCalendar />{" "}
                            <TimeFormatted
                              time={contest.startsAt}
                              format="dd/MM/yy hh:mm a"
                            />
                          </>,
                          <>
                            <SvgTimer />{" "}
                            {formatDistanceStrict(
                              contest.endsAt,
                              contest.startsAt,
                            )}
                          </>,
                          ...(contest.unranked ? ["Unranked"] : []),
                        ].map((node, i) => (
                          <Chip key={i}>{node}</Chip>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-nowrap text-xs font-medium text-slate-400">
                        Ending in
                      </p>
                      <p>{formatDistanceToNowStrict(contest.endsAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-left text-sm font-normal leading-snug text-slate-300">
                      {contest.shortDescription}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="mt-4 text-center text-slate-400">
              No ongoing contests
            </p>
          )}
        </div>
      </section>
      <section className="mb-16">
        <h2>Upcoming Contests</h2>
        <div>
          {upcomingContests.length ? (
            upcomingContests.map((contest) => (
              <Link href={`contests/${contest.id}`} key={contest.id}>
                <div className="mt-4 rounded-lg border border-[#353a3e] bg-[#272a2e] px-4 py-4 transition-colors hover:bg-[#272a2e8f]">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="text-left text-xl font-medium">
                        {contest.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          <>
                            <SvgCalendar />{" "}
                            <TimeFormatted
                              time={contest.startsAt}
                              format="dd/MM/yy hh:mm a"
                            />
                          </>,
                          <>
                            <SvgTimer />{" "}
                            {formatDistanceStrict(
                              contest.endsAt,
                              contest.startsAt,
                            )}
                          </>,
                          ...(contest.unranked ? ["Unranked"] : []),
                        ].map((node, i) => (
                          <Chip key={i}>{node}</Chip>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-nowrap text-xs font-medium text-slate-400">
                        Starts in
                      </p>
                      <p>{formatDistanceToNowStrict(contest.startsAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-left text-sm font-normal leading-snug text-slate-300">
                      {contest.shortDescription}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="mt-4 text-center text-slate-400">
              No upcoming contests
            </p>
          )}
        </div>
      </section>
      <section className="mb-16">
        <h2>Past Contests</h2>
        <div>
          {pastContests.length ? (
            pastContests.map((contest) => (
              <Link href={`contests/${contest.id}`} key={contest.id}>
                <div className="mt-4 rounded-lg border border-[#353a3e] bg-[#272a2e] px-4 py-4 transition-colors hover:bg-[#272a2e8f]">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="text-left text-xl font-medium">
                        {contest.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          <>
                            <SvgCalendar />{" "}
                            <TimeFormatted
                              time={contest.startsAt}
                              format="dd/MM/yy hh:mm a"
                            />
                          </>,
                          <>
                            <SvgTimer />{" "}
                            {formatDistanceStrict(
                              contest.endsAt,
                              contest.startsAt,
                            )}
                          </>,
                          ...(contest.unranked ? ["Unranked"] : []),
                        ].map((node, i) => (
                          <Chip key={i}>{node}</Chip>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-nowrap text-xs font-medium text-slate-400">
                        Ended
                      </p>
                      <p>
                        {formatDistanceToNow(contest.endsAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-left text-sm font-normal leading-snug text-slate-300">
                      {contest.shortDescription}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="mt-4 text-center text-slate-400">No past contests</p>
          )}
        </div>
      </section>
    </div>
  );
}
