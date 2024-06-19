import clsx from "clsx";
import { Spinner } from "../Spinner/Spinner";
import styles from "./button.module.scss";
import { ForwardedRef, forwardRef } from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "ghost" | "primary" | "outlined";
}

const Button = forwardRef(function Button(
  { children, loading, className, variant = "primary", ...props }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      className={clsx(styles.button, styles[variant], className)}
      disabled={loading}
      {...props}
    >
      {loading && <Spinner size={12} className={styles.loader} />}
      {children}
    </button>
  );
});

export { Button };

// export function Button({
//   children,
//   loading,
//   className,
//   variant = "primary",
//   ...props
// }: Props) {
//   return (
//     <button
//       className={clsx(styles.button, styles[variant], className)}
//       disabled={loading}
//       {...props}
//     >
//       {loading && <Spinner size={12} className={styles.loader} />}
//       {children}
//     </button>
//   );
// }
