import { ToastContainer } from "./ToastContainer/ToastContainer";

export const defaultToastStyles = {
  error: {
    title: "Error",
    icon: null,
    className: "error",
  },
} as const;

export { ToastContainer as Toaster };
