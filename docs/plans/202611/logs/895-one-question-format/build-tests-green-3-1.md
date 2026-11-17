Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/895-one-question-format-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-build: every decision item option carries an effect" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-build: the pause message shows the default line and Recommended: none" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-build: a one-by-one reply asks the questions one at a time" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-build: the one-by-one offer follows the asked count" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-debug: the CI-run question releases the lock only on Stop" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/owner-wait-rows.test.ts` "a pre-status wait sits before workflows start and names no owner-pause row" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-debug: the loop question gives each option its effect and the recommendation a reason" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-debug: the loop question's recommendation reason matches its trigger" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-debug: every question shows a Default if unanswered line" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-debug: the branch check asks a formatted question" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-debug: the CI-run stop asks a formatted question" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-debug: the branch check and CI-run question show Recommended: none and a Default if unanswered line" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-debug: the foreign-path stop shows the Action needed line" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-debug: every question message ends with the reply line its point uses" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-ship: the assumed-item question gives each option its effect" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-ship: an assumed item is a hard blocker with Recommended: none" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-ship: every question shows a Default if unanswered line" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-ship: the merge question gives each option its effect" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-ship: every question message ends with the reply line its point uses" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-design: the grill question gives each option its effect and the recommendation a reason" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-design: the draft-scenario question gives each option its effect" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-design: every question shows a Default if unanswered line" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-design: the grill message ends with the reply line and the one-by-one offer" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "the one-by-one open-questions pass forbids the host question tool in design and plan" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-design: a one-by-one grill round counts as one grill turn" | red | passed |

## Gaps

None.
