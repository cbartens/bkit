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
| 3 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "the canonical shape puts each option on its own line with its effect" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "the canonical shape carries a Default if unanswered line from the fixed set" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "the canonical shape gives a hard blocker Recommended: none" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "the canonical shape ends a message with the reply line and the one-by-one offer" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "RED-PROOF: an option line with no effect fires the option-line rule" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "the Question layout bullet points to § Human questions" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "the canonical shape keeps the plain-English rule for the question, each option and the recommendation's reason" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "no workflow carries the retired reply wording" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "bkit-build: the Decision Pause yes line uses the shared reply wording" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "every workflow that asks the owner states the question, each option and the recommendation's reason in plain English" | red | passed |

## Gaps

None.
