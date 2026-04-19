import { getDb } from "../db/mongo.js";
import { randomToken } from "../util/mailer.js";
import { addMinutes } from "./util-time.js";

export const createVerificationRecord = async (email: string) => {
  const token = randomToken();
  await getDb().collection("email_verifications").deleteMany({ email });
  await getDb().collection("email_verifications").insertOne({
    email,
    token,
    expiresAt: addMinutes(60),
    createdAt: new Date()
  });
  return token;
};

export const consumeVerificationRecord = async (email: string, token: string) => {
  const found = await getDb().collection("email_verifications").findOne({ email, token });
  if (!found || found.expiresAt < new Date()) return false;
  await getDb().collection("email_verifications").deleteMany({ email });
  return true;
};

export const createResetRecord = async (email: string) => {
  const token = randomToken();
  await getDb().collection("password_resets").deleteMany({ email });
  await getDb().collection("password_resets").insertOne({
    email,
    token,
    expiresAt: addMinutes(30),
    createdAt: new Date()
  });
  return token;
};

export const consumeResetRecord = async (email: string, token: string) => {
  const found = await getDb().collection("password_resets").findOne({ email, token });
  if (!found || found.expiresAt < new Date()) return false;
  await getDb().collection("password_resets").deleteMany({ email });
  return true;
};
