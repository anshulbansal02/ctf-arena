"use client";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toast } from "../Toast/Toast";
import { toastStore } from "@/shared/store";
import styles from "./toast-container.module.scss";

const animationConfig = {
  toast: {
    layout: true,
    initial: { y: 56, scale: 0.9 },
    animate: { y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.85, transition: { duration: 0.1 } },
  },
};

export function ToastContainer() {
  const toasts = toastStore.useToastList();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (typeof window === "undefined") return;
  const portal = window && document.getElementById("portal")!;

  return (
    isClient &&
    createPortal(
      <div className={styles.container}>
        <div className={clsx(styles.bottom, styles.stack)}>
          <AnimatePresence>
            {toasts.map((toastConfig) => (
              <motion.div key={toastConfig.id} {...animationConfig.toast}>
                <Toast
                  {...toastConfig}
                  onDismiss={(id) => {
                    toastStore.removeToast(id);
                    toastConfig.onDismiss && toastConfig.onDismiss(id);
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>,
      portal,
    )
  );
}
