import { createClient } from "redis";
import { env } from "../env.js";

let redis: ReturnType<typeof createClient> | null = null;
let redisConnectPromise: Promise<ReturnType<typeof createClient>> | null = null;

export const connectRedis = async () => {
  if (!redis) {
    redis = createClient({ url: env.redisUrl });
    redis.on("error", (error) => {
      console.error("Redis error", error);
    });
  }

  if (redis.isOpen) {
    return redis;
  }

  if (!redisConnectPromise) {
    redisConnectPromise = redis.connect().then(() => redis as ReturnType<typeof createClient>).finally(() => {
      redisConnectPromise = null;
    });
  }

  return redisConnectPromise;
};

export const getRedis = () => {
  if (!redis) {
    throw new Error("Redis has not been connected yet.");
  }
  return redis;
};
