import { useCallback, useRef, useEffect } from "react";

import { defaultToastStyles } from "@/shared/components/Toaster";
import { toastStore } from "@/shared/store";

interface ToastConfig extends toastStore.Toast {
  timeout?: number;
  persistent?: boolean;
  scoped?: boolean;
}

const DEFAULT_TIMEOUT = 2500; // 2.5 seconds

export function useToaster() {
  const scopedToastsRef = useRef<Array<number>>([]);

  useEffect(() => {
    return () => {
      scopedToastsRef.current.forEach((toastId) => {
        toastStore.removeToast(toastId);
      });
    };
  }, []);

  const make = useCallback((defaultConfig: Partial<ToastConfig>) => {
    return (toastProps: Omit<ToastConfig, "id"> | string) => {
      let config = defaultConfig;
      if (typeof toastProps === "string") config.title = toastProps;
      else config = { ...config, ...toastProps };

      const toastId = toastStore.addToast(config as toastStore.Toast);

      if (config.scoped) scopedToastsRef.current.push(toastId);

      if (!config.persistent) {
        setTimeout(() => {
          toastStore.removeToast(toastId);
        }, config.timeout ?? DEFAULT_TIMEOUT);
      }

      return toastId;
    };
  }, []);

  const dismissToast = useCallback((toastId: toastStore.Toast["id"]) => {
    const toasts = toastStore.getToastList();

    const toast = toasts.find((t: toastStore.Toast) => t.id === toastId);
    if (toast) {
      toastStore.removeToast(toastId);
      if (toast?.onDismiss) toast.onDismiss(toastId);
    }
  }, []);

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
