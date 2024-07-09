import { config } from "@/config";
import { createClient } from "redis";

const redisClient = createClient({
  password: config.cache.password,
  socket: {
    host: config.cache.host,
    port: config.cache.port,
  },
});

export { redisClient as cache };
