"use client";
import { SvgDrawItem } from "@/assets/icons";
import { drawItem, getGameState } from "@/services/contest/games/tambola";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import styles from "./game-state.module.scss";
import clsx from "clsx";
import { LastDrawnItem } from "../../components/LastDrawnItem";

export function GameState(props: { contestId: number }) {
  const {
    execute: drawNext,
    loading: loadingNextDraw,
    setState: setLastDrawn,
    data: lastDrawnItem,
  } = useAction(
    async () => {
      const item = await drawItem(props.contestId);
      getUpdatedGameState();
      return item;
    },
    { preserveData: true, immediate: false },
  );

  const { execute: getUpdatedGameState, data: gameState } = useAction(
    async () => {
      const state = await getGameState(props.contestId);
      state.drawSequence = state.drawSequence.toSorted((a, b) => a - b);
      if (state.lastDrawnItem) setLastDrawn(state.lastDrawnItem);
      return state;
    },
    {
      immediate: true,
      args: [],
      preserveData: true,
    },
  );

  return (
    <section className="mx-auto mb-10 flex min-h-screen max-w-[600px] flex-col items-center px-4">
      <h4 className="mt-8 text-slate-400">Last Drawn</h4>
      <LastDrawnItem
        contestId={props.contestId}
        controlled
        lastDrawn={
          typeof lastDrawnItem === "number" ? lastDrawnItem : undefined
        }
      />

      <ul className={styles.gridItems}>
        {gameState?.drawSequence.map((item) => (
          <li
            key={item}
            className={clsx(styles.drawSequenceItem, {
              [styles.marked]: gameState.itemsDrawn.includes(item),
            })}
          >
            <span>&nbsp;{item}&nbsp;</span>
          </li>
        ))}
      </ul>

      <Button
        loading={loadingNextDraw}
        onClick={drawNext}
        className="mt-8 w-full"
      >
        <SvgDrawItem fill="currentColor" /> Draw Item
      </Button>
    </section>
  );
}
