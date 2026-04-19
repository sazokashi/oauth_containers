import { Router } from "express";
import { pipeAsync } from "../../util/fp.js";
import {
  buildLogoutResponse,
  buildSessionResponse,
  buildSocialSignInResponse,
  buildUsersResponse
} from "../transport/account-response.js";
import { parseSocialSignInRequest, validateSocialSignInInput } from "../transport/account-request.js";
import { normalizeEmailInput, validateMockProviderToken } from "../domain/account.js";
import { upsertSocialUser } from "../domain/social.js";
import { issueBrowserSessionForUser, clearBrowserSessionForRequest, loadUsers } from "../services/session-service.js";
import { requireScope } from "../oauth.js";
import { refreshCookieName } from "../csrf.js";

export const sessionRouter = Router();

sessionRouter.post("/social/mock", async (request, response, next) => {
  try {
    const result = await pipeAsync(
      parseSocialSignInRequest,
      validateSocialSignInInput,
      normalizeEmailInput,
      validateMockProviderToken,
      upsertSocialUser,
      async (input) => issueBrowserSessionForUser(input, response),
      buildSocialSignInResponse
    )(request);

    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});

sessionRouter.get("/session/me", requireScope("profile:read"), async (_request, response, next) => {
  try {
    const result = await pipeAsync(
      () => ({ user: response.locals.auth.user }),
      buildSessionResponse
    )(undefined);

    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});

sessionRouter.post("/session/logout", requireScope("profile:read"), async (request, response, next) => {
  try {
    const result = await pipeAsync(
      () => ({
        auth: response.locals.auth,
        refreshToken: request.cookies?.[refreshCookieName]
      }),
      async (input) => clearBrowserSessionForRequest(input, response),
      buildLogoutResponse
    )(undefined);

    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});

sessionRouter.get("/users", requireScope("profile:read"), async (_request, response, next) => {
  try {
    const result = await pipeAsync(
      () => ({}),
      loadUsers,
      buildUsersResponse
    )(undefined);

    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});
