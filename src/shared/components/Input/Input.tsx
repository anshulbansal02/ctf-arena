"use client";
import clsx from "clsx";
import { ForwardedRef, forwardRef } from "react";
import styles from "./input.module.scss";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef(function Input(
  { children, className, ...props }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <input ref={ref} className={clsx(styles.input, className)} {...props} />
  );
});
