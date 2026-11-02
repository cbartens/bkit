Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` "pins selected evidence variables and clears inherited pins without selection" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` "accepts only matching complete CI receipts with nonempty logs" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/context-fetch.test.ts` "validates adapted legacy and fallback context through the same receipt path" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "fetches pinned attempts without branch discovery and filters unpinned discovery" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "emits complete receipts only after all selected job logs succeed" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "ends pinned diffs at selected commits with ancestral same-workflow baselines" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "keeps adopted GitHub context blocks equal to shipped blocks" | passed-accepted | passed |
| 8 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "routes selected evidence through context diagnosis and generation-scoped fixes" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "honors CI reproduction before remediation and blocks unreproduced failures" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/runs.test.ts` "requires selected other-workflow success at the exact pushed head" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "retains original and verifying run identities through close and auto handoff" | red | passed |

## Gaps

None.

## Already landed

- Task 7 `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` "keeps adopted GitHub context blocks equal to shipped blocks" — passed at the group's red, and the tests step accepted it: existing CI and diff fenced bodies in .agents/context.md equal .bkit/templates/context/bkit-github.md; no red is due
