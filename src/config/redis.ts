import IORedis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

export const redisConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null as null,
  retryStrategy(times: number) {
    return Math.min(times * 200, 5000);
  },
  ...(env.REDIS_TLS && { tls: {} }),
};

export const redisConnection = new IORedis(redisConnectionOptions);

redisConnection.on("connect", () => {
  logger.info("Redis connected successfully");
});

redisConnection.on("error", (err) => {
  logger.error("Redis connection error:", err);
});
