import { FireworksStage } from "@/shared/components";
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
    <section className="mt-28 flex flex-col items-center px-4 md:px-12">
      <FireworksStage name="tambola" auto />

      <div className="flex flex-col items-center">
        <h4 className="">Last Drawn</h4>
        <LastDrawnItem contestId={params.slug} />
      </div>

      <div className="mt-4 w-[480px]">
        <Announcements contestId={params.slug} />
      </div>

      <section className="mt-16 grid w-full grid-cols-1 gap-16 lg:grid-cols-2">
        <RankLeaderboard contestId={params.slug} />
        <ClaimLeaderboard contestId={params.slug} />
      </section>
    </section>
  );
}
