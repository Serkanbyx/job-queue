import { Router, Request, Response } from "express";
import { redisConnection } from "../config/redis";

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns the health status of the API and Redis connection.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                 redis:
 *                   type: string
 *                   enum: [connected, disconnected]
 *                 timestamp:
 *                   type: string
 *       503:
 *         description: Service is unhealthy
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const redisPing = await redisConnection.ping();

    res.json({
      status: "ok",
      uptime: process.uptime(),
      redis: redisPing === "PONG" ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "error",
      uptime: process.uptime(),
      redis: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as healthRoutes };
