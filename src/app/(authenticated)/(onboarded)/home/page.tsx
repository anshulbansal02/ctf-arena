import { getAuthUser } from "@/services/auth";
import { TeamCard } from "./components/TeamCard";
import { Contests } from "./components/Contests";

export default async function HomePage() {
  const user = await getAuthUser();

  return (
    <section className="mb-32 flex flex-col items-center px-4 text-center">
      <section className="mt-12 w-full max-w-[420px]">
        <h2 className="text-2xl">My Team</h2>
        <TeamCard userId={user.id} />
      </section>

      <Contests />
    </section>
  );
}
