import { Avatar } from "@/shared/components";
import { Header } from "../components";

export default async function Dashboard() {
  const members = [
    { id: 1, name: "Prohaska", isLeader: true },
    { id: 2, name: "Raul Frami" },
    { id: 3, name: "Harry Sporer" },
    { id: 4, name: "Hugh Mueller" },
  ];

  return (
    <div>
      <Header className="fixed top-0" />
      <main className="mt-[80px] flex min-h-screen min-w-[420px] flex-col items-center px-4 text-center">
        <section className="mt-8 w-[420px]">
          <h2 className="text-2xl">Your Team</h2>
          <div className="team-card mt-4 rounded-lg bg-black px-6 py-4">
            <div className="flex flex-col">
              <div className="text-left">
                <h4 className="font-medium leading-tight text-slate-400">
                  Name
                </h4>
                <h3 className="text-lg">Moroccan Dirham</h3>
              </div>
              <div className="mt-3 text-left">
                <h4 className="font-medium leading-tight text-slate-400">
                  Members
                </h4>
                <ul className="mt-2 flex flex-wrap gap-4 gap-y-2">
                  {members.map((member) => (
                    <li className="flex items-center gap-2">
                      <Avatar username={member.id.toString()} size={20} />
                      <p>
                        {member.name}{" "}
                        {member.isLeader && (
                          <span className="text-sm font-medium text-slate-400">
                            &#123;Leader&#125;
                          </span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* <div className="empty-state">
            <p className="mt-4 text-slate-400">You are not in a team yet</p>
            <div className="mt-8 flex items-center gap-2">
              <Button variant="outlined">Join A Team</Button>
              <p>Or</p>
              <Button variant="outlined">Create Your Team</Button>
            </div>
          </div> */}
        </section>

        <section className="mt-16 w-[560px]">
          <h2 className="text-2xl">Contests</h2>
          <h4 className="mt-4 text-left font-medium text-slate-400">Active</h4>
          <p className="mt-4 text-slate-400">
            No active contests going on.<br></br> Checkout the upcoming
            contests.
          </p>
          <div></div>

          <h4 className="mt-4 text-left font-medium text-slate-400">
            Upcoming
          </h4>
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
      </main>
    </div>
  );
}
