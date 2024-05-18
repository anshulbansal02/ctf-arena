export async function POST(request: Request) {
  const body = (await request.json()) as {
    record: { id: number };
  };

  console.log(request.headers);

  console.log(body);

  return Response.json("Ok", { status: 200 });
}
