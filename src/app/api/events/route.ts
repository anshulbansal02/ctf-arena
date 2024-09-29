export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Record<string, string | number> },
) {
  const responseStream = new TransformStream();
  const encoder = new TextEncoder();
  const writer = responseStream.writable.getWriter();

  const sendEvent = (event: string, data: unknown) => {
    writer.write(
      encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
    );
  };

  // Cleanup
  request.signal.addEventListener("abort", () => {
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
