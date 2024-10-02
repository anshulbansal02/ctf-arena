"use client";
import {
  getNextContestChallenge,
  getUserChallenge,
  getWinsClaimedForChallenge,
  TicketItem,
} from "@/services/contest/games/tambola";
import { useAction, useServerEvent, useToaster } from "@/shared/hooks";
import { TambolaTicket } from "./components/TambolaTicket";
import { ClaimWinButton } from "./components/ClaimWinButton";
import usePersistedState from "@/shared/hooks/usePersistedState";
import contestEvents from "@/services/contest/events";
import { LastDrawnItem } from "../components/LastDrawnItem";

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
  } = useAction(
    async () => {
      const challenge = await getNextContestChallenge(props.contest.id);
      const [userChallenge, winsClaimed] = await Promise.all([
        getUserChallenge(props.contest.id, challenge.id),
        getWinsClaimedForChallenge(props.contest.id, challenge.id),
      ]);

      const winningPatterns = challenge.config.winningPatterns.map((p) => ({
        ...p,
        claimsLeft: p.totalClaims - (winsClaimed[p.name] ?? 0),
      }));

      return { ...challenge, winningPatterns, user: userChallenge };
    },
    {
      immediate: true,
      args: [],
    },
  );

  const [markedItems, setMarkedItems] = usePersistedState<TicketItem[]>(
    `contest:${props.contest.id}:challenge:${nextChallenge?.id}:ticket:markedItems`,
    [],
    { noPersist: !nextChallenge },
  );

  useServerEvent(
    contestEvents.game(props.contest.id, "next_challenge_started"),
    () => {
      getNextChallenge();
    },
  );

  useServerEvent<{ name: string; title: string; winLeft: number }>(
    contestEvents.game(props.contest.id, "win_claimed"),
    (data) => {
      toaster.info({
        title: `${data.title} Win Claimed`,
        content: `A user claimed win for pattern "${data.title}. ${data.winLeft} wins are left for the rule."`,
      });
    },
  );

  function toggleItem(item: TicketItem) {
    setMarkedItems((items) => {
      if (items.includes(item)) return items.filter((t) => t !== item);
      return [...items, item];
    });
  }

  return (
    <div className="mx-auto mb-20 flex min-h-screen max-w-[600px] flex-col items-center">
      {nextChallenge ? (
        <div>
          <div className="mt-8 text-center">
            <h4 className="text-slate-400">Last Drawn</h4>
            <LastDrawnItem contestId={props.contest.id} />
          </div>

          <div className="mt-16 flex justify-center">
            <TambolaTicket
              claimedItems={nextChallenge.user.claimedItems}
              markedItems={markedItems}
              ticket={nextChallenge.user.ticket}
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
              {nextChallenge.winningPatterns.map((pattern) => (
                <li key={pattern.name}>
                  <ClaimWinButton
                    contestId={props.contest.id}
                    markedItems={markedItems}
                    pattern={pattern}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
