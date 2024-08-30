import { subCache } from "@/services/cache";
import * as leaderboard from "@/services/contest/leaderboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { contestId: string } },
) {
  const responseStream = new TransformStream();
  const encoder = new TextEncoder();
  const writer = responseStream.writable.getWriter();

  const type = new URL(request.url).searchParams.get(
    "type",
  ) as leaderboard.Leaderboard;

  const send = (event: string, data: unknown) => {
    writer.write(
      encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
    );
  };

  const contestId = +params.contestId;
  if (isNaN(contestId)) throw new Error("Invalid contest id");

  const leaderboardListener = async () => {
    const updatedLeaderboard = await leaderboard.getLeaderboardByName(
      type,
      contestId,
    );
    send("leaderboard_update", updatedLeaderboard);
  };

  subCache.subscribe(
    leaderboard.leaderboardUpdateChannel(type, contestId),
    leaderboardListener,
  );

  request.signal.addEventListener("abort", () => {
    subCache.unsubscribe(
      leaderboard.leaderboardUpdateChannel(type, contestId),
      leaderboardListener,
    );

    writer.close();
  });

  // Send initially
  setImmediate(async () => {
    const leaderboardData = await leaderboard.getLeaderboardByName(
      type,
      contestId,
    );
    console.log(type, leaderboardData);
    send("leaderboard_update", leaderboardData);
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
