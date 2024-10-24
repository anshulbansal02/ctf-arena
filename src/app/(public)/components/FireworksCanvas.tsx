"use client";
import { FireworksStage, useFireworks } from "@/shared/components";

export function FireworksCanvas() {
  const fireworks = useFireworks({ name: "my-show" });

  return <FireworksStage name="my-show" />;
}
