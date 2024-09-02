"use client";

import { SvgMoveOut } from "@/assets/icons";
import { leaveTeam } from "@/services/team";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { useRouter } from "next/navigation";

export function LeaveTeamButton() {
  const router = useRouter();

  const { execute, loading } = useAction(async () => {
    const res = await leaveTeam();
    if (res?.error) return res;
    router.refresh();
  });

  return (
    <Button
      variant="ghost"
      className="w-full"
      onClick={() => execute(null)}
      loading={loading}
    >
      Leave Team <SvgMoveOut />
    </Button>
  );
}
