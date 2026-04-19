import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { AppRoutes } from "../src/app/routes";
import { authReducer } from "../src/store/auth-slice";

afterEach(() => {
  cleanup();
});

const createStore = (authOverrides: Record<string, unknown> = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        status: "unauthenticated" as const,
        user: null,
        error: null,
        ...authOverrides
      }
    }
  });

const renderRoutes = ({
  route,
  auth = {}
}: {
  route: string;
  auth?: Record<string, unknown>;
}) =>
  render(
    React.createElement(
      Provider,
      { store: createStore(auth) },
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
      status: "authenticated",
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
      status: "loading"
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
