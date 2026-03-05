import express from "express";
import swaggerUi from "swagger-ui-express";
import basicAuth from "express-basic-auth";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { serverAdapter } from "./config/bullBoard";
import { securityRouter } from "./middlewares/security";
import { jobRoutes } from "./routes/jobRoutes";
import { healthRoutes } from "./routes/healthRoutes";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(securityRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (env.NODE_ENV === "production") {
  app.use(
    "/admin/queues",
    basicAuth({
      users: { [env.BULL_BOARD_USER]: env.BULL_BOARD_PASSWORD },
      challenge: true,
    }),
    serverAdapter.getRouter()
  );
} else {
  app.use("/admin/queues", serverAdapter.getRouter());
}

app.use("/api/jobs", jobRoutes);
app.use("/api/health", healthRoutes);

app.get("/", (_req, res) => {
  res.json({
    name: "BullMQ Job Queue API",
    version: "1.0.0",
    docs: "/api-docs",
    monitoring: "/admin/queues",
    health: "/api/health",
  });
});

export { app };
