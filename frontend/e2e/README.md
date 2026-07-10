# UI E2E tests (Playwright)

Browser-driven end-to-end tests for the MATUR.ai frontend, using the
Page Object Model. Locators are component-based (getByRole / getByText /
getByPlaceholder — no CSS selectors), so the tests read like the product.

Auth uses the app's real login; the JWT lives in `localStorage["auth_token"]`,
captured once by `auth.setup.js` and reused by the specs.

## Setup

```bash
cd frontend
npm install                              # @playwright/test + dotenv are already in package.json
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
```

## Layout

```
playwright.config.js          setup → chromium project
e2e/
├─ constants.js               storage-state path, creds, answer options
├─ auth.setup.js              logs in once, saves signed-in state
├─ pages/                     page objects, one class per screen  ← extend here
│  ├─ auth.page.js
│  ├─ dashboard.page.js
│  ├─ assessment.page.js      AIMA question flow
│  ├─ report.page.js          AIMA report
│  ├─ premium-features.page.js
│  ├─ wizard.page.js          AI System Profile Wizard
│  └─ crc.page.js
└─ tests/
   ├─ project-lifecycle.spec.js   create a project, then delete it
   ├─ aima-report.spec.js         all 3 answer states, edit + resubmit, nav/notes,
   │                              missing-answers dialog
   ├─ premium-feature.spec.js     disabled — CRC + premium suite coverage
   └─ fully-compliant.spec.js     disabled — CRC with full evidence trail
```

Only AIMA coverage is active right now. `premium-feature.spec.js` and
`fully-compliant.spec.js` are commented out in full (uncomment to re-enable);
their page objects (`premium-features.page.js`, `wizard.page.js`, `crc.page.js`)
are already in place.

Add new locators/actions as methods on the relevant page object; write a new
spec under `tests/`.

## Notes

- Answering every question "Yes" yields 3.00; "Partially" yields 1.50; "No"
  yields a score below the app's Level 1 threshold, so the report shows a
  "progress to Level 1 %" figure instead of a plain score.
- Download verification is disabled across the specs — the "Download Report"
  button is gated behind an AI-insights job that can take a while. Report
  content (score, questions-evaluated count, domain breakdown) is checked
  instead; a dedicated download check will be added separately.
- Seeding specs create and delete throwaway projects — use a dedicated test
  account, never a real customer's.
