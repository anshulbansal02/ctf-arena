import { config } from "@/config";
import { createClient } from "redis";

const cacheClient = createClient({
  password: config.cache.password,
  socket: {
    host: config.cache.host,
    port: config.cache.port,
  },
});

if (!cacheClient.isOpen) cacheClient.connect();

cacheClient.on("error", (e) => {
  console.error("cache error: ", e);
});

export { cacheClient as cache };
