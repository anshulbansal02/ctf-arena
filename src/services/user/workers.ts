import type { Job } from "bull";
import { notificationsQueue } from "../queue";
import { createNotification } from "./services";

export function setupUserQueues() {
  notificationsQueue.process(
    "new-notification",
    async (job: Job<{ content: string; userId: string }>) => {
      console.info(`[Job] Creating notifications`);
      // create new notification
      createNotification(job.data);
    },
  );
}
