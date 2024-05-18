import { config } from "@/config";
import { permanentRedirect } from "next/navigation";

export default function NotFound() {
  return permanentRedirect(config.routes.default.AUTH);
}
