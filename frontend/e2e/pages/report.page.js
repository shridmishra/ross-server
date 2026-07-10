class ReportPage {
  constructor(page) {
    this.page = page;

    this.overallScoreLabel = page.getByText(/overall score/i);
    // The big "X.XX" figure — renders before the domain breakdown in DOM
    // order, so .first() reliably targets it over a per-domain score.
    this.overallScoreValue = page.getByText(/^\d\.\d{2}$/).first();
    this.questionsEvaluated = page.getByText(/questions evaluated/i);
    this.questionsEvaluatedValue = page
      .locator("div", { hasText: /questions evaluated/i })
      .last()
      .getByText(/^\d+$/);
    this.domainBreakdown = page.getByText(/domain maturity breakdown/i);
    // Premium projects also render their premium domain(s); on this
    // deployment it's named "Test Premium Control Family …".
    this.premiumDomainRow = page.getByText(/premium control family/i).first();

    // Disabled and reads "Preparing insights..." until the AI-insights job
    // finishes; only then does it enable and read "Download Report".
    this.downloadButton = page.getByRole("button", { name: /download report/i });
    this.preparingInsights = page.getByText(/preparing insights/i);

    this.backToAssessmentButton = page.getByRole("button", { name: /back to assessment/i }).first();
  }

  async download() {
    const appeared = await this.downloadButton
      .waitFor({ state: "visible", timeout: 120_000 })
      .then(() => true)
      .catch(() => false);

    if (!appeared) {
      throw new Error(
        "Download blocked: the 'Download Report' button stayed disabled " +
          "('Preparing insights...') — the AI-insights job never finished."
      );
    }

    const [download] = await Promise.all([
      this.page.waitForEvent("download", { timeout: 60_000 }),
      this.downloadButton.click(),
    ]);
    return download;
  }
}

module.exports = { ReportPage };
