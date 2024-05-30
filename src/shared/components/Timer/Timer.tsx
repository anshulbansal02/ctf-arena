"use client";
import { useEffect, useRef, useState } from "react";

interface TimerProps {
  onUp?: () => void;
  running: boolean;
  format?: string;
  till: Date;
}

function getSecondsFromNow(toDate: Date): number {
  return ~~((+toDate - +Date.now()) / 1000);
}

function formatSecondsToDuration(seconds: number) {
  const hh = (~~(seconds / 3600)).toString().padStart(2, "0");
  const mm = (~~((seconds / 60) % 60)).toString().padStart(2, "0");
  const ss = (~~(seconds % 60)).toString().padStart(2, "0");

  return `${hh}:${mm}:${ss} Hr`;
}

export function Timer(props: TimerProps) {
  const [secondsLeft, updateSecondsLeft] = useState<number>(() =>
    getSecondsFromNow(props.till),
  );
  const timerIntervalRef = useRef<Timer>();

  useEffect(() => {
    if (secondsLeft === 0) props.onUp?.();
  }, [secondsLeft]);

  useEffect(() => {
    clearInterval(timerIntervalRef.current);
    if (props.running) {
      timerIntervalRef.current = setInterval(() => {
        updateSecondsLeft((seconds) => {
          if (seconds === 1) clearInterval(timerIntervalRef.current);
          return getSecondsFromNow(props.till);
        });
      }, 1000);
    }
  }, [props.running]);

  useEffect(() => {
    return () => {
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <span suppressHydrationWarning>{formatSecondsToDuration(secondsLeft)}</span>
  );
}
