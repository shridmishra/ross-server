class DashboardPage {
  constructor(page) {
    this.page = page;

    this.welcomeHeading = page.getByText(/welcome back/i);
    this.newProjectButton = page.getByRole("button", { name: /new project/i });

    this.createDialog = page.getByRole("dialog").filter({ hasText: /create new project/i });
    this.nameInput = this.createDialog.getByPlaceholder(/enter project name/i);
    this.descriptionInput = this.createDialog.getByPlaceholder(/describe your ai system/i);
    this.createSubmitButton = this.createDialog.getByRole("button", { name: /create project/i });

    this.deleteDialog = page.getByRole("dialog").filter({ hasText: /delete project/i });
    this.deleteConfirmButton = this.deleteDialog.getByRole("button", { name: /^delete/i });

    // Shown after clicking "Start" on a new project.
    this.pathModal = page.getByRole("dialog").filter({ hasText: /choose your path/i });
    this.continueAimaButton = page.getByRole("button", { name: /continue with aima/i });
  }

  card(name) {
    return this.page
      .locator("div", { hasText: name })
      .filter({ has: this.page.getByRole("button", { name: /open menu/i }) })
      .last();
  }

  cardMenuButton(name) {
    return this.card(name).getByRole("button", { name: /open menu/i });
  }

  // The card's name/"Open menu" button and its "Start Assessment"/"Continue
  // Assessment" CTA sit under different wrapper divs, so this requires both
  // to be present before narrowing to the innermost match.
  cardStartButton(name) {
    return this.page
      .locator("div", { hasText: name })
      .filter({ has: this.page.getByRole("button", { name: /open menu/i }) })
      .filter({ has: this.page.getByRole("button", { name: /^(start|continue)(\s+assessment)?$/i }) })
      .last()
      .getByRole("button", { name: /^(start|continue)(\s+assessment)?$/i });
  }

  async goto() {
    await this.page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await this.welcomeHeading.waitFor();
  }

  async createProject(name, description) {
    await this.goto();
    await this.newProjectButton.click();
    await this.createDialog.waitFor();
    await this.nameInput.fill(name);
    if (description) await this.descriptionInput.fill(description);
    await this.createSubmitButton.click();
    await this.createDialog.waitFor({ state: "hidden" });
    await this.page.getByText(name).first().waitFor();
  }

  // Clicks a project's "Start"/"Continue" and resolves the AIMA path if a new
  // project shows the path-selection modal. Returns the projectId parsed
  // from the resulting /assess/<id> URL.
  async startAssessment(name) {
    await this.goto();
    await this.cardStartButton(name).click();

    if (await this.continueAimaButton.isVisible().catch(() => false)) {
      await this.continueAimaButton.click();
    }

    await this.page.waitForURL(/\/assess\/[0-9a-f-]+/i);
    const match = this.page.url().match(/\/assess\/([0-9a-f-]+)/i);
    return match ? match[1] : null;
  }

  async deleteProjectCard(name) {
    await this.cardMenuButton(name).click();
    await this.page.getByRole("menuitem", { name: /delete/i }).click();
    await this.deleteDialog.waitFor();
    await this.deleteConfirmButton.click();
    await this.deleteDialog.waitFor({ state: "hidden" });
  }

  async deleteProject(name) {
    await this.goto();
    await this.deleteProjectCard(name);
  }

  // Deletes every card matching `name`, not just one — card() resolves to the
  // last match, so a same-named duplicate left over from a crashed prior run
  // would otherwise never fully clear. Returns the count actually deleted.
  async deleteProjectIfPresent(name) {
    const MAX_DUPLICATES = 10;
    let deletedCount = 0;
    for (let i = 0; i < MAX_DUPLICATES; i++) {
      await this.goto();
      await this.page.waitForTimeout(800);
      const menuButton = this.cardMenuButton(name);
      if (!(await menuButton.isVisible().catch(() => false))) break;
      await this.deleteProjectCard(name);
      deletedCount++;
    }
    return deletedCount;
  }
}

module.exports = { DashboardPage };
