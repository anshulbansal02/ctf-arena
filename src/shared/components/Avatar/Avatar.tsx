/* eslint-disable @next/next/no-img-element */
import clsx from "clsx";
import styles from "./avatar.module.scss";

interface Props {
  size?: number;
  className?: string;
  username: string | number;
  rounded?: boolean;
}

export function Avatar({ size = 48, ...props }: Props) {
  return (
    <div className={clsx(styles.avatar, props.className)}>
      <img
        width={size}
        height={size}
        style={{ borderRadius: props.rounded ? size : size / 6 }}
        src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${props.username}`}
        alt={props.username.toString()}
      />
    </div>
  );
}
