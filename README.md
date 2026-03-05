# BullMQ Job Queue API

A production-ready background job processing REST API built with **BullMQ**, **Redis**, **Express**, and **TypeScript**. Supports email sending (via Ethereal test SMTP) and report generation (PDF/CSV) with real-time job status tracking.

## Features

- **Email Queue** - Asynchronous email sending with Ethereal test SMTP and preview URLs
- **Report Queue** - PDF and CSV report generation from structured data
- **Job Status Tracking** - Real-time status, progress, and result polling
- **Swagger Documentation** - Interactive API docs at `/api-docs`
- **Bull Board** - Visual job monitoring dashboard at `/admin/queues`
- **Security Hardened** - Helmet, CORS, rate limiting, input validation (Zod), HPP
- **Render-Ready** - One-click deployment with `render.yaml` blueprint

## Tech Stack

| Layer        | Technology                         |
| ------------ | ---------------------------------- |
| Runtime      | Node.js + TypeScript               |
| Framework    | Express.js                         |
| Queue        | BullMQ                             |
| Cache/Broker | Redis (via ioredis)                |
| Email        | Nodemailer + Ethereal              |
| Reports      | PDFKit (PDF), json2csv (CSV)       |
| Docs         | swagger-jsdoc + swagger-ui-express |
| Monitoring   | @bull-board/express                |
| Validation   | Zod                                |
| Security     | Helmet, CORS, express-rate-limit   |
| Logging      | Winston                            |

## Prerequisites

- **Node.js** >= 18.0.0
- **Redis** server running locally or remotely

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd s3.15_Job\ Queue
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings. For local development, defaults work out of the box if Redis is running on `localhost:6379`.

### 3. Start Redis

If you don't have Redis installed locally, use Docker:

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

### 4. Run Development Server

```bash
npm run dev
```

The server starts at `http://localhost:3000`.

### 5. Explore

| URL                                  | Description              |
| ------------------------------------ | ------------------------ |
| http://localhost:3000                | API info                 |
| http://localhost:3000/api-docs       | Swagger UI               |
| http://localhost:3000/admin/queues   | Bull Board (monitoring)  |
| http://localhost:3000/api/health     | Health check             |

## API Endpoints

### Submit Email Job

```bash
curl -X POST http://localhost:3000/api/jobs/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Welcome!",
    "body": "<h1>Hello</h1><p>Welcome to our platform.</p>"
  }'
```

**Response:**
```json
{
  "message": "Email job queued successfully",
  "jobId": "1",
  "queue": "email"
}
```

### Submit Report Job

```bash
curl -X POST http://localhost:3000/api/jobs/report \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pdf",
    "title": "Monthly Sales Report",
    "data": [
      { "name": "Product A", "quantity": 150, "revenue": 4500 },
      { "name": "Product B", "quantity": 89, "revenue": 2670 }
    ]
  }'
```

**Response:**
```json
{
  "message": "Report job queued successfully",
  "jobId": "1",
  "queue": "report"
}
```

### Check Job Status

```bash
curl http://localhost:3000/api/jobs/email/1/status
```

**Response:**
```json
{
  "jobId": "1",
  "queue": "email",
  "state": "completed",
  "progress": 100,
  "result": {
    "messageId": "<abc123@ethereal.email>",
    "previewUrl": "https://ethereal.email/message/..."
  },
  "failedReason": null,
  "timestamp": "2026-03-05T12:00:00.000Z",
  "processedOn": "2026-03-05T12:00:01.000Z",
  "finishedOn": "2026-03-05T12:00:02.000Z"
}
```

## Production Build

```bash
npm run build
npm start
```

## Deploy to Render

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** > **Blueprint**
4. Connect your repository
5. Render will auto-detect `render.yaml` and provision both the web service and Redis instance

## Project Structure

```
src/
├── config/
│   ├── env.ts              # Environment validation (Zod)
│   ├── redis.ts            # Redis connection config
│   ├── swagger.ts          # Swagger setup
│   └── bullBoard.ts        # Bull Board setup
├── queues/
│   ├── emailQueue.ts       # Email queue definition
│   └── reportQueue.ts      # Report queue definition
├── workers/
│   ├── emailWorker.ts      # Email processing worker
│   └── reportWorker.ts     # Report generation worker
├── routes/
│   ├── jobRoutes.ts        # Job submission endpoints
│   └── healthRoutes.ts     # Health check endpoint
├── middlewares/
│   ├── security.ts         # Helmet, CORS, rate-limit, HPP
│   └── validate.ts         # Zod validation middleware
├── schemas/
│   ├── emailSchema.ts      # Email job validation
│   └── reportSchema.ts     # Report job validation
├── services/
│   ├── emailService.ts     # Nodemailer + Ethereal
│   └── reportService.ts    # PDFKit + json2csv
├── utils/
│   └── logger.ts           # Winston logger
├── app.ts                  # Express app setup
└── server.ts               # Entry point
```

## Security

- **Helmet** - Sets secure HTTP headers
- **CORS** - Configurable origin whitelist
- **Rate Limiting** - 100 requests per 15 minutes on job submission
- **HPP** - HTTP Parameter Pollution protection
- **Zod Validation** - Strict input validation on all payloads
- **Bull Board Auth** - Basic auth protection in production
- **No Secrets in Code** - All credentials via environment variables

## License

MIT
