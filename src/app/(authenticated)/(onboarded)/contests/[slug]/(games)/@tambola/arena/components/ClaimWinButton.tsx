import { checkAndClaimWin, TicketItem } from "@/services/contest/games/tambola";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";

export function ClaimWinButton(props: {
  markedItems: TicketItem[];
  contestId: number;
  rule: {
    name: string;
    title: string;
    winsLeft: number;
  };
}) {
  const { execute: claimWin, loading } = useAction(async (pattern: string) => {
    checkAndClaimWin(props.contestId, pattern, props.markedItems);
  });

  return (
    <Button onClick={() => claimWin(props.rule.name)} loading={loading}>
      {props.rule.title} &#8212; x{props.rule.winsLeft}
    </Button>
  );
}
