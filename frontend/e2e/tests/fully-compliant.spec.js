// Full "fully compliant" UI test: create a project, answer every AIMA
// question "Yes" (incl. the premium domain), complete the AI System Profile
// wizard, then answer all CRC controls "Yes" with a full evidence trail
// (status → URL → status → audit-ready) per control. The project is kept
// (not deleted) so both reports can be inspected.
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

test.setTimeout(30 * 60 * 1000);

test.describe("Fully compliant project (AIMA + CRC, all Yes + complete evidence)", () => {
  const PROJECT_NAME = "E2E fully Compliant";

  test("create 'E2E fully Compliant', answer every question, complete evidence, keep project", async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const assessment = new AssessmentPage(page);
    const report = new ReportPage(page);
    const premiumFeatures = new PremiumFeaturesPage(page);
    const crc = new CrcPage(page);

    let projectId;

    await test.step("create the project and answer every AIMA question 'Yes'", async () => {
      await dashboard.deleteProjectIfPresent(PROJECT_NAME);
      await dashboard.createProject(PROJECT_NAME, "Fully compliant reference project — all Yes + complete evidence (kept, not deleted).");
      projectId = await dashboard.startAssessment(PROJECT_NAME);
      expect(projectId).toBeTruthy();
      await assessment.answerAllAndSubmit("Yes");
      await expect(page).toHaveURL(/\/score-report-aima/i);
    });

    await test.step("verify the AIMA report content", async () => {
      await expect(report.overallScoreLabel).toBeVisible();
      await expect(report.domainBreakdown).toBeVisible();
      await expect(page.getByText("3.00").first()).toBeVisible();
      await expect(report.premiumDomainRow).toBeVisible();
    });

    await test.step("complete the AI System Profile wizard (unlocks CRC)", async () => {
      await premiumFeatures.completeSystemProfileWizard(projectId);
    });

    await test.step("complete the CRC assessment (all Yes + full evidence trail)", async () => {
      await crc.answerAllAndSubmit(projectId, "Yes", true);
      await expect(page).toHaveURL(/\/score-report-crc/i);

      await expect(crc.reportSummaryHeading).toBeVisible();
      await expect(crc.reportOverallReadiness).toBeVisible();
      await expect(crc.reportByCategory).toBeVisible();

      await page.screenshot({ path: "e2e/.artifacts/fully-compliant-crc-report.png", fullPage: true });
    });
  });
});
*/
