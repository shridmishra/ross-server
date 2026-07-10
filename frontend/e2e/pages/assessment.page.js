const { expect } = require("@playwright/test");
const { MAX_QUESTIONS } = require("../constants");

class AssessmentPage {
  constructor(page) {
    this.page = page;

    this.questionCounter = page.getByText(/Question \d+ of \d+/).first();
    this.nextButton = page.getByRole("button", { name: "Next" });
    this.previousButton = page.getByRole("button", { name: "Previous" });
    this.submitButton = page.getByRole("button", { name: /submit project/i }).first();
    // Once a project is already completed, the same button relabels to this.
    this.resubmitButton = page.getByRole("button", { name: /resubmit changes/i }).first();

    this.missingDialog = page.getByRole("dialog").filter({ hasText: /unanswered|missing/i });
    this.missingDialogGoToFirst = this.missingDialog.getByRole("button", { name: /go to first unanswered/i });

    this.notesTextarea = page.getByPlaceholder(/add your notes/i);
    this.savingIndicator = page.getByText(/saving\.\.\./i);
  }

  answerOption(label) {
    return this.page.getByText(label, { exact: true }).first();
  }

  // The radio input for an answer option: the <label> wraps both the option
  // text and its description as siblings, so this filters to the label that
  // contains the exact option text, then grabs its nested radio.
  answerRadio(label) {
    return this.page
      .locator("label")
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .getByRole("radio");
  }

  async open(projectId) {
    await this.page.goto(`/assess/${projectId}`, { waitUntil: "domcontentloaded" });
    await this.questionCounter.waitFor();
  }

  // Selects `label` on the current question and confirms it stuck.
  // The app selects the radio optimistically, then saves in the background —
  // if that save fails it rolls the selection back. A plain click +
  // toBeChecked can pass before the rollback happens, so this waits for the
  // save to settle and re-checks, retrying the click if it got rolled back.
  async answerCurrent(label) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      await expect(this.answerOption(label)).toBeVisible();
      await this.answerOption(label).click();
      await expect(this.answerRadio(label)).toBeChecked();

      await this.savingIndicator.waitFor({ state: "visible", timeout: 1_500 }).catch(() => {});
      await this.savingIndicator.waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});

      const survived = await this.answerRadio(label).isChecked().catch(() => false);
      if (survived) return;
    }
    throw new Error(`Answer "${label}" kept getting rolled back by failed saves after 3 attempts.`);
  }

  async addNote(text) {
    await this.notesTextarea.fill(text);
    await this.notesTextarea.press("Tab"); // blur triggers save-on-blur
  }

  // Answers every question with `label`, walking via "Next", then submits.
  // Lands on /score-report-aima.
  async answerAllAndSubmit(label = "Yes") {
    for (let i = 0; i < MAX_QUESTIONS; i++) {
      await this.answerCurrent(label);

      if (!(await this.nextButton.isVisible().catch(() => false))) break; // last question

      const before = await this.questionCounter.innerText();
      await this.nextButton.click();
      await expect.poll(() => this.questionCounter.innerText()).not.toBe(before);
    }

    await this.page.waitForTimeout(1500); // let any in-flight saves settle
    await this.submitButton.click();

    if (await this.missingDialog.isVisible().catch(() => false)) {
      throw new Error("Submit blocked: some questions were left unanswered.");
    }

    await this.page.waitForURL(/\/score-report-aima/i, { timeout: 60_000 });
  }
}

module.exports = { AssessmentPage };
