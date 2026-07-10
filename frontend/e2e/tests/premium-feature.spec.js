// Full premium-feature UI test: create a project, answer every AIMA question
// (premium account → includes the premium domain), verify the report,
// confirm the premium suite is unlocked, complete the AI System Profile
// wizard, then answer all CRC controls and verify the CRC report.
// The project is kept (not deleted) so both reports can be inspected.
//
// Disabled for now — only AIMA coverage is active. Uncomment to re-enable.

/*
const { test, expect } = require("@playwright/test");
const { STORAGE_STATE } = require("../constants");
const { DashboardPage } = require("../pages/dashboard.page");
const { AssessmentPage } = require("../pages/assessment.page");
const { ReportPage } = require("../pages/report.page");
const { PremiumFeaturesPage } = require("../pages/premium-features.page");
const { CrcPage } = require("../pages/crc.page");

test.use({ storageState: STORAGE_STATE });

test.setTimeout(20 * 60 * 1000);

test.describe("Full premium feature", () => {
  const PROJECT_NAME = "full premium feature";

  test("create 'full premium feature', answer every question, verify the premium report", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const assessment = new AssessmentPage(page);
    const report = new ReportPage(page);
    const premiumFeatures = new PremiumFeaturesPage(page);
    const crc = new CrcPage(page);

    let projectId;

    await test.step("create the project and answer every AIMA question 'Yes'", async () => {
      await dashboard.deleteProjectIfPresent(PROJECT_NAME);
      await dashboard.createProject(PROJECT_NAME, "Full premium feature end-to-end test (kept, not deleted).");
      projectId = await dashboard.startAssessment(PROJECT_NAME);
      expect(projectId).toBeTruthy();
      await assessment.answerAllAndSubmit("Yes");
      await expect(page).toHaveURL(/\/score-report-aima/i);
    });

    await test.step("verify the report content", async () => {
      await expect(report.overallScoreLabel).toBeVisible();
      await expect(report.domainBreakdown).toBeVisible();
      await expect(report.questionsEvaluatedValue).toHaveText(/^\d+$/);
      const evaluatedCount = Number(await report.questionsEvaluatedValue.innerText());
      expect(evaluatedCount).toBeGreaterThan(0);
      await expect(page.getByText("3.00").first()).toBeVisible();
      await expect(report.premiumDomainRow).toBeVisible();

      await page.screenshot({ path: "e2e/.artifacts/premium-report.png", fullPage: true });
    });

    await test.step("verify the premium suite is unlocked", async () => {
      const isPremium = await premiumFeatures.isPremium(projectId);
      expect(isPremium).toBeTruthy();

      await expect(premiumFeatures.sidebarVulnerability).toBeVisible();
      await expect(premiumFeatures.sidebarCrc).toBeVisible();
      await expect(premiumFeatures.sidebarBias).toBeVisible();

      await page.screenshot({ path: "e2e/.artifacts/premium-features.png", fullPage: true });
    });

    await test.step("complete the AI System Profile wizard (unlocks CRC)", async () => {
      await premiumFeatures.completeSystemProfileWizard(projectId);
    });

    await test.step("complete the CRC assessment and verify the report", async () => {
      await crc.answerAllAndSubmit(projectId, "Yes");
      await expect(page).toHaveURL(/score-report-crc/i);

      await expect(crc.reportSummaryHeading).toBeVisible();
      await expect(crc.reportOverallReadiness).toBeVisible();
      await expect(crc.reportByCategory).toBeVisible();

      await page.screenshot({ path: "e2e/.artifacts/crc-report.png", fullPage: true });
    });
  });
});
*/
