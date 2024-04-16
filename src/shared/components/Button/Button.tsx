import clsx from "clsx";
import { Spinner } from "../Spinner/Spinner";
import styles from "./button.module.scss";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function Button({ children, loading, className, ...props }: Props) {
  return (
    <button
      className={clsx(
        styles.button,
        { [styles.withLoader]: loading },
        className,
      )}
      {...props}
    >
      {loading && <Spinner size={12} className={styles.loader} />}
      {children}
    </button>
  );
}
