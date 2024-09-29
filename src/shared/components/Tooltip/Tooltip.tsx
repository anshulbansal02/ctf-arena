import React from "react";
import styles from "./tooltip.module.scss";
import * as Tip from "@radix-ui/react-tooltip";

interface TooltipProps {
  text?: string;
  content?: React.ReactNode;
  children: React.ReactNode;
}

export function Tooltip(props: TooltipProps) {
  return (
    <Tip.Provider>
      <Tip.Root delayDuration={400}>
        <Tip.Trigger asChild>{props.children}</Tip.Trigger>
        <Tip.Portal>
          <Tip.Content className={styles.content} sideOffset={5}>
            {props.content ?? props.text}
          </Tip.Content>
        </Tip.Portal>
      </Tip.Root>
    </Tip.Provider>
  );
}
