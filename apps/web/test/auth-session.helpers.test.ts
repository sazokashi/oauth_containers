import test from "node:test";
import assert from "node:assert/strict";
import { createSessionBootstrap } from "../src/auth/auth-session.helpers.ts";

test("createSessionBootstrap returns the current session when the initial load succeeds", async () => {
  const run = createSessionBootstrap({
    loadSession: async () => ({
      email: "reader@example.com",
      displayName: "Reader",
      scopes: ["profile:read"]
    }),
    refreshSession: async () => {
      throw new Error("refresh should not be called");
    }
  });

  const result = await run();

  assert.deepEqual(result, {
    email: "reader@example.com",
    displayName: "Reader",
    scopes: ["profile:read"]
  });
});

test("createSessionBootstrap refreshes and retries when the initial load fails", async () => {
  let loadAttempts = 0;
  let refreshCalls = 0;

  const run = createSessionBootstrap({
    loadSession: async () => {
      loadAttempts += 1;
      if (loadAttempts === 1) {
        throw new Error("expired");
      }

      return {
        email: "reader@example.com",
        displayName: "Reader",
        scopes: ["profile:read", "profile:write"]
      };
    },
    refreshSession: async () => {
      refreshCalls += 1;
    }
  });

  const result = await run();

  assert.equal(refreshCalls, 1);
  assert.equal(loadAttempts, 2);
  assert.deepEqual(result, {
    email: "reader@example.com",
    displayName: "Reader",
    scopes: ["profile:read", "profile:write"]
  });
});

test("createSessionBootstrap returns null when both session load and refresh recovery fail", async () => {
  const run = createSessionBootstrap({
    loadSession: async () => {
      throw new Error("expired");
    },
    refreshSession: async () => {
      throw new Error("refresh failed");
    }
  });

  const result = await run();

  assert.equal(result, null);
});
