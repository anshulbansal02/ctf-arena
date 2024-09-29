import {
  getNextContestChallenge,
  TicketItem,
} from "@/services/contest/games/tambola";
import { useAction } from "@/shared/hooks";
import { useState } from "react";
import { TambolaTicket } from "../components/TambolaTicket";
import { ClaimWinButton } from "../components/ClaimWinButton";

interface TambolaArenaProps {
  contest: {
    id: number;
    isUnranked: boolean | null;
    endsAt: Date;
    noOfChallenges: number;
  };
}

export default function TambolaArena(props: TambolaArenaProps) {
  const [markedItems, setMarkedItems] = useState<TicketItem[]>([]);

  const {
    execute: getNextChallenge,
    loading: loadingNextChallenge,
    data: nextChallenge,
  } = useAction(getNextContestChallenge, {
    immediate: true,
    args: props.contest.id,
  });

  function toggleItem(item: TicketItem) {
    setMarkedItems((items) => {
      if (items.includes(item)) return items.filter((t) => t !== item);
      return [...items, item];
    });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <div>
        Current Drawn Number
        <span></span>
      </div>

      <TambolaTicket
        lockedItems={[]}
        markedItems={[]}
        ticket={[]}
        toggleItem={toggleItem}
      />

      <div className="mt-16">
        <ul className="flex items-center gap-4">
          {nextChallenge.winningRules.map((rule) => (
            <li key={rule.id}>
              <ClaimWinButton
                contestId={props.contest.id}
                markedItems={markedItems}
                rule={rule}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
