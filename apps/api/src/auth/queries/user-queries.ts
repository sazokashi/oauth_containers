import { getDb } from "../../db/mongo.js";

export const findUserByEmailQuery = (email: string) =>
  getDb().collection("users").findOne({ email });

export const insertUserQuery = (user: Record<string, unknown>) =>
  getDb().collection("users").insertOne(user);

export const listUsersQuery = () =>
  getDb()
    .collection("users")
    .find({}, { projection: { _id: 0, passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
