import { config } from "@/config";
import Bull from "bull";

const queueCommonConfig: Bull.QueueOptions = {
  redis: {
    host: config.cache.host,
    port: config.cache.port,
  },
  defaultJobOptions: {
    removeOnComplete: true,
  },
};

/** General Jobs Queue */
const generalQueue = new Bull("general-queue", queueCommonConfig);

/** Contest Jobs Queue */
const contestQueue = new Bull("contest-queue", queueCommonConfig);

/** Notifications Jobs Queue */
const notificationsQueue = new Bull("notifications-queue", queueCommonConfig);

export { generalQueue, contestQueue, notificationsQueue };
