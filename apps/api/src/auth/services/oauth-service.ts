import { randomUUID } from "crypto";
import type { Request, Response } from "express";
import OAuth2Server from "@node-oauth/oauth2-server";
import { clearBrowserSessionCookies, refreshCookieName, setBrowserSessionCookies, setRefreshCookie } from "../csrf.js";

type OAuthTokenResult = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date;
  scope?: string | string[];
};

type OAuthUser = {
  email: string;
  displayName: string;
  scopes: string[];
};

type OAuthClient = {
  id: string;
  grants: string[];
};

type StorageModelLike = {
  getClient: (clientId: string, clientSecret: string) => Promise<OAuthClient | false>;
  saveToken: (token: Record<string, unknown>, client: OAuthClient, user: OAuthUser) => Promise<any>;
};

export const createOAuthServer = (model: any) =>
  new OAuth2Server({
    model,
    accessTokenLifetime: 60 * 60 * 24 * 7,
    requireClientAuthentication: {
      password: false,
      refresh_token: false
    }
  });

export const persistBrowserSession = (response: Response, token: OAuthTokenResult) => {
  setBrowserSessionCookies(response, token.accessToken);
  if (token.refreshToken) {
    setRefreshCookie(response, token.refreshToken);
  }
};

export const clearBrowserSession = (response: Response) => {
  clearBrowserSessionCookies(response);
};

export const buildTokenResponse = (token: OAuthTokenResult, includeSuccess = false) => ({
  ...(includeSuccess ? { success: true } : {}),
  accessToken: token.accessToken,
  refreshToken: token.refreshToken,
  expiresAt: token.accessTokenExpiresAt,
  scope: token.scope
});

export const prepareRefreshGrantRequest = (request: Request, refreshToken: string, clientId: string) => {
  request.body = {
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken
  };
  request.headers["content-type"] = "application/x-www-form-urlencoded";

  return request;
};

export const readRefreshTokenFromCookies = (request: Request) => request.cookies?.[refreshCookieName] as string | undefined;

export const authenticateRequestScope = async ({
  oauth,
  request,
  response,
  scope
}: {
  oauth: OAuth2Server;
  request: Request;
  response: Response;
  scope: string;
}) => {
  return oauth.authenticate(
    new OAuth2Server.Request(request),
    new OAuth2Server.Response(response),
    { scope: [scope] }
  );
};

export const exchangeToken = async ({
  oauth,
  request,
  response
}: {
  oauth: OAuth2Server;
  request: Request;
  response: Response;
}) => {
  return oauth.token(
    new OAuth2Server.Request(request),
    new OAuth2Server.Response(response)
  );
};

export const issueStoredTokenForUser = async ({
  storageModel,
  clientId,
  user,
  now = () => new Date(),
  createId = () => randomUUID()
}: {
  storageModel: StorageModelLike;
  clientId: string;
  user: OAuthUser;
  now?: () => Date;
  createId?: () => string;
}) => {
  const client = await storageModel.getClient(clientId, "");
  if (!client) {
    throw new Error("OAuth client is not configured.");
  }

  const expiresAt = new Date(now().getTime() + 1000 * 60 * 60 * 24 * 7);

  return storageModel.saveToken(
    {
      accessToken: createId(),
      accessTokenExpiresAt: expiresAt,
      refreshToken: createId(),
      refreshTokenExpiresAt: expiresAt,
      scope: user.scopes
    },
    client,
    user
  );
};
