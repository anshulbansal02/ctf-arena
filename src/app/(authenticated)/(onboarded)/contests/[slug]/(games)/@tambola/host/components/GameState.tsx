"use client";
import { SvgDrawItem } from "@/assets/icons";
import { drawItem, getGameState } from "@/services/contest/games/tambola";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";

export function GameState(props: { contestId: number }) {
  const {
    execute: getState,
    data: gameState,
    loading,
  } = useAction(() => getGameState(props.contestId), {
    immediate: true,
    args: [],
  });

  const {
    execute: drawNext,
    data: lastDrawnItem,
    loading: loadingNextDraw,
  } = useAction(() => drawItem(props.contestId));

  return (
    <section>
      <ul className="grid grid-cols-9">
        {gameState?.drawSequence.map((item) => (
          <li key={item} className="border-2">
            {item}
          </li>
        ))}
      </ul>

      <Button loading={loadingNextDraw} onClick={drawNext}>
        <SvgDrawItem fill="currentColor" /> Draw Item
      </Button>

      <span>{lastDrawnItem ?? gameState?.lastDrawnItem}</span>

      <span>Wins Left</span>
    </section>
  );
}
