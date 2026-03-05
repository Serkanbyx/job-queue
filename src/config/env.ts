import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(""),
  REDIS_TLS: z
    .string()
    .default("false")
    .transform((val) => val === "true"),

  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((val) => val.split(",")),

  BULL_BOARD_USER: z.string().default("admin"),
  BULL_BOARD_PASSWORD: z.string().default("change_me_in_production"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;
