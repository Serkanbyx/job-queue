# ⚡ BullMQ Job Queue API

A production-ready background job processing REST API built with **BullMQ**, **Redis**, **Express**, and **TypeScript**. Supports asynchronous email sending via Ethereal test SMTP and PDF/CSV report generation with real-time job status tracking, Swagger documentation, and Bull Board monitoring.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **Email Queue** - Asynchronous email sending with Nodemailer + Ethereal test SMTP and preview URLs
- **Report Queue** - PDF and CSV report generation from structured data using PDFKit and json2csv
- **Real-Time Job Status Tracking** - Poll job state, progress percentage, results, and failure reasons
- **Swagger Documentation** - Interactive API docs with request/response examples at `/api-docs`
- **Bull Board Dashboard** - Visual job monitoring and management panel at `/admin/queues`
- **Security Hardened** - Helmet, CORS, rate limiting, input validation (Zod), HPP protection
- **Retry & Backoff** - Automatic retries with exponential backoff on job failures
- **Graceful Shutdown** - Clean process termination with worker draining
- **Render-Ready** - One-click deployment with `render.yaml` blueprint

## Live Demo

[⚡ View Live Demo](https://job-queue-f62a.onrender.com/)

| URL | Description |
| --- | --- |
| [API Root](https://job-queue-f62a.onrender.com/) | API info endpoint |
| [Swagger Docs](https://job-queue-f62a.onrender.com/api-docs) | Interactive API documentation |
| [Bull Board](https://job-queue-f62a.onrender.com/admin/queues) | Job monitoring dashboard |
| [Health Check](https://job-queue-f62a.onrender.com/api/health) | Service & Redis health status |

## Technologies

- **Node.js + TypeScript** - Type-safe runtime with ES2022 features and strict mode
- **Express.js** - Minimal and flexible web framework for REST API
- **BullMQ** - High-performance Redis-backed job queue for Node.js
- **Redis (ioredis)** - In-memory data store used as message broker and job persistence
- **Nodemailer + Ethereal** - Email sending with test SMTP for safe development
- **PDFKit** - PDF document generation for report exports
- **json2csv** - JSON to CSV conversion for tabular report exports
- **Zod** - TypeScript-first schema validation for request payloads
- **swagger-jsdoc + swagger-ui-express** - Auto-generated OpenAPI documentation
- **@bull-board/express** - Real-time visual dashboard for queue monitoring
- **Helmet** - Secure HTTP headers middleware
- **CORS + HPP** - Cross-origin resource sharing and HTTP parameter pollution protection
- **express-rate-limit** - API rate limiting (100 requests per 15 minutes)
- **express-basic-auth** - Basic authentication for Bull Board in production
- **Winston** - Structured logging with multiple transports

## Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **Redis** server running locally or remotely

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/Serkanbyx/s3.15_Job-Queue.git
cd s3.15_Job-Queue
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

4. Start Redis (if not already running):

**Using Docker:**

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

**Using Homebrew (macOS):**

```bash
brew services start redis
```

**Using WSL/Ubuntu:**

```bash
sudo service redis-server start
```

5. Start the development server:

```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000/api-docs` to explore the API.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. Start the server and navigate to the **Swagger UI** at `/api-docs`
2. Submit an **email job** by sending a POST request to `/api/jobs/email` with recipient, subject, and body
3. Submit a **report job** by sending a POST request to `/api/jobs/report` with type (pdf/csv), title, and data array
4. Track job progress by polling `/api/jobs/:queue/:id/status` with the returned job ID
5. Monitor all queues visually through the **Bull Board** at `/admin/queues`

## How It Works?

### Architecture Overview

```
Client Request → Express (Validation + Security) → BullMQ Queue → Redis
                                                         ↓
                                                   BullMQ Worker
                                                         ↓
                                              Service (Email / Report)
                                                         ↓
                                              Result stored in Redis
                                                         ↓
                                          Client polls /status endpoint
```

### Email Processing Flow

When an email job is submitted, it gets added to the **email queue** with 3 retry attempts and exponential backoff (2s base). The email worker (concurrency: 5, rate limit: 10 jobs/sec) processes the job using Nodemailer with Ethereal test SMTP, returning a preview URL for verification.

### Report Generation Flow

Report jobs support **PDF** and **CSV** formats. The report worker (concurrency: 3) generates documents using PDFKit or json2csv and saves them to the `reports/` directory. Each job supports up to 10,000 data objects.

### Queue Configuration

| Queue | Retries | Backoff | Completed TTL | Failed TTL |
| --- | --- | --- | --- | --- |
| Email | 3 attempts | 2s exponential | 24h / 1000 jobs | 7 days |
| Report | 2 attempts | 3s exponential | 24h / 500 jobs | 7 days |

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

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment (development / production / test) |
| `REDIS_HOST` | localhost | Redis server hostname |
| `REDIS_PORT` | 6379 | Redis server port |
| `REDIS_PASSWORD` | - | Redis authentication password |
| `REDIS_TLS` | false | Enable TLS for Redis connection |
| `CORS_ORIGINS` | http://localhost:3000 | Comma-separated allowed CORS origins |
| `BULL_BOARD_USER` | admin | Bull Board basic auth username |
| `BULL_BOARD_PASSWORD` | - | Bull Board basic auth password |

## Project Structure

```
src/
├── config/
│   ├── env.ts              # Environment validation (Zod)
│   ├── redis.ts            # Redis connection config
│   ├── swagger.ts          # Swagger/OpenAPI setup
│   └── bullBoard.ts        # Bull Board dashboard setup
├── queues/
│   ├── emailQueue.ts       # Email queue definition & options
│   └── reportQueue.ts      # Report queue definition & options
├── workers/
│   ├── emailWorker.ts      # Email processing worker
│   └── reportWorker.ts     # Report generation worker
├── routes/
│   ├── jobRoutes.ts        # Job submission & status endpoints
│   └── healthRoutes.ts     # Health check endpoint
├── middlewares/
│   ├── security.ts         # Helmet, CORS, rate-limit, HPP
│   └── validate.ts         # Zod validation middleware
├── schemas/
│   ├── emailSchema.ts      # Email payload schema
│   └── reportSchema.ts     # Report payload schema
├── services/
│   ├── emailService.ts     # Nodemailer + Ethereal integration
│   └── reportService.ts    # PDFKit + json2csv generation
├── utils/
│   └── logger.ts           # Winston logger configuration
├── app.ts                  # Express app setup & middleware
└── server.ts               # Entry point & graceful shutdown
```

## Security

- **Helmet** - Sets secure HTTP headers (XSS, CSP, HSTS, etc.)
- **CORS** - Configurable origin whitelist via `CORS_ORIGINS`
- **Rate Limiting** - 100 requests per 15 minutes on job submission routes
- **HPP** - HTTP Parameter Pollution protection
- **Zod Validation** - Strict input validation on all request payloads
- **Bull Board Auth** - Basic authentication protection in production
- **No Secrets in Code** - All credentials managed via environment variables

## Deploy to Render

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** > **Blueprint**
4. Connect your repository
5. Render will auto-detect `render.yaml` and provision both the web service and Redis instance
6. Set the required environment variables in the Render dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes using semantic format:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `refactor:` - Code refactoring
   - `docs:` - Documentation changes
   - `chore:` - Maintenance tasks
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Developer

**Serkanby**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

## Contact

- [Open an Issue](https://github.com/Serkanbyx/s3.15_Job-Queue/issues)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
