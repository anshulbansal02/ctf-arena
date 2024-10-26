import { SvgCalendar, SvgTimer } from "@/assets/icons";
import { getContests } from "@/services/contest";
import { TimeFormatted } from "@/shared/components";
import { formatDistanceStrict, formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";

function Chip(props: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-nowrap rounded-lg bg-[#353a3e] px-2 py-[6px] text-sm font-medium leading-none shadow-sm">
      {props.children}
    </p>
  );
}

export async function Contests() {
  const [activeContests, upcomingContests] = await Promise.all([
    getContests("active"),
    getContests("upcoming"),
  ]);

  return (
    <section className="mt-16 max-w-[560px]">
      <h2 className="mb-8 text-2xl">Contests</h2>
      <div className="mb-12">
        <h4 className="mt-4 text-left font-medium text-slate-400">Ongoing</h4>
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
                      Ends In
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
          <p className="mt-8 text-slate-400">
            No active contests going on.<br></br> Checkout the upcoming
            contests.
          </p>
        )}
      </div>

      <h4 className="mt-4 text-left font-medium text-slate-400">Upcoming</h4>
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
                        {formatDistanceStrict(contest.endsAt, contest.startsAt)}
                      </>,
                      ...(contest.unranked ? ["Unranked"] : []),
                    ].map((node, i) => (
                      <Chip key={i}>{node}</Chip>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-nowrap text-xs font-medium text-slate-400">
                    Starts In
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
        <p className="mt-8 text-slate-400">No upcoming contests</p>
      )}
    </section>
  );
}
