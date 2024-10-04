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
  onSuccessfulClaim: (claimedItems: TicketItem[]) => void;
}) {
  const toaster = useToaster();

  const { execute: claimWin, loading } = useAction(async (pattern: string) => {
    const result = await checkAndClaimWin(
      props.contestId,
      pattern,
      props.markedItems,
    );
    if ("error" in result) return result;

    if (!result.isValid) {
      toaster.error(
        `Your claim to win ${props.pattern.title} is not valid. Please try again later.`,
      );
    } else {
      toaster.success({
        title: "Win Claimed!",
        content: `Yay! You have claimed your win for ${props.pattern.title}. Let's go for other wins.`,
        timeout: 5000,
      });
      // Trigger fireworks
      props.onSuccessfulClaim(result.claimedItems);
    }
  });

  return (
    <Button onClick={() => claimWin(props.pattern.name)} loading={loading}>
      {props.pattern.title}{" "}
      <span className="rounded-md bg-slate-300 px-2 py-1 pt-[5px] text-sm font-medium leading-none">
        {props.pattern.claimsLeft} left
      </span>
    </Button>
  );
}
