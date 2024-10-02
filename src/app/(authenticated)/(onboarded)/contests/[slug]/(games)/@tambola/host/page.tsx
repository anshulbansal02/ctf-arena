import { getAuthUser } from "@/services/auth";
import { redirect } from "next/navigation";
import { DrawItemButton } from "./components/DrawItemButton";
import { getContest } from "@/services/contest";
import { GameState } from "./components/GameState";

export default async function HostPage({
  params,
}: {
  params: { slug: number };
}) {
  // const user = await getAuthUser();
  // if (!user.roles.includes("host")) redirect("/");
  const contest = await getContest(params.slug);

  return (
    <div>
      <GameState contestId={contest.id} />
    </div>
  );
}
