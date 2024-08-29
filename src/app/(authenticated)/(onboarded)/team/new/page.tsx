"use client";

import { CreateTeamStep } from "@/app/(authenticated)/components/CreateTeam";
import { useRouter } from "next/navigation";

export default async function NewTeamPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center">
      <section className="max-w-[480px] px-4">
        <CreateTeamStep onBack={router.back} onNext={() => router.push("/team")} />
      </section>
    </main>
  );
}
