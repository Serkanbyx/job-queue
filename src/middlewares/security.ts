import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { env } from "../config/env";
import { Router } from "express";

const securityRouter = Router();

securityRouter.use(helmet());

securityRouter.use(
  cors({
    origin: env.CORS_ORIGINS,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

securityRouter.use(hpp());

export const jobRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again after 15 minutes.",
  },
});

export { securityRouter };
