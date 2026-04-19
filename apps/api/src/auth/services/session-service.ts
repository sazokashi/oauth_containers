import type { Response } from "express";
import { setBrowserSessionCookies, setRefreshCookie } from "../csrf.js";
import { endBrowserSession, issueTokenForUser } from "../oauth.js";
import { deleteSessionTokens } from "../queries/token-queries.js";
import { listUsersQuery } from "../queries/user-queries.js";

export const issueBrowserSessionForUser = async <
  T extends { user: { email: string; displayName: string; scopes: string[] } }
>(
  input: T,
  response: Response
) => {
  const issued = await issueTokenForUser({
    email: input.user.email,
    displayName: input.user.displayName,
    scopes: input.user.scopes
  });

  setBrowserSessionCookies(response, issued.accessToken);
  if (issued.refreshToken) {
    setRefreshCookie(response, issued.refreshToken);
  }

  return input;
};

export const clearBrowserSessionForRequest = async <
  T extends { auth: { accessToken: string }; refreshToken?: string }
>(
  input: T,
  response: Response
) => {
  await deleteSessionTokens({
    accessToken: input.auth.accessToken,
    refreshToken: input.refreshToken
  });

  endBrowserSession(response);

  return input;
};

export const loadUsers = async <T>(input: T) => ({
  ...input,
  users: await listUsersQuery()
});
