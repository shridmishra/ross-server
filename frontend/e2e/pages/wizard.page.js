class WizardPage {
  constructor(page) {
    this.page = page;

    this.configureButton = page.getByRole("button", { name: /configure ai profile/i });
    this.modalTitle = page.getByText(/AI System Profile Wizard/i);
    this.nameInput = page.getByPlaceholder(/name of this AI|TalentSift/i);
    this.descInput = page.getByPlaceholder(/Describe what the system does/i);
    this.nextButton = page.getByRole("button", { name: /^next$/i });
    this.completeButton = page.getByRole("button", { name: /complete setup/i });
    this.applyButton = page.getByRole("button", { name: /apply profile & open platform/i });
  }

  selectTrigger(placeholder) {
    return this.page.getByText(placeholder, { exact: false }).first();
  }

  option(nameRe) {
    return this.page.getByRole("option", { name: nameRe }).first();
  }

  checkbox(labelSub) {
    return this.page.getByText(labelSub, { exact: false }).first();
  }

  async pick(placeholder, optionRe) {
    await this.selectTrigger(placeholder).click();
    await this.option(optionRe).click();
    await this.page.waitForTimeout(250);
  }

  async check(labelSub) {
    await this.checkbox(labelSub).click();
    await this.page.waitForTimeout(150);
  }

  async next() {
    await this.nextButton.click();
    await this.page.waitForTimeout(500);
  }

  // Opens the wizard and fills it with a simple, low-risk profile, then
  // applies it. Returns once the platform is unlocked.
  async complete() {
    await this.configureButton.scrollIntoViewIfNeeded().catch(() => {});
    await this.configureButton.click();
    await this.modalTitle.waitFor();

    // Section 1 — Project Setup
    await this.pick("Select scope type", /Single AI System/i);
    await this.nameInput.fill("Full Premium Feature");
    await this.descInput.fill("E2E full premium feature CRC test system.").catch(() => {});
    await this.pick("Select primary use case", /Customer Service Chatbot/i);
    await this.next();

    // Section 2 — Regulatory Role
    await this.pick("Select regulatory role", /Deployer/i);
    await this.next();

    // Section 3 — Data and Scope
    await this.check("Non-Personal / Industrial Data");
    await this.check("United States");
    await this.pick("Select deployment scale", /Local \/ Small Scale/i);
    await this.next();

    // Section 4 — Architecture
    await this.pick("Choose third-party model usage", /No, we train our models/i);
    await this.pick("Select autonomy level", /Human-in-the-loop/i);
    await this.next();

    // Section 5 — Existing Compliance
    await this.check("None of the above / Starting from scratch");
    await this.next();

    // Section 6 — Sensitive Domain Flags
    await this.check("None of the above sensitive domains");
    await this.pick("Select biometric use purpose", /No biometric data is processed/i);
    await this.pick("Select children safety impact", /designed purely for adult users/i);

    await this.completeButton.click();

    await this.applyButton.waitFor({ timeout: 30_000 });
    await this.applyButton.click();
    await this.applyButton.waitFor({ state: "hidden", timeout: 60_000 }).catch(() => {});
    await this.page.waitForTimeout(2500);
  }
}

module.exports = { WizardPage };
