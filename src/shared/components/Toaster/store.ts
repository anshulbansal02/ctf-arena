import { atom, useAtomValue, useSetAtom, useAtom } from "jotai";

export type Toast = {
  id: number;
  title?: string;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: (id: Toast["id"]) => void;
};

const toasts = atom<Array<Toast>>([]);
const nextToastId = atom<number>(0);

export function useToasts() {
  return useAtomValue(toasts);
}

export function useToasterActions() {
  const setToasts = useSetAtom(toasts);
  const toastsList = useToasts();
  const [toastId, setNextToastId] = useAtom(nextToastId);

  const getNextToastId = () => {
    setNextToastId((id) => ++id);
    return toastId;
  };

  const addToast = (toast: Toast) => {
    setToasts((toasts) => [...toasts, toast]);
  };

  const removeToast = (toastId: Toast["id"]) => {
    setToasts((toasts) => toasts.filter((t) => t.id !== toastId));
  };

  const getToast = (toastId: Toast["id"]) => {
    return toastsList.find((t) => t.id === toastId);
  };

  return {
    getNextToastId,
    addToast,
    removeToast,
    getToast,
  };
}
