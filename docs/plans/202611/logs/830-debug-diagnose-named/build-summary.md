Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-plan-gaps-remediate (group 2) FAIL, answered by build-plan-verify
- build-plan-tasks (group 3) FAIL, answered by build-plan-verify
- build-plan-verify-holistic CONCERNS
- build-plan-tasks (group 5) FAIL, answered by build-plan-verify

Plan tasks: 14 of 14 ticked in `docs/plans/202611/830-debug-diagnose-named-plan.md`.

Publish: pr

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-input-2.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | - |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-install-skills.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 2 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-verify-2-2.md` |
| build-plan-gaps-remediate (group 2) | FAIL | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-gaps-remediate-2-1-log.md` |
| build-group-gate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-group-gate-2-2.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | FAIL | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 3 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-verify-3-3.md` |
| build-plan-gaps-remediate (group 3) | PASS | - | 2 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-gaps-remediate-3-2-log.md` |
| build-group-gate (group 3) | PASS | - | 2 | `docs/plans/202611/logs/830-debug-diagnose-named/build-group-gate-3-3.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-verify-4-1.md` |
| build-plan-verify-holistic | CONCERNS | 1 | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-verify-holistic.md` |
| build-challenge | PASS | 0 | 2 | `docs/plans/202611/logs/830-debug-diagnose-named/build-challenge-1.md`, `docs/plans/202611/logs/830-debug-diagnose-named/build-challenge-2.md` |
| build-group-start (group 5) | - | - | 1 | - |
| build-plan-tests (group 5) | PASS | - | 2 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-tests-red-5-1.md` |
| build-plan-tasks (group 5) | FAIL | - | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-5-log.md` |
| build-plan-verify (group 5) | PASS | 0 | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/build-plan-verify-5-1.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/830-debug-diagnose-named/run-tests-1.md` |

## Challenge

- Task 12 — HIGH — ticked (`docs/plans/202611/830-debug-diagnose-named-plan.md`)
- Task 13 — HIGH — ticked (`docs/plans/202611/830-debug-diagnose-named-plan.md`)
- Task 14 — HIGH — ticked (`docs/plans/202611/830-debug-diagnose-named-plan.md`)

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

- BLOCKED — TASK 3: Persist selection atomically and route by its generation. — First changed-file gate passed 3923 related and 6205 named tests, lint and typecheck, but status.ts formatting failed; Prettier has corrected it and the required regenerated gate rerun is pending (tmp/group2-changed.log). (`docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-2-log.md`)
- BLOCKED — bkit:generate: initial build rejected Array.findLast under the existing ES2022 target; replaced it with the existing reverse/find pattern (tmp/gap2-generate.log) (`docs/plans/202611/logs/830-debug-diagnose-named/build-plan-gaps-remediate-2-1-log.md`)
- BLOCKED — bkit:generate: instructions:sync rejected unregistered workflow instruction changes; updating the canonical instruction registry before retrying. (`docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-3-log.md`)
- BLOCKED — TASK 8: Wire selection, reproduction and final proof through Debug — initial changed-file gate found an underused shared instruction clause and conditional assertions in the updated legacy audit; both are corrected for revalidation. (`docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-3-log.md`)
- BLOCKED — TASK 14: test `.bkit/core/engine/commands/workflow/runs.test.ts` `requires selected other-workflow success at the exact pushed head` — the earlier frozen Task 8 inline transport omits repository and head_repository on intended successful runs; the required fail-closed provenance contract now rejects that incomplete fixture. The five current planned regressions pass, but the full runs suite has 184 passes and this one failure. Planned case preserved for orchestrator resolution (tmp/830-group5-task14.log). (`docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-5-log.md`)
- BLOCKED — bkit:generate: [bkit-instructions] .bkit/instructions.md .bkit/core/workflows/bkit-debug.md:350: no entry — add under #### bkit-debug: Derive this runs next test round independently of DEBUG_ATTEMPT, which numbers workflow runs. The instruction registry needs the two new local sentences registered before generation can finish (tmp/830-group5-generate.log). (`docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-5-log.md`)
- BLOCKED — TASK 13: Changed-file gate initially found ordinary output/shape assertion drift and counter-audit violations in addition to the frozen legacy Task 8 fixture. The source now keeps finish --attempt=next so the completion derives its round in-block, while tests run uses the same prederived next count; the bare counter prose was corrected. Only the nonplanned local-output assertion and workflow-shape row were updated to the new contract (tmp/830-group5-changed.log). (`docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-5-log.md`)
- BLOCKED — TASK 14: Final changed-file gate — exitCode 1, verdict FAIL solely because the preserved earlier frozen selected-workflow fixture omits required repository provenance. Related tests have 1 failure and 1,788 passes; named tests have 1 failure and 7,116 passes with 2 existing skips. Lint, formatting and both source/test typechecks pass. The orchestrator will correct that fixture through a separately recorded tests step; no incomplete-provenance result was accepted (tmp/830-group5-changed-final.log). (`docs/plans/202611/logs/830-debug-diagnose-named/build-plan-tasks-5-log.md`)

## Recommended Next Step

```text
/bkit-ship #830
```
