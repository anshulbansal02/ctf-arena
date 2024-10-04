import { getContest, isParticipantRegistered } from "@/services/contest";
import { TambolaArena } from "./Arena";
import { redirect } from "next/navigation";

export default async function ArenaPage({
  params,
}: {
  params: { slug: number };
}) {
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

  return <TambolaArena contest={contest} />;
}
