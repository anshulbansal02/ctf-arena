import { eventChannel } from "@/services/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const responseStream = new TransformStream();
  const encoder = new TextEncoder();
  const writer = responseStream.writable.getWriter();

  const sendEvent = (event: string, data: unknown) => {
    writer.write(
      encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
    );
  };

  const eventNames = new URL(request.url).searchParams
    .get("events")
    ?.split(",");
  const subscribedEvents = new Set<string>(eventNames);

  function allChannelsListener(message: unknown, channel?: string) {
    if (channel && subscribedEvents.has(channel)) sendEvent(channel, message);
  }
  eventChannel.subscribe("*", allChannelsListener);

  request.signal.addEventListener("abort", () => {
    eventChannel.unsubscribe("*", allChannelsListener);
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
