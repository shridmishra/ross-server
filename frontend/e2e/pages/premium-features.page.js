const { WizardPage } = require("./wizard.page");

class PremiumFeaturesPage {
  constructor(page) {
    this.page = page;

    // Three possible states: the feature hub (profile configured), the
    // onboarding gate (fresh premium project), or the upgrade gate (not
    // premium). Either of the first two proves the account is premium.
    this.hubHeading = page.getByText(/take your ai governance to the next level/i);
    this.onboardingHeading = page
      .getByText(/personalize your compliance experience/i)
      .or(page.getByText(/premium onboarding flow/i))
      .first();
    this.upgradeGate = page.getByRole("button", { name: /upgrade to premium/i });

    this.vulnerabilityCard = page.getByText(/AI Vulnerability Assessment/i).first();
    this.biasCard = page.getByText(/Automated Bias & Fairness Testing/i).first();
    this.crcCard = page.getByText(/Compliance Readiness Controls/i).first();
    this.premiumDomains = page.getByText(/Premium Domains Assessment/i);

    // Left assess sidebar — present for a premium account, absent/locked
    // otherwise.
    this.sidebarVulnerability = page.getByText(/AI Vulnerability Assessment/i).first();
    this.sidebarCrc = page.getByText("CRC", { exact: true }).first();
    this.sidebarBias = page.getByText(/Bias & Fairness Testing/i).first();

    this.wizard = new WizardPage(page);
  }

  async goto(projectId) {
    await this.page.goto(`/assess/${projectId}/premium-features`, { waitUntil: "domcontentloaded" });
  }

  // Returns true if the account is premium (hub or onboarding rendered),
  // false only if the upgrade gate showed instead.
  async isPremium(projectId) {
    await this.goto(projectId);
    await Promise.race([
      this.hubHeading.waitFor({ timeout: 30_000 }).catch(() => {}),
      this.onboardingHeading.waitFor({ timeout: 30_000 }).catch(() => {}),
      this.upgradeGate.waitFor({ timeout: 30_000 }).catch(() => {}),
    ]);
    if (await this.upgradeGate.isVisible().catch(() => false)) return false;
    return (await this.hubHeading.isVisible().catch(() => false)) || (await this.onboardingHeading.isVisible().catch(() => false));
  }

  // Completes (and applies) the AI System Profile wizard that gates CRC /
  // premium features for a fresh premium project. Returns true if it ran the
  // wizard, false if it was already applied.
  async completeSystemProfileWizard(projectId) {
    await this.goto(projectId);
    await Promise.race([
      this.wizard.configureButton.waitFor({ timeout: 30_000 }).catch(() => {}),
      this.hubHeading.waitFor({ timeout: 30_000 }).catch(() => {}),
    ]);
    if (!(await this.wizard.configureButton.isVisible().catch(() => false))) return false; // already applied
    await this.wizard.complete();
    return true;
  }
}

module.exports = { PremiumFeaturesPage };
