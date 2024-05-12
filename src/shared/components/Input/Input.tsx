"use client";
import clsx from "clsx";
import { ForwardedRef, forwardRef } from "react";
import styles from "./input.module.scss";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const Input = forwardRef(function Input(
  { children, className, leftSlot, rightSlot, ...props }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <div className={clsx(styles.wrapper, className)}>
      <span className={styles.leftSlot}>{leftSlot}</span>
      <input ref={ref} className={styles.input} {...props} autoComplete="off" />
      <span className={styles.rightSlot}>{rightSlot}</span>
    </div>
  );
});
