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
  const { version } = require("../package.json");

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BullMQ Job Queue API</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
      background: #0b0e17;
      color: #e2e8f0;
      overflow: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 600px 400px at 20% 30%, rgba(56, 189, 248, 0.08) 0%, transparent 70%),
        radial-gradient(ellipse 500px 350px at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 70%),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 60px,
          rgba(56, 189, 248, 0.015) 60px,
          rgba(56, 189, 248, 0.015) 61px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 60px,
          rgba(139, 92, 246, 0.015) 60px,
          rgba(139, 92, 246, 0.015) 61px
        );
      z-index: 0;
    }

    .container {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 3rem 2.5rem;
      max-width: 520px;
      width: 90%;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(56, 189, 248, 0.12);
      border-radius: 20px;
      backdrop-filter: blur(16px);
      box-shadow:
        0 0 60px rgba(56, 189, 248, 0.06),
        0 25px 50px rgba(0, 0, 0, 0.4);
    }

    .queue-icon {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 1.5rem;
    }

    .queue-icon span {
      width: 10px;
      height: 28px;
      border-radius: 3px;
      animation: pulse 1.8s ease-in-out infinite;
    }

    .queue-icon span:nth-child(1) { background: #38bdf8; animation-delay: 0s; }
    .queue-icon span:nth-child(2) { background: #818cf8; animation-delay: 0.2s; }
    .queue-icon span:nth-child(3) { background: #a78bfa; animation-delay: 0.4s; }
    .queue-icon span:nth-child(4) { background: #c084fc; animation-delay: 0.6s; }
    .queue-icon span:nth-child(5) { background: #e879f9; animation-delay: 0.8s; }

    @keyframes pulse {
      0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
      50% { transform: scaleY(1); opacity: 1; }
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .version {
      font-size: 0.85rem;
      font-family: "Cascadia Code", "Fira Code", monospace;
      color: #64748b;
      letter-spacing: 1.5px;
      margin-bottom: 2rem;
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
    }

    .links a {
      display: block;
      padding: 0.8rem 1.5rem;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      letter-spacing: 0.3px;
      transition: all 0.25s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      color: #0f172a;
      box-shadow: 0 4px 20px rgba(56, 189, 248, 0.25);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(56, 189, 248, 0.35);
    }

    .btn-secondary {
      background: rgba(56, 189, 248, 0.08);
      color: #94a3b8;
      border: 1px solid rgba(56, 189, 248, 0.15);
    }

    .btn-secondary:hover {
      background: rgba(56, 189, 248, 0.14);
      color: #e2e8f0;
      border-color: rgba(56, 189, 248, 0.3);
      transform: translateY(-2px);
    }

    .sign {
      font-size: 0.8rem;
      color: #475569;
      letter-spacing: 0.3px;
    }

    .sign a {
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .sign a:hover { color: #38bdf8; }

    @media (max-width: 480px) {
      .container { padding: 2rem 1.5rem; }
      h1 { font-size: 1.4rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="queue-icon">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
    <h1>BullMQ Job Queue API</h1>
    <p class="version">v${version}</p>
    <div class="links">
      <a href="/api-docs" class="btn-primary">API Documentation</a>
      <a href="/admin/queues" class="btn-secondary">Queue Dashboard</a>
      <a href="/api/health" class="btn-secondary">Health Check</a>
    </div>
    <footer class="sign">
      Created by
      <a href="https://serkanbayraktar.com/" target="_blank" rel="noopener noreferrer">Serkanby</a>
      |
      <a href="https://github.com/Serkanbyx" target="_blank" rel="noopener noreferrer">Github</a>
    </footer>
  </div>
</body>
</html>`);
});

export { app };
