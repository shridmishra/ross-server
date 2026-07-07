// UI test: create a project, verify it appears, then delete it and verify it's gone.
const { test, expect } = require("@playwright/test");
const { STORAGE_STATE } = require("../constants");
const S = require("../support/selectors");
const flows = require("../support/flows");

test.use({ storageState: STORAGE_STATE });

test.describe("Project lifecycle (create then delete)", () => {
  const name = `E2E Lifecycle ${Date.now()}`;

  test("a project can be created and then deleted from the dashboard", async ({ page }) => {
    // Create
    await flows.createProject(page, name, { description: "created by e2e" });
    await expect(page.getByText(name).first()).toBeVisible();

    // Delete
    await flows.deleteProject(page, name);

    // Gone from the active dashboard list
    await page.reload({ waitUntil: "domcontentloaded" });
    await S.dashboard.welcomeHeading(page).waitFor();
    await expect(page.getByText(name)).toHaveCount(0);
  });
});
