# Question Wording Audit — AIMA / CRC / Vendor Assessments

**Date:** 2026-07-08
**Scope:** All user-facing assessment question banks reachable from the dashboard at
`https://ross-server-w14l.vercel.app/dashboard` — AIMA (144 questions), CRC (138
controls), and the Vendor Risk Assessment (18 questions). "Fairness & Bias Testing"
prompts were excluded — those are AI red-teaming prompts sent *to* a customer's model
for evaluation, not questions a human answers, so a wording-vs-answer-type review
doesn't apply.

**Method:** Read the exact question/control text served to the UI (
`backend/src/data/aima.json` + `backend/src/scripts/seeds/seedAIMA.ts` — byte-identical,
both feed `aima_questions`; `backend/migrations/1782000000000_crc-controls-v3-reseed.js`
for the 138 CRC controls; `backend/src/data/vendorPrefills.ts` for the 18 vendor
questions), cross-referenced against the answer options actually rendered
(`frontend/e2e/support/selectors.js`, `QuestionView.tsx`, `assess/[projectId]/crc/page.tsx`)
and the scoring logic that consumes each answer (`backend/src/routes/projects.ts`,
`backend/src/utils/crcScoring.ts`). This reads every question exhaustively from the
source that's actually deployed, rather than manually paging through ~300 questions
one at a time in the browser.

---

## Finding 1 (High) — Level‑1 AIMA questions are worded to describe an *immature* state, but the scoring model rewards "Yes" on them identically to advanced-state questions

**Where:** all 48 Level‑1 sub-questions in `backend/src/data/aima.json` (24 practices ×
streams A/B), e.g.:

- `Design / Threat Assessment A` — L1: *"Is there basic awareness or **informal**
  identification of threats specific to AI systems?"* vs. L3: *"Is **comprehensive**
  threat assessment consistently performed and integrated across AI lifecycle?"*
- `Operations / Event Management B` — L1: *"Are event responses **informally**
  conducted and **sporadically** documented?"*
- `Verification / Architecture Assessment B` — L1: *"Is architecture improvement
  **informally** measured and **occasionally** addressed?"*
- `Implementation / Defect Management B` — L1: *"Are basic technical methods
  **occasionally** used to identify and resolve defects?"*

**Why it's a wording/answer-type mismatch:** the answer scale is fixed at
No / Partially / Yes (0 / 1.5 / 3, see `frontend/e2e/constants.js`), and the score
for a practice is a flat average of all 6 of its questions —
`practiceScore = SUM(value) / questions_in_practice` (`backend/src/routes/projects.ts:1194`,
confirmed by the e2e suite's own comment: *"Answering every question 'Yes' yields a
perfect 3.00 overall score"*, `frontend/e2e/README.md`). That means to score a perfect
3.00, a respondent must answer **"Yes"** to a question that literally asserts their
practice is informal / ad hoc / occasional / sporadic — at the same time as answering
"Yes" to the Level‑3 question for the same practice asserting the opposite (systematic,
comprehensive, continuously reviewed). An organization that has genuinely matured past
ad-hoc, informal handling has no honest "Yes" available for the Level‑1 question — the
practice literally isn't informal anymore — yet answering "No" (the honest answer)
silently caps that practice's score below 3.00 even though the org is at the highest
maturity level. The wording treats "Yes" as always meaning "more mature," but for
Level‑1 questions "Yes" describes the least mature state.

**Impact:** every one of the 24 AIMA practices has this shape (2 Level‑1 questions per
practice), so this isn't an isolated typo — it's the base pattern for a third of the
question bank, and it directly muddies the resulting maturity score's meaning.

**Suggested fix (pick one):**
1. Reframe Level‑1 questions to ask about a *baseline being met*, worded so "Yes" stays
   compatible with also being true at higher maturity — e.g. *"Has your organization at
   least identified AI-specific threats, even informally?"* instead of *"Is
   identification only informal?"*
2. Or stop flat-averaging: gate/derive the practice's maturity level from the highest
   level whose questions are answered "Yes," rather than summing all 6 independently.

---

## Finding 2 (Medium) — Double- and triple-barreled questions bundle 2–3 separate claims into one No/Partially/Yes answer

30 AIMA questions (and a further 62 with a simpler two-part form — 92/144, ~64% of the
bank) ask about multiple distinct criteria joined by "and," but only one answer slot
exists. A respondent who meets 2 of 3 bundled criteria has no accurate option: "Partially"
collapses "met 2 of 3" and "met 1 of 3" into the same score, and there's no way to
signal *which* clause is unmet. This concentrates almost entirely in Level 2/3 questions
(Level 1 questions are usually single-clause).

Representative triple-barreled examples (full list of 30 available on request; pattern
is `X, Y, and Z` inside one question):

- *"Is the AI policy consistently **enforced** and **reviewed regularly** for
  **relevance, accuracy, and alignment** with organizational goals and external
  standards?"* (Governance / Policy & Compliance, L3A) — bundles enforcement, review
  cadence, *and* three separate alignment criteria into one answer.
- *"Are AI security training programs regularly **updated**, **mandatory**, and
  effectively **tailored** for different roles and responsibilities?"* (Governance /
  Education & Awareness, L3A)
