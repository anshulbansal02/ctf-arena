import { SearchTeam } from "./SearchTeam";
import { getAuthUser } from "@/services/auth";
import { getTeamIdByUserId } from "@/services/team";
import { redirect } from "next/navigation";

export default async function SearchTeamPage() {
  const isUserInTeam = await getTeamIdByUserId((await getAuthUser()).id);

  if (isUserInTeam) redirect("/team");

  return (
    <main className="flex min-h-screen flex-col items-center">
      <section className="max-w-[480px] px-4">
        <SearchTeam />
      </section>
    </main>
  );
}
