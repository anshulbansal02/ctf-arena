import { getContests } from "@/services/contest";

export async function Contests() {
  const [activeContests, upcomingContests] = await Promise.all([
    getContests("active"),
    getContests("upcoming"),
  ]);

  return (
    <section className="mt-16 w-[560px]">
      <h2 className="text-2xl">Contests</h2>
      <h4 className="mt-4 text-left font-medium text-slate-400">Active</h4>
      <p className="mt-4 text-slate-400">
        No active contests going on.<br></br> Checkout the upcoming contests.
      </p>
      <div></div>

      <h4 className="mt-4 text-left font-medium text-slate-400">Upcoming</h4>
      <div className="contest-card mt-4 flex items-center justify-between gap-4 rounded-lg bg-[#282D31] px-6 py-4">
        <div className="text-left">
          <h3 className="text-xl font-medium">CTF Challenge 1.0</h3>
          <p className="mt-2 leading-snug">
            An exciting multilevel Capture The Flag contest to show your
            technical skills
          </p>
        </div>
        <div className="whitespace-nowrap">
          <p className="font-medium">Starts In</p>
          <p>03:24 Hr</p>
        </div>
      </div>
      {/* <div className="empty-state">
    <p className="mt-4 text-slate-400">
      No upcoming or active contests
    </p>
  </div> */}
    </section>
  );
}
