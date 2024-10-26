"use client";
import { Button, Tooltip } from "@/shared/components";
import "./fireworks.scss";
import { useFireworks } from "./hook";
import { useEffect, useRef } from "react";
import { SvgFireworks, SvgFireworksSlashed } from "@/assets/icons";
import { useToaster } from "@/shared/hooks";
import usePersistedState from "@/shared/hooks/usePersistedState";

export function FireworksStage(props: { name: string; auto?: boolean }) {
  const [isAuto, setAuto] = usePersistedState(
    "fireworks-auto-start",
    props.auto,
    { lazy: true },
  );
  const fireworks = useFireworks({ name: props.name, auto: isAuto });
  const toaster = useToaster();
  const infoToastRef = useRef<Timer>();

  useEffect(() => {
    if (infoToastRef.current) return;
    infoToastRef.current = setTimeout(() => {
      toaster.info({
        timeout: 10_000,
        scoped: true,
        title: "Experiencing lag or slow performance on this page?",
        content:
          "Try turning off the background fireworks using the toggle at the bottom left of the screen.",
      });
    }, 2000);
    return () => {
      clearTimeout(infoToastRef.current);
      infoToastRef.current = undefined;
    };
  }, []);

  return (
    <div>
      <div
        className="fireworks"
        data-name={props.name}
        onPointerDown={fireworks.launch("pointer")}
      >
        <canvas data-stage="main" />
        <canvas data-stage="trails" />
      </div>
      <Tooltip
        asChild
        text={`Click to ${isAuto ? "stop" : "start"} automatic fireworks`}
      >
        <Button
          suppressHydrationWarning
          variant="ghost"
          style={{ position: "fixed", bottom: 8, left: 8 }}
          onClick={() => setAuto(!isAuto)}
        >
          {!isAuto ? <SvgFireworksSlashed /> : <SvgFireworks />}
        </Button>
      </Tooltip>
    </div>
  );
}
