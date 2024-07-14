import { config } from "@/config";
import { createClient } from "redis";

const cacheClient = createClient({
  password: config.cache.password,
  socket: {
    host: config.cache.host,
    port: config.cache.port,
  },
});

cacheClient.on("error", (e) => {
  console.log("cache error: ", e);
});

const subCacheClient = cacheClient.duplicate({ readonly: true });

export { cacheClient as cache, subCacheClient as subCache };
