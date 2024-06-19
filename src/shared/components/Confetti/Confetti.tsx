"use client";
import { useEffect, useId, useState } from "react";
import styles from "./confetti.module.scss";
import { ConfettiPopper } from "./ConfettiPopper";
import { useClientDimensions } from "@/shared/hooks";

interface Props {
  render: (launch: (container: HTMLElement) => void) => React.ReactNode;
}

export function Confetti(props: Props) {
  const canvasId = useId();
  const [popper, setPopper] = useState<ConfettiPopper>();
  const windowDimensions = useClientDimensions();

  useEffect(() => {
    if (window.document != null) {
      setPopper(ConfettiPopper.makeStandardPopper(`#${CSS.escape(canvasId)}`));
    }
  }, []);

  function launch(container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    popper?.pop({ x: rect.width, y: rect.height });

    setPopper(ConfettiPopper.makeStandardPopper(`#${CSS.escape(canvasId)}`));
  }

  return (
    <>
      <canvas
        className={styles.canvas}
        id={canvasId}
        width={windowDimensions.width}
        height={windowDimensions.height}
      />
      {props.render(launch)}
    </>
  );
}
