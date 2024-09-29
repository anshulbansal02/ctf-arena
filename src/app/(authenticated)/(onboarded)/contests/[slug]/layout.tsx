import { getContest, isParticipantRegistered } from "@/services/contest";
import { redirect } from "next/navigation";

export default async function GameLayout(
  game: Record<string, React.ReactNode>,
  params: { slug: number },
) {
  const [contest, isRegistered] = await Promise.all([
    getContest(params.slug),
    isParticipantRegistered(params.slug),
  ]);

  let redirectPath;
  if (!contest) redirectPath = "/";
  else if (contest.startsAt > new Date() || !isRegistered)
    redirectPath = `/contests/${contest.id}`;
  else if (contest.endsAt < new Date())
    redirectPath = `/contests/${contest.id}/leaderboard`;

  if (redirectPath) return redirect(redirectPath);

  const Game = game[contest.game];

  return <Game contest={contest} />;
}
