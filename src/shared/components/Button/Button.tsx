import clsx from "clsx";
import { Spinner } from "../Spinner/Spinner";
import styles from "./button.module.scss";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "ghost" | "primary" | "outlined";
}

export function Button({
  children,
  loading,
  className,
  variant = "primary",
  ...props
}: Props) {
  return (
    <button
      className={clsx(styles.button, styles[variant], className)}
      disabled={loading}
      {...props}
    >
      {loading && <Spinner size={12} className={styles.loader} />}
      {children}
    </button>
  );
}
