import { eventChannel } from "@/services/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PING_INTERVAL = 30_000; // 30 seconds

export async function GET(request: Request): Promise<Response> {
  const responseStream = new TransformStream();
  const encoder = new TextEncoder();
  const writer = responseStream.writable.getWriter();

  const sendEvent = (event: string, data: unknown) => {
    try {
      writer.write(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
      );
    } catch (error) {
      console.error("Error sending event:", error);
    }
  };

  const eventsParam = new URL(request.url).searchParams.get("events") ?? "";
  const subscribedEvents = new Set<string>(eventsParam.split(","));

  function allChannelsListener(message: unknown, channel?: string) {
    if (channel && subscribedEvents.has(channel)) sendEvent(channel, message);
  }
  eventChannel.subscribe("arena:*", allChannelsListener);

  // Ping client to keep alive
  const pingInterval = setInterval(() => {
    sendEvent("ping", {});
  }, PING_INTERVAL);

  request.signal.addEventListener("abort", () => {
    clearInterval(pingInterval);
    eventChannel.unsubscribe("arena:*", allChannelsListener);
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
