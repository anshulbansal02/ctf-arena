import { config } from "@/config";
import { posix } from "path";

export const assetURI = (path: string) =>
  new URL(posix.join("/static", path), config.host).toString();
