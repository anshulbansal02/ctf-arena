import {
  SvgError,
  SvgInfoOutlined,
  SvgSuccess,
  SvgWarning,
} from "@/assets/icons";
import { ToastContainer } from "./ToastContainer/ToastContainer";

export const defaultToastStyles = {
  info: {
    title: "Info",
    icon: <SvgInfoOutlined fill="currentColor" />,
    className: "info",
  },
  warning: {
    title: "Warning",
    icon: <SvgWarning fill="currentColor" />,
    className: "warning",
  },
  error: {
    title: "Error",
    icon: <SvgError fill="currentColor" />,
    className: "error",
  },
  success: {
    title: "Success",
    icon: <SvgSuccess fill="currentColor" />,
    className: "success",
  },
} as const;

export { ToastContainer as Toaster };
