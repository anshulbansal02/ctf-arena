"use client";
import { SvgDrawItem } from "@/assets/icons";
import { drawItem } from "@/services/contest/games/tambola";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";

export function DrawItemButton(props: { contestId: number }) {
  const action = useAction(drawItem);

  return (
    <Button
      loading={action.loading}
      onClick={() => action.execute(props.contestId)}
    >
      <SvgDrawItem fill="currentColor" /> Draw Item
    </Button>
  );
}
