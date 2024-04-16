/* eslint-disable @next/next/no-img-element */
import styles from "./avatar.module.scss";
import clsx from "clsx";

interface Props {
  size?: number;
  className?: string;
  username: string;
}

export function Avatar({ size = 48, ...props }: Props) {
  return (
    <div className={clsx(styles.avatar, props.className)}>
      <img
        width={size}
        height={size}
        src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${props.username}`}
        alt={props.username}
      />
    </div>
  );
}
