import { getContest, isParticipantRegistered } from "@/services/contest";
import { redirect } from "next/navigation";

export default async function Layout(
  gameArena: Record<string, React.ReactNode>,
) {
  const [contest, isUserParticipating] = await Promise.all([
    getContest(params.slug),
    isParticipantRegistered(params.slug),
  ]);

  let redirectPath;
  if (!contest) redirectPath = "/";
  else if (contest.startsAt > new Date() || !isUserParticipating)
    redirectPath = `/contests/${contest.id}`;
  else if (contest.endsAt < new Date())
    redirectPath = `/contests/${contest.id}/leaderboard`;

  if (redirectPath) return redirect(redirectPath);

  return gameArena[contest.game];
}
