"use client";

import { CreateTeamStep } from "@/app/(authenticated)/components/CreateTeam";
import { useRouter } from "next/navigation";

export function CreateTeam() {
  const router = useRouter();

  return (
    <CreateTeamStep onBack={router.back} onNext={() => router.push("/team")} />
  );
}
