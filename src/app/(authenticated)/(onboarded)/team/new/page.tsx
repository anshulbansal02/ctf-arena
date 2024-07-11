"use client";
import { CreateTeamStep } from "@/app/(authenticated)/components/CreateTeam";

export default async function NewTeamPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <section className="max-w-[480px] px-4">
        <CreateTeamStep onBack={() => {}} onNext={() => {}} />
      </section>
    </main>
  );
}
