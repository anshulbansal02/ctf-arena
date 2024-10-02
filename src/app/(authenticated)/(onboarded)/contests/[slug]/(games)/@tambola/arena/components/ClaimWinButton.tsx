import { checkAndClaimWin, TicketItem } from "@/services/contest/games/tambola";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";

export function ClaimWinButton(props: {
  markedItems: TicketItem[];
  contestId: number;
  pattern: {
    name: string;
    title: string;
    totalClaims: number;
    claimsLeft: number;
    points: number;
  };
}) {
  const { execute: claimWin, loading } = useAction(async (pattern: string) => {
    checkAndClaimWin(props.contestId, pattern, props.markedItems);
  });

  return (
    <Button onClick={() => claimWin(props.pattern.name)} loading={loading}>
      {props.pattern.title} &#8212; x{props.pattern.claimsLeft}
    </Button>
  );
}
