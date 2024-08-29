import Bull from "bull";

const jobQueue = new Bull("general-job-queue");

const contestQueue = new Bull("contest-queue");

const notificationsQueue = new Bull("notifications-queue");

export { jobQueue, contestQueue, notificationsQueue };
