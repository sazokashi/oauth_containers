import bcrypt from "bcrypt";
import { badRequest, notFound } from "../../util/http-response.js";
import { findUserByEmailQuery, insertUserQuery } from "../queries/user-queries.js";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const displayNameFromEmail = (email: string) => {
  const local = email.split("@")[0] || "reader";
  return local
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const ensureUserDoesNotExist = async <T extends { email: string }>(input: T): Promise<T> => {
  const normalizedEmail = normalizeEmail(input.email);

  if (!isValidEmail(normalizedEmail)) {
    badRequest("Please provide a valid email address.");
  }

  const existing = await findUserByEmailQuery(normalizedEmail);
  if (existing) {
    badRequest("An account with that email already exists.");
  }

  return {
    ...input,
    email: normalizedEmail
  };
};

export const normalizeEmailInput = <T extends { email: string }>(input: T): T => {
  const normalizedEmail = normalizeEmail(input.email);

  if (!isValidEmail(normalizedEmail)) {
    badRequest("Please provide a valid email address.");
  }

  return {
    ...input,
    email: normalizedEmail
  };
};

export const createPasswordUser = async <T extends { email: string; password: string; displayName?: string }>(input: T) => {
  if (input.password.length < 10) {
    badRequest("Passwords must be at least 10 characters long.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = {
    email: input.email,
    passwordHash,
    displayName: input.displayName?.trim() || displayNameFromEmail(input.email),
    scopes: ["profile:read", "profile:write"],
    authMethod: "password",
    emailVerified: false,
    createdAt: new Date()
  };

  await insertUserQuery(user);

  return user;
};

export const loadUserForEmail = async <T extends { email: string }>(input: T) => {
  const user = await findUserByEmailQuery(input.email);

  return {
    ...input,
    user: user ?? null
  };
};

export const flagVerificationRequestEligibility = <
  T extends { user: Record<string, any> | null }
>(
  input: T
) => ({
  ...input,
  shouldSend: Boolean(input.user && input.user.authMethod === "password" && input.user.emailVerified !== true)
});

export const flagPasswordResetEligibility = <
  T extends { user: Record<string, any> | null }
>(
  input: T
) => ({
  ...input,
  shouldSend: Boolean(input.user && input.user.authMethod === "password")
});

export const requireExistingUser = <T extends { user: Record<string, any> | null }>(input: T) => {
  if (!input.user) {
    notFound("User not found.");
  }

  return {
    ...input,
    user: input.user
  };
};

export const validateMockProviderToken = <T extends { providerToken: string }>(input: T): T => {
  if (input.providerToken !== "reader-social-token") {
    throw Object.assign(new Error("Mock provider token is invalid."), { status: 401 });
  }

  return input;
};
