import { useCallback } from "react";

import { defaultToastStyles } from "@/shared/components/Toaster";

import { Toast, useToasterActions } from "../components/Toaster/store";

interface ToastConfig extends Toast {
  timeout?: number;
  persistent?: boolean;
}

const DEFAULT_TIMEOUT = 2500; // 2.5 seconds

export function useToaster() {
  const { removeToast, addToast, getToast } = useToasterActions();

  const make = useCallback(
    (defaultConfig: Partial<ToastConfig>) => {
      return (toastProps: Omit<ToastConfig, "id"> | string) => {
        let config = defaultConfig;
        if (typeof toastProps === "string") config.title = toastProps;
        else config = { ...config, ...toastProps };

        const toastId = addToast(config as Toast);

        if (!config.persistent) {
          setTimeout(() => {
            removeToast(toastId);
          }, config.timeout ?? DEFAULT_TIMEOUT);
        }

        return toastId;
      };
    },
    [addToast, removeToast],
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
    info: make(defaultToastStyles.info),
    success: make(defaultToastStyles.success),
    warning: make(defaultToastStyles.warning),
    loading: make(defaultToastStyles.loading),
    dismiss: dismissToast,
  };

  return methods;
}
