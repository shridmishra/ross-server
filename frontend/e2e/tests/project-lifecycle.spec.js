// UI test: create a project, verify it appears, then delete it and verify it's gone.
const { test, expect } = require("@playwright/test");
const { STORAGE_STATE } = require("../constants");
const { DashboardPage } = require("../pages/dashboard.page");

test.use({ storageState: STORAGE_STATE });

test.describe("Project lifecycle (create then delete)", () => {
  const name = `E2E Lifecycle ${Date.now()}`;

  test("a project can be created and then deleted from the dashboard", async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.createProject(name, "created by e2e");
    await expect(page.getByText(name).first()).toBeVisible();

    await dashboard.deleteProject(name);

    await page.reload({ waitUntil: "domcontentloaded" });
    await dashboard.welcomeHeading.waitFor();
    await expect(page.getByText(name)).toHaveCount(0);
  });
});
