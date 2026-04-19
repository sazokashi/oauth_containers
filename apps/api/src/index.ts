import { app } from "./app.js";
import { env } from "./env.js";
import { connectMongo } from "./db/mongo.js";
import { connectRedis } from "./db/redis.js";
import { seedAuthData } from "./auth/seed.js";
import { logger } from "./util/logger.js";

const start = async () => {
  await connectMongo();
  await connectRedis();
  await seedAuthData();

  const server = app.listen(env.apiPort, () => {
    logger.info("api.started", { port: env.apiPort, origin: env.webOrigin });
  });

  const shutdown = (signal: string) => {
    logger.info("api.shutting_down", { signal });
    server.close(() => {
      logger.info("api.stopped");
      process.exit(0);
    });
    setTimeout(() => {
      logger.warn("api.forced_shutdown", { reason: "timeout after 10s" });
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((error) => {
  logger.error("api.start_failed", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});
