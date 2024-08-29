import { Header } from "../../components/Header";
import { getAuthUser } from "@/services/auth";
import { TeamCard } from "./components/TeamCard";
import { Contests } from "./components/Contests";

export default async function HomePage() {
  const user = await getAuthUser();

  return (
    <div>
      <Header className="fixed top-0 z-10" />
      <main className="mt-[80px] flex min-h-screen min-w-[420px] flex-col items-center px-4 text-center">
        <section className="mt-12 flex w-[420px] flex-col items-center">
          <h2 className="text-2xl">My Team</h2>
          <TeamCard userId={user.id} />
        </section>

        <Contests />
      </main>
    </div>
  );
}
