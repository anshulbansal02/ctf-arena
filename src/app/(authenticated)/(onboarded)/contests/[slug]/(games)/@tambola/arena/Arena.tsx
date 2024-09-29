"use client";
import {
  getNextContestChallenge,
  TicketItem,
} from "@/services/contest/games/tambola";
import { useAction, useServerEvent, useToaster } from "@/shared/hooks";
import { TambolaTicket } from "./components/TambolaTicket";
import { ClaimWinButton } from "./components/ClaimWinButton";
import usePersistedState from "@/shared/hooks/usePersistedState";
import { useState } from "react";
import { Tooltip } from "@/shared/components";

interface TambolaArenaProps {
  contest: {
    id: number;
    isUnranked: boolean | null;
    endsAt: Date;
    noOfChallenges: number;
  };
}

export function TambolaArena(props: TambolaArenaProps) {
  const toaster = useToaster();

  const {
    execute: getNextChallenge,
    loading: loadingNextChallenge,
    data: nextChallenge,
  } = useAction(getNextContestChallenge, {
    immediate: true,
    args: props.contest.id,
  });

  const [lastDrawn, setLastDrawn] = useState<TicketItem>(41);

  const [markedItems, setMarkedItems] = usePersistedState<TicketItem[]>(
    `contest:${props.contest.id}:challenge:${nextChallenge?.id}:ticket:markedItems`,
    [],
    { noPersist: !nextChallenge },
  );

  useServerEvent<TicketItem>(
    "item-drawn",
    (drawnItem) => {
      setLastDrawn(drawnItem);
    },
    { contestId: props.contest.id },
  );

  useServerEvent(
    "next-challenge-started",
    () => {
      getNextChallenge(props.contest.id);
    },
    { contestId: props.contest.id },
  );

  useServerEvent<{ name: string; title: string; winLeft: number }>(
    "win-claimed",
    (data) => {
      toaster.info({
        title: `${data.title} Win Claimed`,
        content: `A user claimed win for pattern "${data.title}. ${data.winLeft} wins are left for the rule."`,
      });
    },
    { contestId: props.contest.id },
  );

  function toggleItem(item: TicketItem) {
    setMarkedItems((items) => {
      if (items.includes(item)) return items.filter((t) => t !== item);
      return [...items, item];
    });
  }

  const winningRules = [
    {
      id: 1,
      name: "full_house",
      title: "Full House",
      winsLeft: 3,
    },
    {
      id: 2,
      name: "top_line",
      title: "Top Line",
      winsLeft: 2,
    },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      {nextChallenge ? (
        <div>
          <div className="mt-8 text-center">
            <h4 className="text-slate-400">Last Drawn</h4>
            <h3 className="mt-4 text-3xl font-medium">{lastDrawn}</h3>
          </div>

          <div className="mt-16">
            <TambolaTicket
              claimedItems={nextChallenge.claimedItems}
              markedItems={markedItems}
              ticket={nextChallenge.ticket}
              toggleItem={toggleItem}
            />
          </div>

          <div className="mt-16 text-center">
            <h4 className="text-xl">Claim Win</h4>
            <p className="text-sm text-slate-300">
              If you see a pattern in making, quickly claim your win before
              someone else does.
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-6">
              {winningRules.map((rule) => (
                <li key={rule.id}>
                  <Tooltip text="Lorem ipsum dolor sit amet">
                    <ClaimWinButton
                      contestId={props.contest.id}
                      markedItems={markedItems}
                      rule={rule}
                    />
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
