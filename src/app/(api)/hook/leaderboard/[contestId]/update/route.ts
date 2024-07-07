import { cache } from "@/services/cache";
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

  const send = (data: any) => {
    writer.write(encoder.encode(`data: ${data}\n\n`));
  };

  const contestId = +params.contestId;
  if (isNaN(contestId)) throw new Error("Invalid contest id");

  const leaderboardListener = async () => {
    const updatedLeaderboard = await leaderboard.getByName(type, contestId);
    send(updatedLeaderboard);
  };

  cache.subscribe(
    leaderboard.leaderboardUpdateChannel(type, contestId),
    leaderboardListener,
  );

  request.signal.addEventListener("abort", () => {
    cache.unsubscribe(
      leaderboard.leaderboardUpdateChannel(type, contestId),
      leaderboardListener,
    );

    writer.close();
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
