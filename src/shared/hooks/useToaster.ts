import { useCallback } from "react";

import { defaultToastStyles } from "@/shared/components/Toaster";

import { useToasterActions, Toast } from "../components/Toaster/store";

interface ToastConfig extends Toast {
  timeout?: number;
  persistent?: boolean;
}

const DEFAULT_TIMEOUT = 1000000; // 2.5 seconds

export function useToaster() {
  const { removeToast, addToast, getNextToastId, getToast } =
    useToasterActions();

  const make = useCallback(
    (defaultConfig: Partial<ToastConfig>) => {
      return (toastProps: Omit<ToastConfig, "id"> | string) => {
        let config = defaultConfig;
        if (typeof toastProps === "string") config.title = toastProps;
        else config = { ...config, ...toastProps };

        config.id = getNextToastId();

        if (!config.persistent) {
          setTimeout(() => {
            removeToast(config.id!);
          }, config.timeout ?? DEFAULT_TIMEOUT);
        }
        addToast(config as Toast);

        return config.id;
      };
    },
    [addToast, getNextToastId, removeToast],
  );

  const dismissToast = useCallback(
    (toastId: Toast["id"]) => {
      const toast = getToast(toastId);
      if (toast) {
        removeToast(toastId);
        if (toast?.onDismiss) toast.onDismiss(toastId);
      }
    },
    [removeToast, getToast],
  );

  const methods = {
    toast: make({}),
    error: make(defaultToastStyles.error),
    dismiss: dismissToast,
  };

  return methods;
}
