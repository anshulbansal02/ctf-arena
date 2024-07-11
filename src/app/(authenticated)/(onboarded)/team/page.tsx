import { getAuthUser } from "@/services/auth";
import { TeamCard } from "../home/components/TeamCard";

export default async function TeamPage() {
  const user = await getAuthUser();

  return (
    <section className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center">
      <section className="mt-8 flex w-[420px] flex-col items-center">
        <h2 className="text-2xl">My Team</h2>
        <TeamCard userId={user.id} />
      </section>

      <section className="mt-8 flex w-[420px] flex-col items-center">
        <h2 className="text-2xl">Team Invites Sent</h2>
      </section>
    </section>
  );
}
