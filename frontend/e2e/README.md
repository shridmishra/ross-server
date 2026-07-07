# UI E2E tests (Playwright)

Browser-driven end-to-end tests for the MATUR.ai frontend. Everything is driven
through the **real UI** with **component-based locators** (getByRole / getByText /
getByPlaceholder — no CSS selectors), so the tests read like the product.

Auth uses the app's real login; the JWT lives in `localStorage["auth_token"]`,
captured once by `auth.setup.js` and reused by the specs.

## Setup

```bash
cd frontend
npm install -D @playwright/test dotenv
npx playwright install --with-deps chromium
cp e2e/.env.e2e.example e2e/.env.e2e     # then fill in a TEST account
```

## Run

> Run from the **`frontend/`** root (where `playwright.config.js` lives), NOT from
> `e2e/`. Playwright only reads the config in the directory you invoke it from; run
> it from `e2e/` and it loads no config (no `baseURL`, no login setup) and fails
> with `Cannot navigate to invalid URL "/dashboard"`. The `npm run` scripts below
> always execute from the package root, so they work from anywhere in the repo.

```bash
npm run test:e2e                              # all
npm run test:e2e -- project-lifecycle         # just create/delete
npm run test:e2e -- aima-report               # full assessment → report (slow)
npm run test:e2e:ui                           # interactive
npm run test:e2e:report                       # open last HTML report

# or, only from the frontend/ directory:
npx playwright test aima-report
```

## Layout

```
playwright.config.js          setup → chromium projects; 8-min timeout for the AIMA walk
e2e/
├─ constants.js               storage-state path, creds, answer options
├─ auth.setup.js              logs in once, saves signed-in state
├─ support/
│  ├─ selectors.js            component-based locators, grouped by screen  ← extend here
│  └─ flows.js                reusable UI flows (create / start / answer-all / delete)
└─ tests/
   ├─ project-lifecycle.spec.js   create a project, then delete it
   └─ aima-report.spec.js         create → answer full AIMA → evaluate report → download
```

Adding coverage later (premium features, settings): add locators to
`support/selectors.js`, compose flows in `support/flows.js`, and write a new spec
under `tests/`. Keep locators role/text-based.

## Notes

- **The AIMA spec answers ~145 questions in the UI** (walks every question via
  "Next", then submits), so it takes a few minutes. Answering every question
  "Yes" yields a perfect 3.00 overall score, which the report assertion checks.
- **Download Report is currently gated by AI insights.** On the report page the
  "Download Report" button is disabled and shows "Preparing insights..." until
  the AI-insights job finishes. In the current deployment that job never
  completes, so the button never enables and the PDF can't be downloaded — the
  download step fails with an explicit message. This is a real product issue, not
  a test bug; the step will pass unchanged once insights complete (or against an
  environment where the AI backend is configured).
- Seeding specs create and delete throwaway projects on the test account — use a
  dedicated test account, never a real customer's.
```
