import { Queue } from "bullmq";
import { redisConnectionOptions } from "../config/redis";

export const EMAIL_QUEUE_NAME = "email-queue";

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // 7 days
    },
  },
});
