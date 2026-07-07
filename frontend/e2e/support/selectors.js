// Central, component-based locators grouped by screen. Everything here uses
// accessible/role/text/placeholder queries (getByRole / getByText / getByLabel /
// getByPlaceholder) — no CSS selectors — so the tests read like the UI and stay
// resilient to styling changes. Add new screens (premium, settings) here.

const auth = {
  emailInput: (p) => p.getByRole("textbox", { name: /email/i }).or(p.locator('input[type="email"]')).first(),
  passwordInput: (p) => p.locator('input[type="password"]').first(),
  signInButton: (p) => p.getByRole("button", { name: /sign in/i }),
};

const dashboard = {
  welcomeHeading: (p) => p.getByText(/welcome back/i),
  newProjectButton: (p) =>
    p.getByRole("button", { name: /new project/i })
      .or(p.getByRole("button", { name: /create your first project/i }))
      .first(),
  // A project card, located by its unique name (innermost region that also
  // contains the card's "Open menu" button).
  card: (p, name) =>
    p.locator("div", { hasText: name })
      .filter({ has: p.getByRole("button", { name: /open menu/i }) })
      .last(),
  cardMenuButton: (p, name) => dashboard.card(p, name).getByRole("button", { name: /open menu/i }),
  cardStartButton: (p, name) => dashboard.card(p, name).getByRole("button", { name: /^(start|continue)$/i }),
  menuItem: (p, name) => p.getByRole("menuitem", { name }),
};

const createDialog = {
  root: (p) => p.getByRole("dialog").filter({ hasText: /create new project/i }),
  nameInput: (p) => createDialog.root(p).getByPlaceholder(/enter project name/i),
  descriptionInput: (p) => createDialog.root(p).getByPlaceholder(/describe your ai system/i),
  submitButton: (p) => createDialog.root(p).getByRole("button", { name: /create project/i }),
};

const deleteDialog = {
  root: (p) => p.getByRole("dialog").filter({ hasText: /delete project/i }),
  confirmButton: (p) => deleteDialog.root(p).getByRole("button", { name: /^delete/i }),
  cancelButton: (p) => deleteDialog.root(p).getByRole("button", { name: /cancel/i }),
};

// Path-selection modal shown after clicking "Start" on a new project.
const pathModal = {
  continueAima: (p) => p.getByRole("button", { name: /continue with aima/i }),
};

const assessment = {
  questionCounter: (p) => p.getByText(/Question \d+ of \d+/).first(),
  // Answer option cards render the label ("No" / "Partially" / "Yes") as exact text.
  answerOption: (p, label) => p.getByText(label, { exact: true }).first(),
  nextButton: (p) => p.getByRole("button", { name: "Next" }),
  previousButton: (p) => p.getByRole("button", { name: "Previous" }),
  submitButton: (p) => p.getByRole("button", { name: /submit project/i }).first(),
  // Dialog shown by Submit when some questions are unanswered.
  missingDialog: (p) => p.getByRole("dialog").filter({ hasText: /unanswered|missing/i }),
};

const report = {
  overallScoreLabel: (p) => p.getByText(/overall score/i),
  questionsEvaluated: (p) => p.getByText(/questions evaluated/i),
  domainBreadown: (p) => p.getByText(/domain maturity breakdown/i),
  downloadButton: (p) => p.getByRole("button", { name: /download report/i }),
};

module.exports = {
  auth,
  dashboard,
  createDialog,
  deleteDialog,
  pathModal,
  assessment,
  report,
};
