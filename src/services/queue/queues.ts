import { config } from "@/config";
import Bull from "bull";

const queueCommonConfig = {
  redis: {
    host: config.cache.host,
    port: config.cache.port,
  },
};

const jobQueue = new Bull("general-job-queue", queueCommonConfig);

const contestQueue = new Bull("contest-queue", queueCommonConfig);

const notificationsQueue = new Bull("notifications-queue", queueCommonConfig);

export { jobQueue, contestQueue, notificationsQueue };
