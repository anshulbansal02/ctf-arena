"use client";
import clsx from "clsx";
import styles from "./input.module.scss";
import { ForwardedRef, forwardRef } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef(function Input(
  { children, className, ...props }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <input ref={ref} className={clsx(styles.input, className)} {...props} />
  );
});
