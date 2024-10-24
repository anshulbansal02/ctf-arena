"use client";
import { FireworksStage, useFireworks } from "@/shared/components";
import { useEffect } from "react";

export function FireworksCanvas() {
  const fireworks = useFireworks({ name: "my-show" });

  useEffect(() => {
    document.addEventListener("pointerdown", fireworks.launch("pointer")!);
  }, []);

  return <FireworksStage name="my-show" />;
}
