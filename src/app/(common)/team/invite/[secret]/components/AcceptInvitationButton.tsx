"use client";

import { SvgEmailCheck } from "@/assets/icons";
import { respondToTeamRequest } from "@/services/team";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { useRouter } from "next/navigation";

export function AcceptInvitationButton(props: { inviteId: number }) {
  const router = useRouter();

  const { execute: accept, loading } = useAction(async () => {
    const res = await respondToTeamRequest(props.inviteId, "accept");
    if (res?.error) return res;
    router.replace("/team");
  });

  return (
    <Button onClick={() => accept(null)} loading={loading}>
      <SvgEmailCheck fill="#000" /> Accept Invitation
    </Button>
  );
}
