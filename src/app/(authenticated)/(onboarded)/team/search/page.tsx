"use client";
import { JoinTeamStep } from "@/app/(authenticated)/components/JoinTeam";
import { useRouter } from "next/navigation";

export default async function SearchTeamPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center">
      <section className="max-w-[480px] px-4">
        <JoinTeamStep
          onBack={router.back}
          onNext={() => router.push("/team")}
        />
      </section>
    </main>
  );
}
