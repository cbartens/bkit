Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 2: Post a Plan Current comment whether the step runs or self-skips — Step 5 now finishes twice: exit 12 → sub-step 2 `steps finish --step=build-plan-current --attempt=1 --number=5 --post --title="Plan Current" --comment-field="Status=skipped (no plan anchor)"` (no `--agent`, no `--artifact`) then Step 6; exit 0 → sub-step 3 subagent, sub-step 4 the agent finish unchanged, sub-step 5 the plan-currency advisory; Gate 5 names both routes. Two tests in `workflow-shape.test.ts` (`Plan Current posts a comment whether it runs or skips`, `Plan Current's skipped comment says no plan anchor`) plus module-level helpers `stepFinishLines` / `withNoAgent`, 3 reds recorded, `bkit-build.none.txt` regenerated with `vitest -u`; `.bkit/instructions.md` `#### bkit-build` entries moved with the changed lines (coverage 0 findings); DONE WHEN suites `workflow-shape.test.ts` + `trackers.test.ts` → 336 pass; `pnpm bkit:gate:static` passes (.bkit/core/workflows/bkit-build.md, .bkit/core/engine/audits/workflows/workflow-shape.test.ts, .bkit/core/engine/render/**snapshots**/bkit-build.none.txt, .bkit/instructions.md, docs/plans/202610/logs/705-build-plan-convert/build-brief-2-1.md)

## Task detail

### TASK 2 — Plan Current posts on both routes

- Workflow: Step 5 sub-steps renumbered 1-5 (anchor read → skip finish / subagent → finish → advisory); the exit-0 route keeps `--attempt=1 --agent=bkit-build-plan-current --artifact=… --number=5 --post --title="Plan Current"`; the skip route's commit message is `chore({FID}): plan-current skipped`, and `steps finish` commits allow-empty so a row and a comment land with no artifact.
- Gate 5 items: `Base commit resolved, or the missing anchor named as the skip`, `Subagent invoked (…) when the base commit resolved`, `Mechanical checks passed (steps finish)`, `Plan not revised`, `Advisory emitted when the base commit resolved` — shape copied from Gate 4's conditional item, no exit code or variable in a gate item.
- `sharedStepNumbers` / `commentNumberProblems` still hold with two `build-plan-current` finishes (one number, one title): `workflow-shape.test.ts` 234 pass.

### Reds recorded

<!-- prettier-ignore -->
| # | Test | Red evidence | Failing reason |
| --- | --- | --- | --- |
| 1 | `workflow-shape.test.ts` `Plan Current posts a comment whether it runs or skips` | `build-task-red-2-2-1.md` | `expected [ Array(1) ] to have a length of 2 but got 1` |
| 2 | `workflow-shape.test.ts` `Plan Current's skipped comment says no plan anchor` | `build-task-red-2-2-2.md` | `expected [] to have a length of 1 but got +0` |
| 3 | `trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` | `build-task-red-2-2-3.md` | snapshot mismatch; baseline still held one Plan Current finish. Recorded after the workflow edit and before `vitest -u`: a baseline test cannot fail before the source it snapshots changes |

### Test-first audit

`bkit tests green --group=2` reports 2 gaps, both `test-changed` on `workflow-shape.test.ts` for the two TASK 2 tests, `testOrderOnly: true`. Cause: both tests were written without the `&&` compound predicate oxlint's `vitest(no-conditional-in-test)` rejects, so after the reds the predicates moved into module-level helpers `stepFinishLines` / `withNoAgent`; assertions and test bodies' meaning unchanged. `tests.ts` `onlyAddsLines` tolerates inserted lines only, and the knowledge row `red-snapshot-freezes-the-test-file-write-it-lint-clean-first` names this exact case ("even for a lint fix") → the gap is a hard blocker for the owner at the Decision Pause, not a reason to re-run a red against landed code. The reds still stand, the tests pass, and no `TEST EXCEPTION` was written by this agent.

### Files touched outside the task's UPDATE list

- `.bkit/instructions.md` — `#### bkit-build` fenced entry list: replaced the 3 stale entries (`**If** exit 12 → Step 6.`, `Base commit resolved`, `Advisory emitted`) with the new text and added the 5 new standing lines. Without it `instructions-coverage.test.ts` (`the repo > has no coverage findings`) fails with 8 findings; keep-current puts the mirror in the same change as the workflow. TASK 3 still owns the `.bkit/core/.bkit/workflows.md` catalogue and its `pnpm instructions:sync`; `instructions.test.ts` 96 pass and coverage 22 pass here.
- `docs/plans/202610/logs/705-build-plan-convert/build-brief-2-1.md` — `pnpm format:check` flagged the orchestrator-written brief; `prettier --write`, no content change. No gate config was edited.

### Verification run

- `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/render/trackers.test.ts` → 2 files, 336 tests pass (DONE WHEN).
- `pnpm vitest run .bkit/core/engine/audits .bkit/core/engine/tools/instructions-coverage.test.ts .bkit/core/engine/commands/workflow/step-table.test.ts` → 2906 tests, 0 fail after the store fix; `instructions.test.ts` 96 pass.
- `pnpm bkit:gate:static` → pass (typecheck, lint, format, tables, prose, slop delta 0).
