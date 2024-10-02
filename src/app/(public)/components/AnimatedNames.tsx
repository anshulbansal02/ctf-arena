"use client";
import { randomInt } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const variants = {
  enter: () => {
    return {
      y: -8,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    y: 0,
    opacity: 1,
  },
  exit: () => {
    return {
      zIndex: 0,
      opacity: 0,
    };
  },
};

export function AnimatedNames() {
  const [currentIdx, setCurrentIdx] = useState<number>(() =>
    randomInt(0, alternateNames.length),
  );
  const name = alternateNames[currentIdx];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentIdx(randomInt(0, alternateNames.length));
    }, 10 * 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [currentIdx, setCurrentIdx]);

  return (
    <div className="relative mt-4 w-full text-center text-xl font-medium text-slate-300">
      <AnimatePresence>
        <motion.span
          className="absolute left-0 w-full"
          key={currentIdx}
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
          {name}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

const alternateNames = [
  "Create The Formation",
  "Challenge To Fun",
  "Challenge The Festivities",
  "Clash The Forces",
  "Challenge To Flourish",
  "Capture The Flag",
  "Connect To Fun",
  "Challenge To Forge",
  "Crack The Framework",
  "Chase The Flag",
  "Code The Future",
  "Challenge The Frontier",
  "Create The Fusion",
  "Conquer The Fortress",
  "Capture The Fragment",
  "Crazy Tactics Fest",
  "Creative Team Fight",
  "Compete To Flourish",
  "Catch The Fantasy",
  "Color The Future",
  "Conquer The Floor",
  "Challenge To Fly",
  "Curate The Fun",
  "Clever Tricks Fest",
  "Cosmic Team Fun",
  "Curiosity Treasure Fun",
];
