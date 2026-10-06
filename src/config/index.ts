import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().url().optional(),
  REDIS_URL: z.string().url(),
  PORT: z
    .string()
    .default("3000")
    .transform((val) => Number(val)),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  ACCESS_TOKEN_NAME: z.string().default("access_token"),
  REFRESH_TOKEN_NAME: z.string().default("refresh_token"),
  ACCESS_TOKEN_EXPIRATION: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRATION: z.string().default("7d"),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters long"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters long"),

  EMAIL_HOST: z.string().default("smtp.mailtrap.io"),
  EMAIL_PORT: z
    .string()
    .default("587")
    .transform((val) => Number(val)),
  EMAIL_USER: z.string().default("your_email@example.com"),
  EMAIL_PASSWORD: z.string().default("your_email_password"),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  RESEND_API_KEY: z
    .string()
    .min(32, "RESEND_API_KEY must be at least 32 characters long"),
  OTP_HMAC_SECRET: z.string().min(32),
});

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
export type Env = typeof env;
