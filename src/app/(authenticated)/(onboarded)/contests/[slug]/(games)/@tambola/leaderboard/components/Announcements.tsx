"use client";
import { SvgAnnouncement } from "@/assets/icons";
import { useServerEvent } from "@/shared/hooks";
import { useState } from "react";
import contestEvents from "@/services/contest/events";

export function Announcements(props: { contestId: number }) {
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
  });

  return (
    <div className="flex items-center gap-3 rounded-md bg-slate-800 px-5 py-3">
      <SvgAnnouncement fill="#fed7aa" width={20} height={20} />
      <p>{latestAnnouncement?.text}</p>
    </div>
  );
}
