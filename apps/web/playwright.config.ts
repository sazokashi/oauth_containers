import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: "http://localhost:5173",
    browserName: "chromium",
    channel: "chrome",
    headless: true
  },
  globalSetup: "./test/e2e-global-setup.ts",
  globalTeardown: "./test/e2e-global-teardown.ts"
});
