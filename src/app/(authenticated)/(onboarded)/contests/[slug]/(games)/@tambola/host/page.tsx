import { getAuthUser } from "@/services/auth";
import { redirect } from "next/navigation";
import { DrawItemButton } from "./components/DrawItemButton";
import { getContest } from "@/services/contest";

export async function HostPage({ params }: { params: { slug: number } }) {
  const user = await getAuthUser();
  if (!user.roles.includes("host")) redirect("/");
  const contest = await getContest(params.slug);

  return (
    <div>
      Show Host Specific Controls and Information
      <span>Marked Numbers</span>
      <span>Current Draw</span>
      <DrawItemButton contestId={contest.id} />
      <span>Wins Left</span>
    </div>
  );
}
