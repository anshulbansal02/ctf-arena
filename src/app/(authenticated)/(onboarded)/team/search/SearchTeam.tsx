"use client";
import { JoinTeamStep } from "@/app/(authenticated)/components/JoinTeam";
import { useRouter } from "next/navigation";

export function SearchTeam() {
  const router = useRouter();

  return (
    <JoinTeamStep onBack={router.back} onNext={() => router.push("/team")} />
  );
}
