import { Worker, Job } from "bullmq";
import { redisConnectionOptions } from "../config/redis";
import { EMAIL_QUEUE_NAME } from "../queues/emailQueue";
import { EmailJobPayload } from "../schemas/emailSchema";
import { sendEmail, EmailResult } from "../services/emailService";
import { logger } from "../utils/logger";

export const emailWorker = new Worker<EmailJobPayload, EmailResult>(
  EMAIL_QUEUE_NAME,
  async (job: Job<EmailJobPayload>) => {
    logger.info(`Processing email job ${job.id} -> ${job.data.to}`);

    await job.updateProgress(10);

    const result = await sendEmail(job.data);

    await job.updateProgress(100);

    return result;
  },
  {
    connection: redisConnectionOptions,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

emailWorker.on("completed", (job) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

emailWorker.on("failed", (job, err) => {
  logger.error(`Email job ${job?.id} failed: ${err.message}`);
});

emailWorker.on("error", (err) => {
  logger.error(`Email worker error: ${err.message}`);
});
