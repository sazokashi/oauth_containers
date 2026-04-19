# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-flows.spec.ts >> demo user can log in and log out
- Location: e2e/auth-flows.spec.ts:29:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 120000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - paragraph [ref=e5]: Session Entry
  - heading "Sign in to the template portal" [level=1] [ref=e6]
  - paragraph [ref=e7]: The browser never handles raw access tokens directly. The API translates successful authentication into cookie-backed session state and guards writes with CSRF validation.
  - generic [ref=e8]:
    - generic [ref=e9]:
      - generic [ref=e10]: Email
      - textbox "Email" [ref=e11]: reader@example.com
    - generic [ref=e12]:
      - generic [ref=e13]: Password
      - textbox "Password" [ref=e14]: ChangeMe123!
    - paragraph [ref=e15]: response.body.scope.join is not a function
    - generic [ref=e16]:
      - button "Password Sign In" [ref=e17] [cursor=pointer]
      - button "Mock Social Sign In" [ref=e18] [cursor=pointer]
  - generic [ref=e19]:
    - link "Create account" [ref=e20] [cursor=pointer]:
      - /url: /register
    - link "Verify email" [ref=e21] [cursor=pointer]:
      - /url: /verify-email
    - link "Reset password" [ref=e22] [cursor=pointer]:
      - /url: /forgot-password
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | const createEmail = () => `reader+${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
  4  | 
  5  | const registerAndVerify = async ({
  6  |   page,
  7  |   email,
  8  |   password,
  9  |   displayName
  10 | }: {
  11 |   page: import("@playwright/test").Page;
  12 |   email: string;
  13 |   password: string;
  14 |   displayName: string;
  15 | }) => {
  16 |   await page.goto("/register");
  17 |   await page.getByLabel("Display name").fill(displayName);
  18 |   await page.getByLabel("Email").fill(email);
  19 |   await page.getByLabel("Password").fill(password);
  20 |   await page.getByRole("button", { name: "Create Account" }).click();
  21 | 
  22 |   await page.waitForURL(/\/verify-email\?/);
  23 |   await expect(page).toHaveURL(new RegExp(`email=${encodeURIComponent(email)}`));
  24 |   await page.getByRole("button", { name: "Verify Email" }).click();
  25 |   await page.waitForURL(/\/app\/dashboard/);
  26 |   await expect(page.getByText("Protected application shell")).toBeVisible();
  27 | };
  28 | 
  29 | test("demo user can log in and log out", async ({ page }) => {
  30 |   await page.goto("/login");
  31 |   await page.getByRole("button", { name: "Password Sign In" }).click();
  32 | 
> 33 |   await page.waitForURL(/\/app\/dashboard/);
     |              ^ Error: page.waitForURL: Test timeout of 120000ms exceeded.
  34 |   await expect(page.getByText("Protected application shell")).toBeVisible();
  35 |   await expect(page.getByText("Example Reader")).toBeVisible();
  36 | 
  37 |   await page.getByRole("button", { name: "Log Out" }).click();
  38 |   await page.waitForURL(/\/login/);
  39 |   await expect(page.getByText("Sign in to the template portal")).toBeVisible();
  40 | });
  41 | 
  42 | test("a new user can register and verify email", async ({ page }) => {
  43 |   const email = createEmail();
  44 |   await registerAndVerify({
  45 |     page,
  46 |     email,
  47 |     password: "ChangeMe123!",
  48 |     displayName: "Template Reader"
  49 |   });
  50 | 
  51 |   await expect(page.getByText(email)).toBeVisible();
  52 | });
  53 | 
  54 | test("a verified user can request a reset link, reset the password, and sign in again", async ({ page }) => {
  55 |   const email = createEmail();
  56 |   const originalPassword = "ChangeMe123!";
  57 |   const newPassword = "ResetMe456!";
  58 | 
  59 |   await registerAndVerify({
  60 |     page,
  61 |     email,
  62 |     password: originalPassword,
  63 |     displayName: "Reset Reader"
  64 |   });
  65 | 
  66 |   await page.getByRole("button", { name: "Log Out" }).click();
  67 |   await page.waitForURL(/\/login/);
  68 | 
  69 |   await page.goto("/forgot-password");
  70 |   await page.getByLabel("Email").fill(email);
  71 |   await page.getByRole("button", { name: "Request Reset Link" }).click();
  72 | 
  73 |   await page.waitForURL(/\/reset-password\?/);
  74 |   await expect(page).toHaveURL(new RegExp(`email=${encodeURIComponent(email)}`));
  75 |   await page.getByLabel("New password").fill(newPassword);
  76 |   await page.getByRole("button", { name: "Update Password" }).click();
  77 | 
  78 |   await page.waitForURL(/\/login/);
  79 |   await page.getByLabel("Email").fill(email);
  80 |   await page.getByLabel("Password").fill(newPassword);
  81 |   await page.getByRole("button", { name: "Password Sign In" }).click();
  82 | 
  83 |   await page.waitForURL(/\/app\/dashboard/);
  84 |   await expect(page.getByText("Protected application shell")).toBeVisible();
  85 | });
  86 | 
```