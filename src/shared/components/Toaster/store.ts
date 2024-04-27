import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

export type Toast = {
  id: number;
  title?: string;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: (id: Toast["id"]) => void;
};

const toasts = atom<Array<Toast>>([]);

export function useToasts() {
  return useAtomValue(toasts);
}

export function useToasterActions() {
  const setToasts = useSetAtom(toasts);
  const toastsList = useToasts();

  const addToast = useCallback(
    (toast: Toast) => {
      const lastToast = toastsList.at(-1);
      const id = (lastToast?.id ?? 0) + 1;
      setToasts((toasts) => [...toasts, { ...toast, id }]);
      return id;
    },
    [setToasts, toastsList],
  );

  const removeToast = useCallback(
    (toastId: Toast["id"]) => {
      setToasts((toasts) => toasts.filter((t) => t.id !== toastId));
    },
    [setToasts],
  );

  const getToast = useCallback(
    (toastId: Toast["id"]) => {
      return toastsList.find((t) => t.id === toastId);
    },
    [toastsList],
  );

  return {
    addToast,
    removeToast,
    getToast,
  };
}
