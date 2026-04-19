import bcrypt from "bcrypt";
import { getDb } from "../db/mongo.js";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password: string) => {
  return password.length >= 10;
};

const displayNameFromEmail = (email: string) => {
  const local = email.split("@")[0] || "reader";
  return local
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const findUserByEmail = async (email: string) => {
  return getDb().collection("users").findOne({ email: normalizeEmail(email) });
};

export const createLocalUser = async ({
  email,
  password,
  displayName
}: {
  email: string;
  password: string;
  displayName?: string;
}) => {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Please provide a valid email address.");
  }

  if (!isValidPassword(password)) {
    throw new Error("Passwords must be at least 10 characters long.");
  }

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email: normalizedEmail,
    passwordHash,
    displayName: displayName?.trim() || displayNameFromEmail(normalizedEmail),
    scopes: ["profile:read", "profile:write"],
    authMethod: "password",
    emailVerified: false,
    createdAt: new Date()
  };

  await getDb().collection("users").insertOne(user);
  return user;
};

export const upsertMockSocialUser = async ({
  email,
  provider
}: {
  email: string;
  provider: string;
}) => {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Please provide a valid email address.");
  }

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    await getDb().collection("users").updateOne(
      { email: normalizedEmail },
      {
        $set: {
          authMethod: provider,
          updatedAt: new Date()
        }
      }
    );

    return {
      ...existing,
      authMethod: provider
    };
  }

  const user = {
    email: normalizedEmail,
    passwordHash: "",
    displayName: displayNameFromEmail(normalizedEmail),
    scopes: ["profile:read", "profile:write"],
    authMethod: provider,
    emailVerified: true,
    createdAt: new Date()
  };

  await getDb().collection("users").insertOne(user);
  return user;
};

export const markUserEmailVerified = async (email: string) => {
  await getDb().collection("users").updateOne(
    { email: normalizeEmail(email) },
    { $set: { emailVerified: true, updatedAt: new Date() } }
  );
};

export const updateUserPassword = async ({
  email,
  password
}: {
  email: string;
  password: string;
}) => {
  const normalizedEmail = normalizeEmail(email);

  if (!isValidPassword(password)) {
    throw new Error("Passwords must be at least 10 characters long.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await getDb().collection("users").updateOne(
    { email: normalizedEmail },
    { $set: { passwordHash, updatedAt: new Date() } }
  );
};
