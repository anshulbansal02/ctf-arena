import { config } from "@/config";
import { createClient } from "redis";

const publisherClient = createClient({
  password: config.cache.password,
  socket: {
    host: config.cache.host,
    port: config.cache.port,
  },
});

const subscriberClient = publisherClient.duplicate();

if (!publisherClient.isOpen) publisherClient.connect();
if (!subscriberClient.isOpen) subscriberClient.connect();

const contestChannel = {
  publisher: publisherClient,
  subscriber: subscriberClient,
};

export { contestChannel };
