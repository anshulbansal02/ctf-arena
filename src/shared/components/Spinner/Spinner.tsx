import clsx from "clsx";
import styles from "./spinner.module.scss";

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Spinner({
  size = 24,
  color = "#000",
  className,
}: SpinnerProps) {
  return (
    <svg
      className={clsx(styles.wrapper, className)}
      viewBox="0 0 50 50"
      width={`${size / 10}rem`}
      height={`${size / 10}rem`}
    >
      <circle
        className={styles.circle}
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth="5"
      ></circle>
    </svg>
  );
}
