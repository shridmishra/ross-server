# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/project-lifecycle.spec.js >> Project lifecycle (create then delete) >> a project can be created and then deleted from the dashboard
- Location: tests/project-lifecycle.spec.js:12:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/dashboard", waiting until "domcontentloaded"

```

# Test source

```ts
  1  | // Reusable, UI-driven flows built on the component-based selectors.
  2  | // These are the building blocks specs compose; keep them small and readable so
  3  | // premium / settings flows can be added alongside later.
  4  | const { expect } = require("@playwright/test");
  5  | const S = require("./selectors");
  6  | const { MAX_QUESTIONS } = require("../constants");
  7  | 
  8  | // Open the assess page without waiting for networkidle (the page holds
  9  | // long-lived connections) and let the first question render.
  10 | async function openAssessment(page, projectId) {
  11 |   await page.goto(`/assess/${projectId}`, { waitUntil: "domcontentloaded" });
  12 |   await expect(S.assessment.questionCounter(page)).toBeVisible();
  13 | }
  14 | 
  15 | // Create a project through the dashboard "New Project" dialog.
  16 | async function createProject(page, name, { description } = {}) {
> 17 |   await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
     |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  18 |   await S.dashboard.welcomeHeading(page).waitFor();
  19 |   await S.dashboard.newProjectButton(page).click();
  20 | 
  21 |   await expect(S.createDialog.root(page)).toBeVisible();
  22 |   await S.createDialog.nameInput(page).fill(name);
  23 |   if (description) await S.createDialog.descriptionInput(page).fill(description);
  24 |   await S.createDialog.submitButton(page).click();
  25 | 
  26 |   await expect(S.createDialog.root(page)).toBeHidden();
  27 |   await expect(page.getByText(name).first()).toBeVisible();
  28 | }
  29 | 
  30 | // From the dashboard, click a project's "Start" and choose the AIMA path.
  31 | // Returns the projectId parsed from the resulting /assess/<id> URL.
  32 | async function startAimaAssessment(page, name) {
  33 |   await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  34 |   await S.dashboard.cardStartButton(page, name).click();
  35 | 
  36 |   // New projects show a path-selection modal; existing ones may go straight in.
  37 |   const continueAima = S.pathModal.continueAima(page);
  38 |   if (await continueAima.isVisible().catch(() => false)) {
  39 |     await continueAima.click();
  40 |   }
  41 | 
  42 |   await page.waitForURL(/\/assess\/[0-9a-f-]+/i);
  43 |   await expect(S.assessment.questionCounter(page)).toBeVisible();
  44 |   const match = page.url().match(/\/assess\/([0-9a-f-]+)/i);
  45 |   return match ? match[1] : null;
  46 | }
  47 | 
  48 | // Answer every AIMA question with the same option, walking the whole
  49 | // assessment via the "Next" button, then submit. Lands on the report page.
  50 | async function answerAllQuestionsAndSubmit(page, answerLabel = "Yes") {
  51 |   for (let i = 0; i < MAX_QUESTIONS; i++) {
  52 |     await expect(S.assessment.answerOption(page, answerLabel)).toBeVisible();
  53 |     await S.assessment.answerOption(page, answerLabel).click();
  54 | 
  55 |     const next = S.assessment.nextButton(page);
  56 |     if (!(await next.isVisible().catch(() => false))) break; // last question
  57 | 
  58 |     const before = await S.assessment.questionCounter(page).innerText();
  59 |     await next.click();
  60 |     // Wait for the question to actually change before answering again.
  61 |     await expect
  62 |       .poll(() => S.assessment.questionCounter(page).innerText())
  63 |       .not.toBe(before);
  64 |   }
  65 | 
  66 |   // Let any in-flight answer saves settle before submitting.
  67 |   await page.waitForTimeout(1500);
  68 |   await S.assessment.submitButton(page).click();
  69 | 
  70 |   // If anything was missed, surface it clearly instead of hanging.
  71 |   const missing = S.assessment.missingDialog(page);
  72 |   if (await missing.isVisible().catch(() => false)) {
  73 |     throw new Error("Submit blocked: some questions were left unanswered.");
  74 |   }
  75 | 
  76 |   await page.waitForURL(/\/score-report-aima/i, { timeout: 60_000 });
  77 | }
  78 | 
  79 | // Delete a project from the dashboard via its card menu + confirmation.
  80 | async function deleteProject(page, name) {
  81 |   await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  82 |   await S.dashboard.cardMenuButton(page, name).click();
  83 |   await S.dashboard.menuItem(page, /delete/i).click();
  84 | 
  85 |   await expect(S.deleteDialog.root(page)).toBeVisible();
  86 |   await S.deleteDialog.confirmButton(page).click();
  87 |   await expect(S.deleteDialog.root(page)).toBeHidden();
  88 | }
  89 | 
  90 | module.exports = {
  91 |   openAssessment,
  92 |   createProject,
  93 |   startAimaAssessment,
  94 |   answerAllQuestionsAndSubmit,
  95 |   deleteProject,
  96 | };
  97 | 
```