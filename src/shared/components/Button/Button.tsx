import clsx from "clsx";
import { Spinner } from "../Spinner/Spinner";
import styles from "./button.module.scss";
import { ForwardedRef, forwardRef } from "react";
import Link from "next/link";

type ButtonProps = {
  variant?: "ghost" | "primary" | "outlined";
  as?: "button";
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type LinkProps = {
  variant?: "ghost" | "primary" | "outlined";
  as: "link";
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

type Props = ButtonProps | LinkProps;

const Button = forwardRef(function Button(
  { as = "button", ...props }: Props,
  ref: ForwardedRef<any>,
) {
  const { variant, className, children, ...restProps } = props as any;

  if (as === "button") {
    const { loading, ...elementProps } = restProps;

    return (
      <button
        ref={ref}
        className={clsx(styles.button, styles[variant ?? "primary"], className)}
        disabled={loading}
        {...elementProps}
      >
        {loading && <Spinner size={12} className={styles.loader} />}
        {children}
      </button>
    );
  } else {
    return (
      <Link
        className={clsx(styles.button, styles[variant ?? "primary"], className)}
        {...restProps}
      >
        {children}
      </Link>
    );
  }
});

export { Button };
