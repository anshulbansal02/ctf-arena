"use client";
import clsx from "clsx";
import styles from "./tags-input.module.scss";
import { forwardRef, useRef } from "react";
import { SvgCross } from "@/assets/icons";

interface Props
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: Array<string>;
  delimiter?: string;
  onChange: (value: Array<string>) => void;
}

export const TagsInput = forwardRef(function TagsInput(
  { className, value, delimiter = ",", onChange, ...props }: Props,
  forwardRef: React.ForwardedRef<HTMLDivElement>,
) {
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    inputRef.current?.focus();
  }

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    const lastChar = e.currentTarget.value.at(-1);
    if (lastChar === delimiter) {
      const newTag = e.currentTarget.value.slice(0, -1);
      if (newTag === "") return;
      onChange([...(value ?? []), newTag]);

      e.currentTarget.value = "";
    }
  }
  function handleKeyDown(e: React.KeyboardEvent) {
    const input = inputRef.current;
    if (!input) return;

    if (e.key === "Enter" && input.value !== "") {
      onChange([...(value ?? []), input.value]);

      input.value = "";
    } else if (e.key === "Backspace" && input.value === "") {
      onChange(value?.slice(0, -1) ?? []);
    }
  }

  function handleRemove(tagIndex: number) {
    console.log("tag", tagIndex);
    onChange(value?.toSpliced(tagIndex, 1) ?? []);
  }

  const placeholder = !value?.length ? props.placeholder : "";

  return (
    <div
      className={clsx(styles.container, className)}
      onClick={focusInput}
      ref={forwardRef}
    >
      {value?.length !== 0 && (
        <ul className={styles.tags}>
          {value?.map((v, i) => (
            <li key={v} onPointerDown={(e) => e.preventDefault()}>
              {v} <SvgCross onClick={() => handleRemove(i)} />
            </li>
          ))}{" "}
        </ul>
      )}
      <input
        ref={inputRef}
        {...props}
        placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
});
