"use client";
import { useEffect, useState } from "react";
import { useToaster } from "@/shared/hooks";
import { SvgSignalConnected, SvgSignalDisconnected } from "@/assets/icons";

export function ConnectivityStatus(props: { children: React.ReactNode }) {
  const toaster = useToaster();

  const [state, setState] = useState<{ toast: number }>();

  useEffect(() => {
    function onlineListener() {
      if (state?.toast) toaster.dismiss(state.toast);
      const toast = toaster.success({
        icon: <SvgSignalConnected fill="currentColor" />,
        title: "You are online now 🎉",
      });
      setState({ toast });
    }

    function offlineListener() {
      if (state?.toast) toaster.dismiss(state.toast);
      const toast = toaster.error({
        icon: <SvgSignalDisconnected fill="currentColor" />,
        title: "You are currently offline",
        content: "Waiting for your device to connect to the internet.",
        dismissible: false,
        persistent: true,
      });
      setState({ toast });
    }

    window.addEventListener("online", onlineListener);
    window.addEventListener("offline", offlineListener);

    return () => {
      window.removeEventListener("online", onlineListener);
      window.removeEventListener("offline", offlineListener);
    };
  }, [state?.toast, toaster]);

  return props.children;
}
