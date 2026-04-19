import test from "node:test";
import assert from "node:assert/strict";
import type { NextFunction, Request, Response } from "express";
import { refreshBrowserSession } from "../src/auth/oauth.js";
import { accountRouter } from "../src/auth/routes/account-routes.js";
import { sessionRouter } from "../src/auth/routes/session-routes.js";

const createResponseDouble = () => {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    locals: {},
    cookies: [] as Array<Record<string, unknown>>,
    clearedCookies: [] as Array<Record<string, unknown>>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    cookie(name: string, value: string, options: Record<string, unknown>) {
      this.cookies.push({ name, value, options });
      return this;
    },
    clearCookie(name: string, options: Record<string, unknown>) {
      this.clearedCookies.push({ name, options });
      return this;
    }
  };

  return response as unknown as Response & {
    statusCode: number;
    body: unknown;
    cookies: Array<Record<string, unknown>>;
    clearedCookies: Array<Record<string, unknown>>;
  };
};

const getRouteHandler = (router: typeof accountRouter | typeof sessionRouter, path: string) => {
  const layer = router.stack.find((entry: any) => entry.route?.path === path);
  if (!layer) {
    throw new Error(`Route not found: ${path}`);
  }

  return layer.route.stack[layer.route.stack.length - 1].handle as (req: Request, res: Response, next: NextFunction) => unknown;
};

test("refreshBrowserSession returns 401 when no refresh token is present", async () => {
  const handler = refreshBrowserSession();
  const request = {
    cookies: {},
    body: {},
    headers: {}
  } as Request;
  const response = createResponseDouble();

  await handler(request, response, () => undefined);

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, {
    success: false,
    message: "No refresh token available."
  });
});

test("social mock route rejects an invalid provider token", async () => {
  const handler = getRouteHandler(sessionRouter, "/social/mock");
  const request = {
    body: {
      email: "reader@example.com",
      providerToken: "invalid-provider-token"
    }
  } as Request;
  const response = createResponseDouble();
  let forwardedError: any;

  await handler(request, response, (error?: unknown) => {
    forwardedError = error;
  });

  assert.equal(forwardedError?.status, 401);
  assert.equal(forwardedError?.message, "Mock provider token is invalid.");
});

test("register route validates malformed email input", async () => {
  const handler = getRouteHandler(accountRouter, "/users/register");
  const request = {
    body: {
      email: "not-an-email",
      password: "ChangeMe123!",
      displayName: "Example Reader"
    }
  } as Request;
  const response = createResponseDouble();

  let forwardedError: any;
  await handler(request, response, (error?: unknown) => {
    forwardedError = error;
  });

  assert.equal(forwardedError?.status, 400);
  assert.equal(forwardedError?.message, "Please provide a valid email address.");
});

test("register route requires an email address", async () => {
  const handler = getRouteHandler(accountRouter, "/users/register");
  const request = {
    body: {
      email: "",
      password: "ChangeMe123!",
      displayName: "Example Reader"
    }
  } as Request;
  const response = createResponseDouble();

  let forwardedError: any;
  await handler(request, response, (error?: unknown) => {
    forwardedError = error;
  });

  assert.equal(forwardedError?.status, 400);
  assert.equal(forwardedError?.message, "Email is required.");
});
