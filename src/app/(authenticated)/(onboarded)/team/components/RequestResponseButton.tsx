"use client";

import { respondToTeamRequest } from "@/services/team";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { useRouter } from "next/navigation";

export function RequestResponseButton(props: {
  requestId: number;
  action: "accept" | "reject";
}) {
  const router = useRouter();

  const { execute: respond, loading } = useAction(async () => {
    const res = await respondToTeamRequest(props.requestId, props.action);
    if (res?.error) return res;
    router.refresh();
  });

  return (
    <Button
      variant={props.action === "reject" ? "outlined" : "primary"}
      onClick={respond}
      loading={loading}
    >
      {props.action === "accept" ? "Accept" : "Ignore"}
    </Button>
  );
}
