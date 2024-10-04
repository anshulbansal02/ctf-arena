import { getContest } from "@/services/contest";
import { redirect } from "next/navigation";

export default async function GameLayout({
  params,
  children,
  ...game
}: {
  [key: string]: React.ReactElement;
} & { params: { slug: number } }) {
  const contest = await getContest(params.slug);

  if (!contest) return redirect("/");

  const Game = game[contest.game];
  return Game;
}
