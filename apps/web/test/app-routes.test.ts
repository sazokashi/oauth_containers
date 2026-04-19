import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../src/app/routes";
import { AuthContextProvider, type AuthContextValue } from "../src/auth/auth-context";

afterEach(() => {
  cleanup();
});

const createAuthValue = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  user: null,
  loading: false,
  login: async () => undefined,
  register: async () => ({}),
  socialSignIn: async () => undefined,
  refresh: async () => undefined,
  logout: async () => undefined,
  reloadUser: async () => undefined,
  ...overrides
});

const renderRoutes = ({
  route,
  auth
}: {
  route: string;
  auth?: Partial<AuthContextValue>;
}) =>
  render(
    React.createElement(
      AuthContextProvider,
      { value: createAuthValue(auth) },
      React.createElement(
        MemoryRouter,
        { initialEntries: [route] },
        React.createElement(AppRoutes)
      )
    )
  );

test("unauthenticated users are redirected from protected routes to login", async () => {
  renderRoutes({ route: "/app/dashboard" });

  await waitFor(() => {
    assert.ok(screen.getByText("Sign in to the template portal"));
  });
});

test("authenticated users are redirected away from public login routes", async () => {
  renderRoutes({
    route: "/login",
    auth: {
      user: {
        email: "reader@example.com",
        displayName: "Reader",
        scopes: ["profile:read"],
        emailVerified: true
      }
    }
  });

  await waitFor(() => {
    assert.ok(screen.getByText("Protected application shell"));
  });
});

test("protected routes show a loading screen while auth bootstrap is pending", () => {
  renderRoutes({
    route: "/app/dashboard",
    auth: {
      loading: true
    }
  });

  assert.ok(screen.getByText("Loading session..."));
});

test("public register route remains accessible to unauthenticated users", async () => {
  renderRoutes({ route: "/register" });

  await waitFor(() => {
    assert.ok(screen.getByText("Create a password account"));
  });
});
