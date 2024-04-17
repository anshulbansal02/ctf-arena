"use client";
import styles from "./toast-container.module.scss";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Toast } from "../Toast/Toast";
import { useToasterActions, useToasts } from "../store";

export function ToastContainer() {
  const toasts = useToasts();
  const { removeToast } = useToasterActions();

  return createPortal(
    <div className={styles.container}>
      <div className={clsx(styles.stack, styles.bottom, styles.right)}>
        {toasts.map((toastConfig) => (
          <div key={toastConfig.id}>
            <Toast
              {...toastConfig}
              onDismiss={(id) => {
                removeToast(id);
                toastConfig.onDismiss && toastConfig.onDismiss(id);
              }}
            />
          </div>
        ))}
      </div>
    </div>,
    document.getElementById("portal") as HTMLElement,
  );
}
