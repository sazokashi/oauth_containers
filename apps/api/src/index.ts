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

  app.listen(env.apiPort, () => {
    logger.info("api.started", { port: env.apiPort, origin: env.webOrigin });
  });
};

start().catch((error) => {
  logger.error("api.start_failed", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});
