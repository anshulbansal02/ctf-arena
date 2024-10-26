import React from "react";
import styles from "./tooltip.module.scss";
import * as Tip from "@radix-ui/react-tooltip";
import clsx from "clsx";

interface TooltipProps {
  asChild?: boolean;
  text?: string;
  content?: React.ReactNode;
  children: React.ReactNode;
  contentClass?: string;
  className?: string;
}

export function Tooltip(props: TooltipProps) {
  return (
    <Tip.Provider>
      <Tip.Root delayDuration={400}>
        <Tip.Trigger
          asChild={props.asChild}
          className={clsx(props.className)}
          type="button"
          aria-label="Tooltip content"
        >
          {props.children}
        </Tip.Trigger>
        <Tip.Portal>
          <Tip.Content
            className={clsx(styles.content, props.contentClass)}
            sideOffset={5}
          >
            {props.content ?? <p>{props.text}</p>}
          </Tip.Content>
        </Tip.Portal>
      </Tip.Root>
    </Tip.Provider>
  );
}
