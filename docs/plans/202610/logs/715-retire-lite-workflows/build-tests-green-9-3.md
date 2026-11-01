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
| 18 | `.bkit/core/engine/commands/workflow/disk.test.ts` "worktree setup's low-disk sweep stops waiting after maxWaitMs while a live sweep holds the lock" | recorded 2026-11-01T02:59:30Z | no | passed |
| 19 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch" | missing | — | passed |

## Gaps

None.

## Test exceptions

- Task 19 — honoured; cleared `no-red` for `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "bkit-build.md: a held run's Failure Path and Decision Pause never push the feature branch"
