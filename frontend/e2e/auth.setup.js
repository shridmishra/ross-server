// Logs in through the real /auth page and saves the signed-in state.
// The app keeps its JWT in localStorage["auth_token"] (not a cookie); Playwright's
// storageState captures localStorage origins, so authenticated specs can reuse it.
const { test: setup, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const { STORAGE_STATE, EMAIL, PASSWORD } = require("./constants");
const { AuthPage } = require("./pages/auth.page");

setup("authenticate", async ({ page }) => {
  expect(
    EMAIL && PASSWORD,
    "Set E2E_EMAIL / E2E_PASSWORD in e2e/.env.e2e (see .env.e2e.example)"
  ).toBeTruthy();

  const auth = new AuthPage(page);
  await auth.login(EMAIL, PASSWORD);

  await expect(page.getByText(/welcome back/i)).toBeVisible();

  const token = await page.evaluate(() => localStorage.getItem("auth_token"));
  expect(token, "auth_token should be set after login").toBeTruthy();

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
});
