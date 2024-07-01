import { db } from "@/services/db";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    record: { id: number };
  };
  

  return Response.json(null, { status: 200 });
}
