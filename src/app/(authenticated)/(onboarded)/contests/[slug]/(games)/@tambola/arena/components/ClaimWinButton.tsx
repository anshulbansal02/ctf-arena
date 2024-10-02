import { checkAndClaimWin, TicketItem } from "@/services/contest/games/tambola";
import { Button } from "@/shared/components";
import { useAction, useToaster } from "@/shared/hooks";

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
  const toaster = useToaster();

  const {
    execute: claimWin,
    loading,
    data,
  } = useAction(async (pattern: string) => {
    const isValid = await checkAndClaimWin(
      props.contestId,
      pattern,
      props.markedItems,
    );
    if (typeof isValid === "object" && "error" in isValid) return isValid;

    if (!isValid) {
      toaster.error("Not correct");
    }
  });

  return (
    <Button onClick={() => claimWin(props.pattern.name)} loading={loading}>
      {props.pattern.title} &#8212; x{props.pattern.claimsLeft}
    </Button>
  );
}
