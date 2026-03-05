import { Worker, Job } from "bullmq";
import { redisConnectionOptions } from "../config/redis";
import { REPORT_QUEUE_NAME } from "../queues/reportQueue";
import { ReportJobPayload } from "../schemas/reportSchema";
import { generateReport, ReportResult } from "../services/reportService";
import { logger } from "../utils/logger";

export const reportWorker = new Worker<ReportJobPayload, ReportResult>(
  REPORT_QUEUE_NAME,
  async (job: Job<ReportJobPayload>) => {
    logger.info(
      `Processing report job ${job.id} -> ${job.data.type} "${job.data.title}"`
    );

    await job.updateProgress(10);

    const result = await generateReport(job.data);

    await job.updateProgress(100);

    return result;
  },
  {
    connection: redisConnectionOptions,
    concurrency: 3,
  }
);

reportWorker.on("completed", (job) => {
  logger.info(`Report job ${job.id} completed successfully`);
});

reportWorker.on("failed", (job, err) => {
  logger.error(`Report job ${job?.id} failed: ${err.message}`);
});

reportWorker.on("error", (err) => {
  logger.error(`Report worker error: ${err.message}`);
});
