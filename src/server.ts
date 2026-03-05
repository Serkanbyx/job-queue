import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

import "./workers/emailWorker";
import "./workers/reportWorker";

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
  logger.info(`Swagger docs: http://localhost:${env.PORT}/api-docs`);
  logger.info(`Bull Board: http://localhost:${env.PORT}/admin/queues`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});
