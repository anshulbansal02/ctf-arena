"use client";

import { create } from "zustand";
import { FireworksShow } from "../fireworks-show";
import { useEffect, useState } from "react";

type FireworksShowState = {
  showsByName: Record<string, FireworksShow>;
};

const store = create<FireworksShowState>()(() => ({
  showsByName: {},
}));

function getOrCreateShow(name: string) {
  if (typeof window === "undefined") return;
  const existingShow = store.getState().showsByName[name];
  if (existingShow) return existingShow;

  const show = new FireworksShow(name);
  store.setState((state) => ({
    showsByName: { ...state.showsByName, [name]: show },
  }));
  return show;
}

export function useFireworks(opts: { name: string; auto?: boolean }) {
  const [show] = useState(() => getOrCreateShow(opts.name));

  useEffect(() => {
    if (typeof window === "undefined") return;
    show?.resume();
  }, [show]);

  const launch = (
    using: "pointer" | "sequence",
    sequenceName?: "celebration" | "short",
  ) => {
    if (using === "pointer")
      return (event: PointerEvent) => {
        show?.launchRandomShell(event);
      };
    else if (using === "sequence" && sequenceName) {
      show?.launchSequence(sequenceName);
    }
  };

  useEffect(() => {
    if (opts.auto) show?.startAuto();
    else show?.stopAuto();

    return () => show?.stopAuto();
  }, [opts.auto, show]);

  return { launch };
}
