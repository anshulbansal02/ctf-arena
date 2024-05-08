/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
import styles from "./avatar.module.scss";

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
        style={{ borderRadius: size / 6 }}
        src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${props.username + "a"}`}
        alt={props.username}
      />
    </div>
  );
}
