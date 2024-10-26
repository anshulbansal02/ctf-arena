import { getAuthUser } from "@/services/auth";
import { getTeamIdByUserId } from "@/services/team";
import { CreateTeam } from "./CreateTeam";
import { redirect } from "next/navigation";

export default async function NewTeamPage() {
  const isUserInTeam = await getTeamIdByUserId((await getAuthUser()).id);

  if (isUserInTeam) redirect("/team");

  return (
    <section className="flex min-h-screen flex-col items-center px-4">
      <div className="w-full max-w-[420px]">
        <CreateTeam />
      </div>
    </section>
  );
}
