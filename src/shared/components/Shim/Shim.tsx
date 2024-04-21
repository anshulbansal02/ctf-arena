import clsx from "clsx";
import styles from "./shim.module.scss";

interface Props {
  classNames: string;
}

export function Shim({ classNames }: Props) {
  return <div className={clsx(styles.shimmer, classNames)} />;
}
