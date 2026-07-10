// UI tests: create a project, answer the full AIMA assessment through the UI,
// and evaluate the generated report. Covers all three answer states, editing
// an answer after completion, and the missing-answers / navigation flow.
const { test, expect } = require("@playwright/test");
const { STORAGE_STATE } = require("../constants");
const { DashboardPage } = require("../pages/dashboard.page");
const { AssessmentPage } = require("../pages/assessment.page");
const { ReportPage } = require("../pages/report.page");

test.use({ storageState: STORAGE_STATE });

// Walks ~145 questions with save-verification retries on each one; the
// default 8-minute global timeout is too tight for that under real network
// conditions.
test.setTimeout(15 * 60 * 1000);

test.describe("AIMA assessment → report", () => {
  test("answer every question 'Yes' → 3.00 report, then edit + resubmit", async ({ page }) => {
    const name = `E2E AIMA Yes ${Date.now()}`;
    const report = await runAssessmentToReport(page, name, "Yes", "3.00");

    await test.step("editing an answered question and resubmitting updates the report", async () => {
      const assessment = new AssessmentPage(page);
      const initialScore = await report.overallScoreValue.innerText();

      await report.backToAssessmentButton.click();
      await assessment.questionCounter.waitFor();

      // Flip whichever question we land on — that alone marks the project as
      // changed and should shift the score.
      await assessment.answerOption("Partially").click();
      await page.waitForTimeout(500);

      await expect(assessment.resubmitButton).toBeEnabled({ timeout: 15_000 });
      await assessment.resubmitButton.click();

      await expect(page).toHaveURL(/\/score-report-aima/i, { timeout: 60_000 });
      await expect(report.overallScoreValue).not.toHaveText(initialScore);
    });
  });

  test("answer every question 'Partially' → 1.50 report", async ({ page }) => {
    const name = `E2E AIMA Partially ${Date.now()}`;
    await runAssessmentToReport(page, name, "Partially", "1.50");
  });

  test("answer every question 'No' → below Level 1", async ({ page }) => {
    const name = `E2E AIMA No ${Date.now()}`;
    // A 0.00 score is below the app's Level 1 threshold, so the report shows
    // a "progress to Level 1 %" figure instead of "0.00 / OUT OF 3.0".
    await runAssessmentToReport(page, name, "No", /progress to level 1/i);
  });

  test("Previous navigation preserves answers/notes; incomplete submit is blocked", async ({ page }) => {
    const name = `E2E AIMA Nav ${Date.now()}`;
    const dashboard = new DashboardPage(page);
    const assessment = new AssessmentPage(page);

    await dashboard.createProject(name);
    await dashboard.startAssessment(name);

    await assessment.answerOption("Yes").click();
    const note = `e2e note ${Date.now()}`;
    await assessment.addNote(note);

    const firstQuestionCounter = await assessment.questionCounter.innerText();

    await assessment.submitButton.click();
    await expect(assessment.missingDialog).toBeVisible();

    await assessment.missingDialogGoToFirst.click();
    await expect(assessment.missingDialog).toBeHidden();
    await expect.poll(() => assessment.questionCounter.innerText()).not.toBe(firstQuestionCounter);

    for (const label of ["No", "Partially", "Yes"]) {
      await expect(assessment.answerRadio(label)).not.toBeChecked();
    }

    await assessment.previousButton.click();
    await expect.poll(() => assessment.questionCounter.innerText()).toBe(firstQuestionCounter);
    await expect(assessment.answerRadio("Yes")).toBeChecked();
    await expect(assessment.notesTextarea).toHaveValue(note);

    await dashboard.deleteProject(name);
  });
});

// Creates a project, answers the whole AIMA assessment, and confirms the
// report shows `expectedScore` plus a positive questions-evaluated count.
// Returns the ReportPage so callers can keep driving the same project.
async function runAssessmentToReport(page, name, answerLabel, expectedScore) {
  const dashboard = new DashboardPage(page);
  const assessment = new AssessmentPage(page);
  const report = new ReportPage(page);

  await dashboard.createProject(name);
  const projectId = await dashboard.startAssessment(name);
  expect(projectId).toBeTruthy();

  await assessment.answerAllAndSubmit(answerLabel);
  await expect(page).toHaveURL(/\/score-report-aima/i);

  await expect(report.overallScoreLabel).toBeVisible();
  await expect(report.domainBreakdown).toBeVisible();
  await expect(page.getByText(expectedScore).first()).toBeVisible();
  await expect(report.questionsEvaluatedValue).toHaveText(/^\d+$/);
  const evaluatedCount = Number(await report.questionsEvaluatedValue.innerText());
  expect(evaluatedCount).toBeGreaterThan(0);

  return report;
}
