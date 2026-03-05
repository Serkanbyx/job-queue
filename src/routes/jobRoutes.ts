import { Router, Request, Response } from "express";
import { emailQueue } from "../queues/emailQueue";
import { reportQueue } from "../queues/reportQueue";
import { emailJobSchema } from "../schemas/emailSchema";
import { reportJobSchema } from "../schemas/reportSchema";
import { validate } from "../middlewares/validate";
import { jobRateLimiter } from "../middlewares/security";
import { logger } from "../utils/logger";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailJobRequest:
 *       type: object
 *       required:
 *         - to
 *         - subject
 *         - body
 *       properties:
 *         to:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         subject:
 *           type: string
 *           example: Welcome to our platform
 *         body:
 *           type: string
 *           example: "<h1>Hello!</h1><p>Welcome aboard.</p>"
 *     ReportJobRequest:
 *       type: object
 *       required:
 *         - type
 *         - title
 *         - data
 *       properties:
 *         type:
 *           type: string
 *           enum: [pdf, csv]
 *           example: pdf
 *         title:
 *           type: string
 *           example: Monthly Sales Report
 *         data:
 *           type: array
 *           items:
 *             type: object
 *           example:
 *             - name: "Product A"
 *               quantity: 150
 *               revenue: 4500
 *             - name: "Product B"
 *               quantity: 89
 *               revenue: 2670
 *     JobResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         jobId:
 *           type: string
 *         queue:
 *           type: string
 *     JobStatus:
 *       type: object
 *       properties:
 *         jobId:
 *           type: string
 *         queue:
 *           type: string
 *         state:
 *           type: string
 *           enum: [waiting, active, completed, failed, delayed]
 *         progress:
 *           type: number
 *         result:
 *           type: object
 *         failedReason:
 *           type: string
 *         timestamp:
 *           type: string
 *         processedOn:
 *           type: string
 *         finishedOn:
 *           type: string
 *     ValidationError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 */

/**
 * @swagger
 * /api/jobs/email:
 *   post:
 *     summary: Submit an email job
 *     description: Adds an email sending job to the queue. The email will be sent asynchronously via Ethereal test SMTP.
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailJobRequest'
 *     responses:
 *       201:
 *         description: Job queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  "/email",
  jobRateLimiter,
  validate(emailJobSchema),
  async (req: Request, res: Response) => {
    try {
      const job = await emailQueue.add("send-email", req.body);

      logger.info(`Email job queued: ${job.id}`);

      res.status(201).json({
        message: "Email job queued successfully",
        jobId: job.id,
        queue: "email",
      });
    } catch (error) {
      logger.error("Failed to queue email job:", error);
      res.status(500).json({ error: "Failed to queue email job" });
    }
  }
);

/**
 * @swagger
 * /api/jobs/report:
 *   post:
 *     summary: Submit a report generation job
 *     description: Adds a report generation job to the queue. Supports PDF and CSV formats.
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportJobRequest'
 *     responses:
 *       201:
 *         description: Job queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  "/report",
  jobRateLimiter,
  validate(reportJobSchema),
  async (req: Request, res: Response) => {
    try {
      const job = await reportQueue.add("generate-report", req.body);

      logger.info(`Report job queued: ${job.id}`);

      res.status(201).json({
        message: "Report job queued successfully",
        jobId: job.id,
        queue: "report",
      });
    } catch (error) {
      logger.error("Failed to queue report job:", error);
      res.status(500).json({ error: "Failed to queue report job" });
    }
  }
);

/**
 * @swagger
 * /api/jobs/{queue}/{id}/status:
 *   get:
 *     summary: Get job status
 *     description: Returns the current state, progress, result, or failure reason for a specific job.
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: queue
 *         required: true
 *         schema:
 *           type: string
 *           enum: [email, report]
 *         description: The queue name
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID
 *     responses:
 *       200:
 *         description: Job status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobStatus'
 *       404:
 *         description: Job not found
 */
router.get(
  "/:queue/:id/status",
  async (req: Request, res: Response) => {
    try {
      const queue = req.params.queue as string;
      const id = req.params.id as string;

      const queueMap: Record<string, typeof emailQueue> = {
        email: emailQueue,
        report: reportQueue,
      };

      const selectedQueue = queueMap[queue];
      if (!selectedQueue) {
        res.status(400).json({ error: "Invalid queue. Use 'email' or 'report'." });
        return;
      }

      const job = await selectedQueue.getJob(id);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      const state = await job.getState();

      res.json({
        jobId: job.id,
        queue,
        state,
        progress: job.progress,
        result: job.returnvalue,
        failedReason: job.failedReason,
        timestamp: new Date(job.timestamp).toISOString(),
        processedOn: job.processedOn
          ? new Date(job.processedOn).toISOString()
          : null,
        finishedOn: job.finishedOn
          ? new Date(job.finishedOn).toISOString()
          : null,
      });
    } catch (error) {
      logger.error("Failed to get job status:", error);
      res.status(500).json({ error: "Failed to get job status" });
    }
  }
);

export { router as jobRoutes };
