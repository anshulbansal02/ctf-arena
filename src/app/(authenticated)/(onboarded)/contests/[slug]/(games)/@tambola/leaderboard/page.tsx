import { LastDrawnItem } from "../components/LastDrawnItem";
import { Announcements } from "./components/Announcements";
import { ClaimLeaderboard } from "./components/ClaimLeaderboard";
import { RankLeaderboard } from "./components/RankLeaderboard";

export default function LeaderboardPage({
  params,
}: {
  params: { slug: number };
}) {
  return (
    <section className="mt-24 flex flex-col items-center px-4 md:px-12">
      <div className="flex flex-col items-center">
        <h4 className="">Last Drawn</h4>
        <LastDrawnItem contestId={params.slug} />
      </div>

      <div className="mt-4">
        <Announcements contestId={params.slug} />
      </div>

      <section className="mt-8 grid w-full grid-cols-2 gap-8">
        <RankLeaderboard contestId={params.slug} />
        <ClaimLeaderboard contestId={params.slug} />
      </section>
    </section>
  );
}
