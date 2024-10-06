import { SvgCalendar, SvgTimer } from "@/assets/icons";
import { getContests } from "@/services/contest";
import { TimeFormatted } from "@/shared/components";
import {
  format,
  formatDistanceStrict,
  formatDistanceToNowStrict,
} from "date-fns";
import Link from "next/link";

function Chip(props: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-lg bg-slate-700 px-2 py-[6px] text-sm font-medium leading-none">
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
    <section className="mb-32 mt-16 w-[560px]">
      <h2 className="mb-8 text-2xl">Contests</h2>
      <div className="mb-12">
        <h4 className="mt-4 text-left font-medium text-slate-400">Ongoing</h4>
        {activeContests.length ? (
          activeContests.map((contest) => (
            <Link href={`contests/${contest.id}`} key={contest.id}>
              <div className="contest-card mt-4 flex items-center justify-between gap-8 rounded-lg bg-[#282D31] px-6 py-4 transition-colors hover:bg-[#424a51]">
                <div className="text-left">
                  <h3 className="text-xl font-medium">{contest.name}</h3>

                  <div className="mt-2 flex gap-2">
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
                  <p className="mt-2 text-sm font-light leading-snug text-slate-300">
                    {contest.shortDescription}
                  </p>
                </div>
                <div className="whitespace-nowrap">
                  <p className="font-medium">Ends In</p>
                  <p>{formatDistanceToNowStrict(contest.endsAt)}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="mt-4 text-slate-400">
            No active contests going on.<br></br> Checkout the upcoming
            contests.
          </p>
        )}
      </div>

      <h4 className="mt-4 text-left font-medium text-slate-400">Upcoming</h4>
      {upcomingContests.length ? (
        upcomingContests.map((contest) => (
          <Link href={`contests/${contest.id}`} key={contest.id}>
            <div
              key={contest.id}
              className="contest-card mt-4 flex items-center justify-between gap-8 rounded-lg bg-[#282D31] px-6 py-4 transition-colors hover:bg-[#424a51]"
            >
              <div className="text-left">
                <h3 className="text-xl font-medium">{contest.name}</h3>

                <div className="mt-2 flex gap-2">
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

                <p className="mt-2 text-sm font-light leading-snug text-slate-300">
                  {contest.shortDescription}
                </p>
              </div>
              <div className="whitespace-nowrap">
                <p className="font-medium">Starts In</p>
                <p>{formatDistanceToNowStrict(contest.startsAt)}</p>
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
