"use client";
import { getLastDrawnItem, TicketItem } from "@/services/contest/games/tambola";
import { useAction, useServerEvent } from "@/shared/hooks";
import contestEvents from "@/services/contest/events";

import { AnimatePresence, motion } from "framer-motion";

const variants = {
  enter: () => {
    return {
      scale: 0,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    scale: 1,
    opacity: 1,
  },
  exit: () => {
    return {
      zIndex: 0,
      opacity: 0,
    };
  },
};

export function LastDrawnItem(props: {
  contestId: number;
  lastDrawn?: TicketItem;
  controlled?: boolean;
}) {
  const { data: lastDrawnItem, setState: setLastDrawn } = useAction(
    getLastDrawnItem,
    {
      immediate: true,
      args: [props.contestId],
    },
  );

  useServerEvent<TicketItem>(
    contestEvents.game(props.contestId, "item_drawn"),
    (drawnItem) => {
      setLastDrawn(drawnItem);
    },
    { active: !props.controlled },
  );

  return (
    <div className="relative mt-4 h-12 w-full text-center text-3xl font-medium text-slate-300">
      <AnimatePresence>
        <motion.h3
          className="absolute left-0 w-full"
          key={props.lastDrawn ?? lastDrawnItem}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: "spring", stiffness: 300, damping: 200 },
            opacity: { duration: 0.4 },
          }}
          suppressHydrationWarning
        >
          {props.lastDrawn ?? lastDrawnItem ?? "—"}
        </motion.h3>
      </AnimatePresence>
    </div>
  );
}
