import { getAuthUser } from "@/services/auth";
import { redirect } from "next/navigation";
import { CreateContest } from "./CreateContest";

export default async function AdminPage() {
  const user = await getAuthUser();

  if (!user.roles.includes("admin")) redirect("/");

  return (
    <main className="flex min-h-lvh flex-col items-center px-4 py-10">
      <CreateContest />
    </main>
  );
}
