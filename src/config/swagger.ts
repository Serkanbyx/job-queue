import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BullMQ Job Queue API",
      version: "1.0.0",
      description:
        "A production-ready Job Queue REST API using BullMQ + Redis. Supports background email sending and report generation with real-time job status tracking.",
      contact: {
        name: "Serkanby",
        url: "https://serkanbayraktar.com/",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Local Development",
      },
    ],
    tags: [
      { name: "Jobs", description: "Job submission and status tracking" },
      { name: "Health", description: "Service health check" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
