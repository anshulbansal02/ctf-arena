"use client";
import { SvgCross } from "@/assets/icons";
import clsx from "clsx";
import { forwardRef, useRef } from "react";
import styles from "./tags-input.module.scss";

interface Props
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: Array<string>;
  delimiter?: string;
  onChange: (value: Array<string>) => void;
}

export const TagsInput = forwardRef<HTMLDivElement, Props>(function TagsInput(
  { className, value, delimiter = ",", onChange, ...props },
  ref,
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
      ref={ref}
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
