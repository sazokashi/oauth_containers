import { MongoClient, Db } from "mongodb";
import { env } from "../env.js";

let client: MongoClient | null = null;
let db: Db | null = null;

export const connectMongo = async (): Promise<Db> => {
  if (db) return db;

  client = new MongoClient(env.mongoUrl);
  await client.connect();
  db = client.db(env.mongoDbName);

  await db.collection("oauth_tokens").createIndex({ accessToken: 1 }, { unique: true });
  await db.collection("oauth_tokens").createIndex({ accessTokenExpiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("oauth_clients").createIndex({ clientId: 1 }, { unique: true });
  await db.collection("email_verifications").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("password_resets").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  return db;
};

export const getDb = (): Db => {
  if (!db) {
    throw new Error("MongoDB has not been connected yet.");
  }
  return db;
};
