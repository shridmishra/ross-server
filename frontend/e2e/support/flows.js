// Reusable, UI-driven flows built on the component-based selectors.
// These are the building blocks specs compose; keep them small and readable so
// premium / settings flows can be added alongside later.
const { expect } = require("@playwright/test");
const S = require("./selectors");
const { MAX_QUESTIONS } = require("../constants");

// Open the assess page without waiting for networkidle (the page holds
// long-lived connections) and let the first question render.
async function openAssessment(page, projectId) {
  await page.goto(`/assess/${projectId}`, { waitUntil: "domcontentloaded" });
  await expect(S.assessment.questionCounter(page)).toBeVisible();
}

// Create a project through the dashboard "New Project" dialog.
async function createProject(page, name, { description } = {}) {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await S.dashboard.welcomeHeading(page).waitFor();
  await S.dashboard.newProjectButton(page).click();

  await expect(S.createDialog.root(page)).toBeVisible();
  await S.createDialog.nameInput(page).fill(name);
  if (description) await S.createDialog.descriptionInput(page).fill(description);
  await S.createDialog.submitButton(page).click();

  await expect(S.createDialog.root(page)).toBeHidden();
  await expect(page.getByText(name).first()).toBeVisible();
}

// From the dashboard, click a project's "Start" and choose the AIMA path.
// Returns the projectId parsed from the resulting /assess/<id> URL.
async function startAimaAssessment(page, name) {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await S.dashboard.cardStartButton(page, name).click();

  // New projects show a path-selection modal; existing ones may go straight in.
  const continueAima = S.pathModal.continueAima(page);
  if (await continueAima.isVisible().catch(() => false)) {
    await continueAima.click();
  }

  await page.waitForURL(/\/assess\/[0-9a-f-]+/i);
  await expect(S.assessment.questionCounter(page)).toBeVisible();
  const match = page.url().match(/\/assess\/([0-9a-f-]+)/i);
  return match ? match[1] : null;
}

// Answer every AIMA question with the same option, walking the whole
// assessment via the "Next" button, then submit. Lands on the report page.
async function answerAllQuestionsAndSubmit(page, answerLabel = "Yes") {
  for (let i = 0; i < MAX_QUESTIONS; i++) {
    await expect(S.assessment.answerOption(page, answerLabel)).toBeVisible();
    await S.assessment.answerOption(page, answerLabel).click();

    const next = S.assessment.nextButton(page);
    if (!(await next.isVisible().catch(() => false))) break; // last question

    const before = await S.assessment.questionCounter(page).innerText();
    await next.click();
    // Wait for the question to actually change before answering again.
    await expect
      .poll(() => S.assessment.questionCounter(page).innerText())
      .not.toBe(before);
  }

  // Let any in-flight answer saves settle before submitting.
  await page.waitForTimeout(1500);
  await S.assessment.submitButton(page).click();

  // If anything was missed, surface it clearly instead of hanging.
  const missing = S.assessment.missingDialog(page);
  if (await missing.isVisible().catch(() => false)) {
    throw new Error("Submit blocked: some questions were left unanswered.");
  }

  await page.waitForURL(/\/score-report-aima/i, { timeout: 60_000 });
}

// Delete a project from the dashboard via its card menu + confirmation.
async function deleteProject(page, name) {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await S.dashboard.cardMenuButton(page, name).click();
  await S.dashboard.menuItem(page, /delete/i).click();

  await expect(S.deleteDialog.root(page)).toBeVisible();
  await S.deleteDialog.confirmButton(page).click();
  await expect(S.deleteDialog.root(page)).toBeHidden();
}

module.exports = {
  openAssessment,
  createProject,
  startAimaAssessment,
  answerAllQuestionsAndSubmit,
  deleteProject,
};
