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
  const existingShow = store.getState().showsByName[name];
  if (existingShow) return existingShow;

  const show = new FireworksShow(name);
  store.setState((state) => ({
    showsByName: { ...state.showsByName, [name]: show },
  }));
  return show;
}

export function useFireworks(opts: { name: string; auto?: boolean }) {
  const [show, setShow] = useState<FireworksShow>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const newShow = getOrCreateShow(opts.name);
    setShow(newShow);
    newShow.resume();
  }, [opts.name]);

  const launch = (
    using: "pointer" | "sequence",
    sequenceName?: "celebration" | "short",
  ) => {
    if (!show) return;
    if (using === "pointer")
      return (event: PointerEvent) => {
        show.launchRandomShell(event);
      };
    else if (using === "sequence" && sequenceName) {
      show.launchSequence(sequenceName);
    }
  };

  useEffect(() => {
    if (!show) return;
    if (opts.auto) show.startAuto();
    else show.stopAuto();

    return () => show.stopAuto();
  }, [opts.auto, show]);

  return { launch };
}
