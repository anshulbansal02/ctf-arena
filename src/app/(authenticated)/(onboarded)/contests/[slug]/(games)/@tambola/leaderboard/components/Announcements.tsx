"use client";
import { useServerEvent } from "@/shared/hooks";
import { useEffect, useState } from "react";
import contestEvents from "@/services/contest/events";

import { AnimatePresence, motion } from "framer-motion";
import { randomInt, randomItem } from "@/lib/utils";
import { useFireworks } from "@/shared/components/Fireworks/hook";

const variants = {
  enter: () => {
    return {
      y: -40,
      scale: 0.8,
      opacity: 0.7,
    };
  },
  center: {
    y: 0,
    zIndex: 1,
    scale: 1,
    opacity: 1,
  },
  exit: () => {
    return {
      y: 50,
      zIndex: 0,
      scale: 0.6,
      opacity: 0,
    };
  },
};

export function Announcements(props: { contestId: number }) {
  const fireworks = useFireworks({ name: "tambola", auto: true });

  const [latestAnnouncement, setLatestAnnouncement] = useState<{
    text: string;
    time: Date;
  }>({ text: "Waiting for latest contest updates...", time: new Date() });

  useServerEvent<{
    name: string;
    title: string;
    claimsLeft: number;
    claimedBy: string;
  }>(contestEvents.leaderboard(props.contestId, "win_claimed"), (data) => {
    setLatestAnnouncement({
      text: `${data.claimedBy} claims win for ${data.title}. ${data.claimsLeft} claims left for ${data.title}.`,
      time: new Date(),
    });
    fireworks.launch("sequence", "short");
  });

  return (
    <div className="relative flex h-16 w-full items-center overflow-hidden rounded-md bg-slate-800 px-5 py-3">
      <AnimatePresence>
        <motion.p
          className="absolute left-0 w-full text-center"
          key={+latestAnnouncement.time}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { duration: 0.3 },
            opacity: { duration: 0.4 },
          }}
          suppressHydrationWarning
        >
          {latestAnnouncement.text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
