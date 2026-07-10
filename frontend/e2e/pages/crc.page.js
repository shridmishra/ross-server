const { expect } = require("@playwright/test");

// HTTPS, not on the backend's evidence-URL blocklist (google.com, example.com,
// localhost, etc.), so it validates as a real evidence link.
const EVIDENCE_URL = "https://docs.com";

class CrcPage {
  constructor(page) {
    this.page = page;

    this.welcomeStartLink = page.getByRole("link", { name: /start crc assessment|continue to the crc assessment/i });

    this.counter = page.getByText(/Control \d+ of \d+/).first();
    this.nextButton = page.getByRole("button", { name: /^next$/i });
    this.submitButton = page.getByRole("button", { name: /submit assessment/i });

    this.evidenceStatusSelect = page.getByLabel(/select status/i);
    this.evidenceUrlInput = page.getByLabel(/evidence url/i);
    this.auditReadyCheckbox = page.getByLabel(/audit-ready confirmation/i);

    this.reportSummaryHeading = page.getByText(/compliance readiness summary/i);
    this.reportOverallReadiness = page.getByText(/overall compliance readiness/i);
    this.reportByCategory = page.getByText(/by category/i);
  }

  answerOption(label) {
    return this.page.getByText(label, { exact: true }).first();
  }

  // Fully populates one control's evidence tracker: status -> URL -> status
  // -> audit-ready. Assumes the control has already been answered.
  async fillEvidenceTracker() {
    await this.evidenceStatusSelect.selectOption("Evidence in Progress");
    await this.page.waitForTimeout(300);

    await this.evidenceUrlInput.fill(EVIDENCE_URL);
    await this.evidenceUrlInput.press("Tab"); // blur triggers save-on-blur
    await this.page.waitForTimeout(300);

    await this.evidenceStatusSelect.selectOption("Evidence Complete");
    await this.page.waitForTimeout(300);

    await expect(this.auditReadyCheckbox).toBeVisible({ timeout: 10_000 }); // renders once the URL is saved
    await this.auditReadyCheckbox.check();
    await this.page.waitForTimeout(300);
  }

  // Answers every control with `label`, walking via "Next", then submits.
  // Lands on /score-report-crc. Requires the wizard to have been applied
  // first. Pass withEvidence to also fully populate each control's evidence
  // tracker before moving on.
  async answerAllAndSubmit(projectId, label = "Yes", withEvidence = false) {
    await this.page.goto(`/assess/${projectId}/crc/welcome`, { waitUntil: "domcontentloaded" });
    const started = await this.welcomeStartLink
      .waitFor({ timeout: 30_000 })
      .then(() => true)
      .catch(() => false);
    if (started) await this.welcomeStartLink.click();
    else await this.page.goto(`/assess/${projectId}/crc`, { waitUntil: "domcontentloaded" });

    await expect(this.counter).toBeVisible({ timeout: 30_000 });

    for (let i = 0; i < 300; i++) {
      const text = await this.counter.innerText();
      const match = text.match(/Control (\d+) of (\d+)/);

      await this.answerOption(label).click();
      await this.page.waitForTimeout(400); // let the answer persist

      if (withEvidence) await this.fillEvidenceTracker();

      if (match && Number(match[1]) >= Number(match[2])) break; // last control answered

      if (!(await this.nextButton.isEnabled().catch(() => false))) break;
      await this.nextButton.click();
      await expect.poll(() => this.counter.innerText(), { timeout: 15_000 }).not.toBe(text);
    }

    await expect(this.submitButton).toBeEnabled({ timeout: 90_000 }); // enables once every control is answered
    await this.submitButton.click();
    await this.page.waitForURL(/score-report-crc/i, { timeout: 90_000 });
  }
}

module.exports = { CrcPage };
