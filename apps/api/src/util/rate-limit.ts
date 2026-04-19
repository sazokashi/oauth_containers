import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { connectRedis } from "../db/redis.js";

const createLimiter = ({
  windowMs,
  max,
  prefix
}: {
  windowMs: number;
  max: number;
  prefix: string;
}) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later." },
    ...(process.env.NODE_ENV === "test"
      ? {}
      : {
          store: new RedisStore({
            prefix: `${prefix}:`,
            sendCommand: async (...args: string[]) => (await connectRedis()).sendCommand(args)
          })
        })
  });

export const generalApiLimiter = createLimiter({ windowMs: 60_000, max: 120, prefix: "limit:api" });
export const loginLimiter = createLimiter({ windowMs: 15 * 60_000, max: 10, prefix: "limit:login" });
export const registrationLimiter = createLimiter({ windowMs: 60 * 60_000, max: 10, prefix: "limit:registration" });
export const emailActionLimiter = createLimiter({ windowMs: 60 * 60_000, max: 12, prefix: "limit:email" });
