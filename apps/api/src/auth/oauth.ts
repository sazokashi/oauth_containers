import OAuth2Server from "@node-oauth/oauth2-server";
import { Request, Response, NextFunction } from "express";
import { storageModel } from "./model.js";
import { env } from "../env.js";
import {
  authenticateRequestScope,
  buildTokenResponse,
  clearBrowserSession,
  createOAuthServer,
  exchangeToken,
  issueStoredTokenForUser,
  persistBrowserSession,
  prepareRefreshGrantRequest,
  readRefreshTokenFromCookies
} from "./services/oauth-service.js";

const oauth = createOAuthServer(storageModel as any);

export const issueToken = () => async (request: Request, response: Response, next: NextFunction) => {
  try {
    const token = await exchangeToken({ oauth, request, response });
    persistBrowserSession(response, token);
    response.json(buildTokenResponse(token));
  } catch (error) {
    next(error);
  }
};

export const refreshBrowserSession = () => async (request: Request, response: Response, next: NextFunction) => {
  try {
    const refreshToken = readRefreshTokenFromCookies(request);
    if (!refreshToken) {
      response.status(401).json({ success: false, message: "No refresh token available." });
      return;
    }

    prepareRefreshGrantRequest(request, refreshToken, env.oauthClientId);
    const token = await exchangeToken({ oauth, request, response });
    persistBrowserSession(response, token);
    response.json(buildTokenResponse(token, true));
  } catch (error) {
    next(error);
  }
};

export const requireScope = (scope: string) => async (request: Request, response: Response, next: NextFunction) => {
  try {
    const authResult = await authenticateRequestScope({ oauth, request, response, scope });

    response.locals.auth = authResult;
    next();
  } catch {
    response.status(401).json({ success: false, message: "Not authorized." });
  }
};

export const endBrowserSession = (response: Response) => {
  clearBrowserSession(response);
};

export const issueTokenForUser = async (user: { email: string; displayName: string; scopes: string[] }) => {
  return issueStoredTokenForUser({
    storageModel,
    clientId: env.oauthClientId,
    user
  });
};
