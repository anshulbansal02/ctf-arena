import Bull from "bull";
import { cache } from "../cache";

const jobQueue = new Bull("general-job-queue");

const contestQueue = new Bull("contest-queue");

export { jobQueue, contestQueue };
