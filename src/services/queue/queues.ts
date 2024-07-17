import Bull from "bull";

const jobQueue = new Bull("general-job-queue");

const contestQueue = new Bull("contest-queue");

export { jobQueue, contestQueue };
