import {
  consumeResetRecord,
  consumeVerificationRecord,
  createResetRecord,
  createVerificationRecord
} from "../token-records.js";
import { badRequest } from "../../util/http-response.js";

export const createVerificationForUser = async <T extends { email: string }>(user: T) => {
  const verificationToken = await createVerificationRecord(user.email);

  return {
    user,
    verificationToken
  };
};

export const createVerificationForEligibleUser = async <
  T extends { user: Record<string, any> | null; shouldSend?: boolean }
>(
  input: T
) => {
  if (!input.shouldSend || !input.user) {
    return input;
  }

  const verificationToken = await createVerificationRecord(input.user.email);

  return {
    ...input,
    verificationToken
  };
};

export const consumeVerificationToken = async <T extends { email: string; token: string }>(input: T) => {
  const ok = await consumeVerificationRecord(input.email, input.token);

  if (!ok) {
    badRequest("Verification token is invalid or expired.");
  }

  return input;
};

export const createResetForEligibleUser = async <
  T extends { user: Record<string, any> | null; shouldSend?: boolean }
>(
  input: T
) => {
  if (!input.shouldSend || !input.user) {
    return input;
  }

  const resetToken = await createResetRecord(input.user.email);

  return {
    ...input,
    resetToken
  };
};

export const consumeResetToken = async <T extends { email: string; token: string }>(input: T) => {
  const ok = await consumeResetRecord(input.email, input.token);

  if (!ok) {
    badRequest("Reset token is invalid or expired.");
  }

  return input;
};
