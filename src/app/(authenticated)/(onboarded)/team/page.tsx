import { getAuthUser } from "@/services/auth";
import { getTeamDetailsByUserId } from "@/services/team";
import { Button } from "@/shared/components";

export default async function TeamPage() {
  const user = await getAuthUser();
  const team = await getTeamDetailsByUserId(user.id);

  return (
    <section className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center">
      <h2 className="mt-8 text-center text-2xl">My Team</h2>

      <div className="empty-state text-center">
        <p className="mt-4 text-slate-400">You are not in a team yet</p>
        <div className="mt-8 flex items-center gap-2">
          <Button variant="outlined">Join A Team</Button>
          <p>Or</p>
          <Button variant="outlined">Create Your Team</Button>
        </div>
      </div>
    </section>
  );
}
