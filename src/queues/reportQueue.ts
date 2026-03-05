import { Queue } from "bullmq";
import { redisConnectionOptions } from "../config/redis";

export const REPORT_QUEUE_NAME = "report-queue";

export const reportQueue = new Queue(REPORT_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 500,
    },
    removeOnFail: {
      age: 7 * 24 * 3600,
    },
  },
});
