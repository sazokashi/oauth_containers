import test from "node:test";
import assert from "node:assert/strict";
import type { Request } from "express";
import {
  buildTokenResponse,
  issueStoredTokenForUser,
  prepareRefreshGrantRequest
} from "../src/auth/services/oauth-service.js";

test("buildTokenResponse optionally includes success metadata", () => {
  const token = {
    accessToken: "access-1",
    refreshToken: "refresh-1",
    accessTokenExpiresAt: new Date("2026-04-15T00:00:00.000Z"),
    scope: ["profile:read"]
  };

  assert.deepEqual(buildTokenResponse(token), {
    accessToken: "access-1",
    refreshToken: "refresh-1",
    expiresAt: new Date("2026-04-15T00:00:00.000Z"),
    scope: ["profile:read"]
  });

  assert.deepEqual(buildTokenResponse(token, true), {
    success: true,
    accessToken: "access-1",
    refreshToken: "refresh-1",
    expiresAt: new Date("2026-04-15T00:00:00.000Z"),
    scope: ["profile:read"]
  });
});

test("prepareRefreshGrantRequest mutates the request into a refresh-token grant", () => {
  const request = {
    body: {},
    headers: {}
  } as Request;

  const preparedWithClient = prepareRefreshGrantRequest(request, "refresh-token-1", "reader-web");

  assert.equal(preparedWithClient.headers["content-type"], "application/x-www-form-urlencoded");
  assert.deepEqual(preparedWithClient.body, {
    grant_type: "refresh_token",
    client_id: "reader-web",
    refresh_token: "refresh-token-1"
  });
});

test("issueStoredTokenForUser saves a token using the configured public client", async () => {
  const savedCalls: Array<Record<string, unknown>> = [];
  const storageModel = {
    getClient: async (clientId: string) => ({ id: clientId, grants: ["password", "refresh_token"] }),
    saveToken: async (token: Record<string, unknown>, client: Record<string, unknown>, user: Record<string, unknown>) => {
      savedCalls.push({ token, client, user });
      return { token, client, user };
    }
  };

  const result = await issueStoredTokenForUser({
    storageModel,
    clientId: "reader-web",
    user: {
      email: "reader@example.com",
      displayName: "Reader",
      scopes: ["profile:read", "profile:write"]
    },
    now: () => new Date("2026-04-15T00:00:00.000Z"),
    createId: (() => {
      const ids = ["access-1", "refresh-1"];
      return () => ids.shift() as string;
    })()
  });

  assert.equal(savedCalls.length, 1);
  assert.deepEqual(savedCalls[0], {
    token: {
      accessToken: "access-1",
      accessTokenExpiresAt: new Date("2026-04-22T00:00:00.000Z"),
      refreshToken: "refresh-1",
      refreshTokenExpiresAt: new Date("2026-04-22T00:00:00.000Z"),
      scope: ["profile:read", "profile:write"]
    },
    client: {
      id: "reader-web",
      grants: ["password", "refresh_token"]
    },
    user: {
      email: "reader@example.com",
      displayName: "Reader",
      scopes: ["profile:read", "profile:write"]
    }
  });

  assert.deepEqual(result, savedCalls[0]);
});
