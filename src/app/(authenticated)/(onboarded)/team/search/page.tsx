"use client";
import { JoinTeamStep } from "@/app/(authenticated)/components/JoinTeam";

export default async function SearchTeamPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <section className="max-w-[480px] px-4">
        <JoinTeamStep onBack={() => {}} onNext={() => {}} />
      </section>
    </main>
  );
}
