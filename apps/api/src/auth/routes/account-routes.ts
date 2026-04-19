import { Router } from "express";
import { emailActionLimiter, registrationLimiter } from "../../util/rate-limit.js";
import { pipeAsync } from "../../util/fp.js";
import {
  parseEmailRequest,
  parsePasswordResetRequest,
  parseRegistrationRequest,
  parseVerificationConfirmRequest,
  validateEmailInput,
  validateEmailTokenInput,
  validatePasswordResetInput,
  validateRegistrationInput
} from "../transport/account-request.js";
import {
  createPasswordUser,
  ensureUserDoesNotExist,
  flagPasswordResetEligibility,
  flagVerificationRequestEligibility,
  loadUserForEmail,
  normalizeEmailInput,
  requireExistingUser
} from "../domain/account.js";
import {
  createResetForEligibleUser,
  createVerificationForEligibleUser,
  createVerificationForUser,
  consumeResetToken,
  consumeVerificationToken
} from "../services/token-record-service.js";
import {
  deliverPasswordResetEmailIfEligible,
  deliverVerificationEmail,
  deliverVerificationEmailIfEligible
} from "../services/mailer-service.js";
import {
  buildPasswordResetConfirmResponse,
  buildPasswordResetRequestResponse,
  buildRegistrationResponse,
  buildVerificationConfirmResponse,
  buildVerificationRequestResponse
} from "../transport/account-response.js";
import { markUserEmailVerified, updateUserPassword } from "../users.js";
import { issueBrowserSessionForUser } from "../services/session-service.js";

export const accountRouter = Router();

accountRouter.post("/users/register", registrationLimiter, async (request, response, next) => {
  try {
    const result = await pipeAsync(
      parseRegistrationRequest,
      validateRegistrationInput,
      ensureUserDoesNotExist,
      createPasswordUser,
      createVerificationForUser,
      deliverVerificationEmail,
      buildRegistrationResponse
    )(request);

    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});

accountRouter.post("/users/verify/request", emailActionLimiter, async (request, response, next) => {
  try {
    const result = await pipeAsync(
      parseEmailRequest,
      validateEmailInput,
      normalizeEmailInput,
      loadUserForEmail,
      flagVerificationRequestEligibility,
      createVerificationForEligibleUser,
      deliverVerificationEmailIfEligible,
      buildVerificationRequestResponse
    )(request);

    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});

accountRouter.post("/users/verify/confirm", emailActionLimiter, async (request, response, next) => {
  try {
    const result = await pipeAsync(
      parseVerificationConfirmRequest,
      validateEmailTokenInput,
      normalizeEmailInput,
      consumeVerificationToken,
      loadUserForEmail,
      requireExistingUser,
      async (input) => {
        await markUserEmailVerified(input.email);
        return input;
      },
      async (input) => issueBrowserSessionForUser(input, response),
      buildVerificationConfirmResponse
    )(request);

    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});

accountRouter.post("/password/forgot", emailActionLimiter, async (request, response, next) => {
  try {
    const result = await pipeAsync(
      parseEmailRequest,
      validateEmailInput,
      normalizeEmailInput,
      loadUserForEmail,
      flagPasswordResetEligibility,
      createResetForEligibleUser,
      deliverPasswordResetEmailIfEligible,
      buildPasswordResetRequestResponse
    )(request);

    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});

accountRouter.post("/password/reset", emailActionLimiter, async (request, response, next) => {
  try {
    const result = await pipeAsync(
      parsePasswordResetRequest,
      validatePasswordResetInput,
      normalizeEmailInput,
      consumeResetToken,
      async (input) => {
        await updateUserPassword({
          email: input.email,
          password: input.password
        });

        return input;
      },
      buildPasswordResetConfirmResponse
    )(request);

    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});
