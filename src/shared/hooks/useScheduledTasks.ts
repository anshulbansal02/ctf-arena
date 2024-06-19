import { useEffect, useRef } from "react";

type ScheduledTask = {
  action: Function;
  timeout: number;
};

export function useScheduledTasks(tasks: Array<ScheduledTask>) {
  const timeoutRef = useRef<Array<number>>([]);

  useEffect(() => {
    tasks.forEach((task) => {
      timeoutRef.current.push(setTimeout(task.action, task.timeout));
    });

    return () => {
      timeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);
}