- *"Is monitoring of datasets for **security, licensing, and ethical use**
  systematically **implemented** and regularly **audited**?"* (Data Management / Data
  Training, L3B)
- *"Are incident handling and resolution **proactively managed**, **optimized**, and
  regularly **audited**?"* (Operations / Incident Management, L3B)

Double-barreled examples (2 clauses):
- *"Are formal processes defined and **consistently followed** for secure deployment of
  AI systems?"* (Implementation / Secure Deployment, L2A) — an org can have the process
  defined but not consistently followed.
- *"Is there a **systematic and documented** approach for conducting regular
  architecture reviews?"* (Verification / Architecture Assessment, L2A)

**Suggested fix:** split each bundled question into its constituent single-claim
questions (standard survey-design practice — a "double-barreled question" is a
recognized anti-pattern), or explicitly define in the UI what "Partially" means when
multiple clauses are involved (e.g., a fractional/weighted sub-checklist instead of one
click).

---

## Reviewed and found consistent (no action needed)

- **CRC (138 controls,** `crc-controls-v3-reseed.js`**):** every `control_statement` is
  a declarative "SHALL ..." compliance statement (not a question), answered on a
  No / Partially / Yes / NA / Not Sure scale — the standard, correct format for a
  controls checklist (comparable to SOC 2 / ISO 27001 style audits). No statement is
  phrased as a question, none are empty/too short, no duplicates across control IDs,
  and every one carries a normative SHALL/MUST/SHOULD verb. Scoring in
  `crcScoring.ts` correctly excludes "NA" from the denominator and scores "Not Sure"
  as 0 (same as "No") while keeping it in the denominator — appropriate treatment,
  no complaints.
- **Vendor Risk Assessment (18 questions,** `vendorPrefills.ts`**):** these use a
  different, internally-consistent format on purpose — each `text` is a topic label
  (e.g. *"Data Retention & Zero Data Retention (ZDR)"*), not a question, paired with 4
  tiered, mutually-exclusive descriptive options (best → worst practice) rather than a
  Yes/No scale. All 18 follow this shape uniformly; no mismatch found.
- **AIMA structural completeness:** all 24 practices have exactly the expected 6
  questions (Levels 1–3 × Streams A/B, no gaps, no duplicated text across
  entries).

---

## Not reviewed

Could not verify these findings still hold against any question text an admin may have
hand-edited post-seed via the `/admin/aima` or `/admin/crc` editor routes (both allow
in-place edits to `question_text` / `control_statement`) — this audit reflects the seed
source, which is the same text `seedAIMA.ts` / the CRC reseed migration write on a fresh
deploy. Worth a spot-check of a handful of live questions in the dashboard if the admin
tools have been used to hand-tune wording since the last seed.
