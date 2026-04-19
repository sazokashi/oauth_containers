import bcrypt from "bcrypt";
import { getDb } from "../db/mongo.js";
import { env } from "../env.js";

export const seedAuthData = async () => {
  const db = getDb();

  await db.collection("oauth_clients").updateOne(
    { clientId: env.oauthClientId },
    {
      $setOnInsert: {
        clientId: env.oauthClientId,
        clientSecret: env.oauthClientSecret,
        publicClient: true,
        grants: ["password"],
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  const passwordHash = await bcrypt.hash(env.demoPassword, 10);

  await db.collection("users").updateOne(
    { email: env.demoEmail },
    {
      $setOnInsert: {
        email: env.demoEmail,
        passwordHash,
        displayName: "Example Reader",
        scopes: ["profile:read", "profile:write"],
        createdAt: new Date()
      }
    },
    { upsert: true }
  );
};
