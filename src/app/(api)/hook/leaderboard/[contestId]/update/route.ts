import { cache } from "@/services/cache";

export const runtime = "nodejs";
// This is required to enable streaming
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { contestId: string } },
) {
  const responseStream = new TransformStream();
  const encoder = new TextEncoder();

  const writer = responseStream.writable.getWriter();

  writer.write(
    encoder.encode(`data: You are on contest id ${params.contestId}\n\n`),
  );

  cache.subscribe("", (m, c) => {});

  const interval = setInterval(() => {
    writer.write(encoder.encode("data: Some raw string\n\n"));
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);
    writer.close();
  }, 10000);

  request.signal.addEventListener("abort", () => {
    clearInterval(interval);
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
