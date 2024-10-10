import { getHandlers } from "@/services/auth";
import { NextRequest } from "next/server";
const { GET: GET_, POST } = await getHandlers();

export const GET = (req: NextRequest) => {
  console.log("HERE WE ARE WHERE WE SHOULDN'T BE");
  req.headers.forEach((val, key) => {
    console.log(`HEADER: ${key}=${val}`);
  });
  return GET_(req);
};

export { POST };
