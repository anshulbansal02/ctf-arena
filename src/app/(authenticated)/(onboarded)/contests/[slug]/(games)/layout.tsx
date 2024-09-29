import { getContest } from "@/services/contest";

export default async function GameLayout({
  params,
  children,
  ...game
}: {
  [key: string]: React.ReactElement;
} & { params: { slug: number } }) {
  const contest = await getContest(params.slug);

  const Game = game[contest.game];
  return Game;
}
