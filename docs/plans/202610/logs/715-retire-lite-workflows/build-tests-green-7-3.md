Enforced: true
Verdict: PASS
Gaps: 0
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/715-retire-lite-workflows-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 14 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "no shipped prompt or workflow names a lite workflow" | missing | — | passed |
| 14 | `.bkit/core/engine/tools/instructions-sources.test.ts` "no shipped rule or prompt instructs a next:*:lite label" | missing | — | passed |
| 14 | `.bkit/core/engine/tools/instructions-sources.test.ts` "the clause store holds no lite text" | missing | — | passed |
| 14 | `.bkit/core/engine/audits/templates/templates.test.ts` "the change issue form names no lite workflow" | missing | — | passed |
| 14 | `.bkit/core/engine/audits/templates/templates.test.ts` "the shipped reference docs list no lite doc" | missing | — | passed |
| 15 | `.bkit/core/engine/audits/templates/templates.test.ts` "the root README points small changes at /bkit-build" | missing | — | passed |
| 15 | `.bkit/core/engine/audits/templates/templates.test.ts` "the root README carries the held handoff" | missing | — | passed |
| 15 | `.bkit/core/engine/audits/templates/templates.test.ts` "the root README carries the manual batch recipe with both limitations" | missing | — | passed |

## Gaps

None.

## Test exceptions

- Task 14 — honoured; cleared `no-red` for `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "no shipped prompt or workflow names a lite workflow", `no-red` for `.bkit/core/engine/tools/instructions-sources.test.ts` "no shipped rule or prompt instructs a next:*:lite label", `no-red` for `.bkit/core/engine/tools/instructions-sources.test.ts` "the clause store holds no lite text", `no-red` for `.bkit/core/engine/audits/templates/templates.test.ts` "the change issue form names no lite workflow", `no-red` for `.bkit/core/engine/audits/templates/templates.test.ts` "the shipped reference docs list no lite doc"
- Task 15 — honoured; cleared `no-red` for `.bkit/core/engine/audits/templates/templates.test.ts` "the root README points small changes at /bkit-build", `no-red` for `.bkit/core/engine/audits/templates/templates.test.ts` "the root README carries the held handoff", `no-red` for `.bkit/core/engine/audits/templates/templates.test.ts` "the root README carries the manual batch recipe with both limitations"
