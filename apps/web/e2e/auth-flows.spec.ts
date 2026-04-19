import { test, expect } from "@playwright/test";

const createEmail = () => `reader+${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;

const registerAndVerify = async ({
  page,
  email,
  password,
  displayName
}: {
  page: import("@playwright/test").Page;
  email: string;
  password: string;
  displayName: string;
}) => {
  await page.goto("/register");
  await page.getByLabel("Display name").fill(displayName);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await page.waitForURL(/\/verify-email\?/);
  await expect(page).toHaveURL(new RegExp(`email=${encodeURIComponent(email)}`));
  await page.getByRole("button", { name: "Verify Email" }).click();
  await page.waitForURL(/\/app\/dashboard/);
  await expect(page.getByText("Protected application shell")).toBeVisible();
};

test("demo user can log in and log out", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Password Sign In" }).click();

  await page.waitForURL(/\/app\/dashboard/);
  await expect(page.getByText("Protected application shell")).toBeVisible();
  await expect(page.getByText("Example Reader")).toBeVisible();

  await page.getByRole("button", { name: "Log Out" }).click();
  await page.waitForURL(/\/login/);
  await expect(page.getByText("Sign in to the template portal")).toBeVisible();
});

test("a new user can register and verify email", async ({ page }) => {
  const email = createEmail();
  await registerAndVerify({
    page,
    email,
    password: "ChangeMe123!",
    displayName: "Template Reader"
  });

  await expect(page.getByText(email)).toBeVisible();
});

test("a verified user can request a reset link, reset the password, and sign in again", async ({ page }) => {
  const email = createEmail();
  const originalPassword = "ChangeMe123!";
  const newPassword = "ResetMe456!";

  await registerAndVerify({
    page,
    email,
    password: originalPassword,
    displayName: "Reset Reader"
  });

  await page.getByRole("button", { name: "Log Out" }).click();
  await page.waitForURL(/\/login/);

  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Request Reset Link" }).click();

  await page.waitForURL(/\/reset-password\?/);
  await expect(page).toHaveURL(new RegExp(`email=${encodeURIComponent(email)}`));
  await page.getByLabel("New password").fill(newPassword);
  await page.getByRole("button", { name: "Update Password" }).click();

  await page.waitForURL(/\/login/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(newPassword);
  await page.getByRole("button", { name: "Password Sign In" }).click();

  await page.waitForURL(/\/app\/dashboard/);
  await expect(page.getByText("Protected application shell")).toBeVisible();
});
