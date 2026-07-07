// UI test: create a project, answer the full (free) AIMA assessment through the
// UI, evaluate the generated report, and verify the Download Report button
// produces a PDF. Cleans up the project afterwards.
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const { STORAGE_STATE } = require("../constants");
const S = require("../support/selectors");
const flows = require("../support/flows");

test.use({ storageState: STORAGE_STATE });

test.describe("AIMA assessment → report", () => {
  const name = `E2E AIMA ${Date.now()}`;

  test.afterEach(async ({ page }) => {
    // Best-effort cleanup so the account doesn't accumulate test projects.
    // await flows.deleteProject(page, name).catch(() => {});
  });

  test("answer the AIMA questions, evaluate the report, and download it", async ({ page }) => {
    // 1. Create a project and open its AIMA assessment.
    await flows.createProject(page, name);
    const projectId = await flows.startAimaAssessment(page, name);
    expect(projectId).toBeTruthy();

    // 2. Answer every question ("Yes") and submit -> lands on the report.
    await flows.answerAllQuestionsAndSubmit(page, "Yes");
    await expect(page).toHaveURL(/\/score-report-aima/i);

    // 3. Evaluate the report content.
    await expect(S.report.overallScoreLabel(page)).toBeVisible();
    await expect(S.report.domainBreadown(page)).toBeVisible();
    // Answering every question "Yes" (value 3) => a perfect overall score.
    await expect(page.getByText("3.00").first()).toBeVisible();

    // 4. Validate the Download Report button produces a PDF.
    const download = await downloadReport(page);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    const filePath = await download.path();
    expect(fs.statSync(filePath).size).toBeGreaterThan(1000); // non-empty PDF
  });
});

// Click "Download Report" and capture the resulting file.
//
// NOTE: the report gates this button behind AI-insights generation — while
// insights are being generated the button is DISABLED and reads
// "Preparing insights...", only becoming an enabled "Download Report" once the
// insights job finishes. In the current deployment that job never completes, so
// the button stays disabled and the report can't be downloaded (a real product
// issue). This helper waits a bounded time for the button to enable, then fails
// with an explicit message so the cause is obvious. It will pass unchanged in an
// environment where insights complete.
async function downloadReport(page) {
  const enabled = S.report.downloadButton(page); // name matches only when enabled
  const appeared = await enabled
    .waitFor({ state: "visible", timeout: 120_000 })
    .then(() => true)
    .catch(() => false);

  if (!appeared) {
    throw new Error(
      "Download blocked: the 'Download Report' button stayed disabled " +
        "('Preparing insights...') — the AI-insights job never finished, so the " +
        "report cannot be downloaded in this environment."
    );
  }

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 60_000 }),
    enabled.click(),
  ]);
  return download;
}
