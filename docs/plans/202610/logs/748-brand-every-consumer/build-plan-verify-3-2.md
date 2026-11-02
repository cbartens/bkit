Verdict: PASS
Failures: 0
Fixable: false
Tasks: 6, 7, 8, 13, 14
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md`: CONCERNS, 2 gaps (Task 7 and Task 8 planned tests not green). Tasks satisfied: 6.
- `build-plan-gaps-remediate-3-1-log.md`: FAIL, both gaps BLOCKED, because a code step may not edit a planned test.
- `build-decision-1-1.md` (verify attempt 1, Q1 and Q2): `Decision: Fix now`. Tasks 13 and 14 were added to rescope the two tests.

## Notes

- Mode: Group. Judged Tasks 6, 7, 8, 13 and 14 against `build-diff-3-2.md`. Since attempt 1, only `.bkit/core/engine/commands/install/upgrade.integration.test.ts` changed (commit 9d7d54563). No engine, `dist/` or `docs/migrations.md` change landed after 577ad0e77.
- Test run (this attempt): 53 group test files (`upgrade`, `core`, `index` and `template-copies` integration, `version-file`, `core.test`, `.bkit/core/engine/audits/templates/`, `dogfood-templates`, `.bkit/core/engine/checks/`): 2112 passed, 0 failed. A verbose rerun shows every named TEST FIRST test of Tasks 6, 7, 8, 13 and 14 passing, plus the 3 `#459 — bkit upgrade keeps bkit's recorded hash for a consumer-edited whole-file` cases. `index.integration.test.ts` passes.
- TASK 13 satisfied: `copy-and-own migration second upgrade logs no branded line for the hook and CI file` (line 1039) passes. It asserts that the hook and CI file are rewritten, that `canonicalHashes` has no entry for either before or after the second upgrade, that both files are byte-equal after the second upgrade with no old token, and that the second output has no `core: .husky/pre-push — branded` line. The assertion is not vacuous: the migration's real log line in `core.ts:927` is `core: ${file} — branded script and path names rewritten` (same em dash), so the substring matches it. The Task 7 title `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing` is gone from the file.
- TASK 14 satisfied: `a second template-file migration and a dry run leave scripts/ci and the hooks unchanged` (line 1130) passes. `snapshotTree` leaves out only `.claude/bkit-cloud.md`. The rest of the tree, which covers `scripts/ci/`, `.husky/` and the CI workflow, is equal after the dry run and after the second upgrade. The Task 8 title `a second template-file migration and a dry run write and move nothing` is gone from the file.
- TASK 6 satisfied (unchanged from attempt 1): `grep -rnw "House" .bkit/templates .bkit/core/.bkit .bkit/core/engine --exclude='*.test.ts'` is still empty. The 6 TEST FIRST tests and `template-copies.integration.test.ts` pass.
- TASKS 7 and 8 satisfied: attempt 1 found the code matches every field, and that code is unchanged. The only blocker was the two planned tests, and Tasks 13 and 14 replaced them under `build-decision-1-1.md` (`Decision: Fix now`). The replacement tests now prove "a second upgrade writes nothing" for both migrations.
- Test-first audit `not-green` (Task 7 and Task 8, `Fixable: true`): resolved, no gap. Each names a planned test title that Task 13 or Task 14 must remove ("the Task 7 test it replaces is gone from the file"; same for Task 8), as the owner chose in `build-decision-1-1.md`. Their replacements pass. Out of scope for this step: the plan's Task 7 and Task 8 `TEST FIRST` lines still name the old titles. A holistic test-first audit may raise these two gaps again unless the plan text points at the Task 13 and Task 14 titles.
- Test-first audit `delete-still-referenced` (8 entries, Task 6, `Fixable: null`): no gap, the same judgement as attempt 1. Every hit is a Vale rule name (`Filler`, `Hedging`, `LLMSlop`, `Verbose`) that now lives under `Bkit/` with the same file name, or an unrelated English word. The files those hits sit in did not change in this attempt.
- Unproven (listed for the owner's end-of-build answer, no gap): Task 7 `upgrade.integration.test.ts` `copy-and-own migration writes record no canonical hash and a second upgrade writes nothing`; Task 8 `upgrade.integration.test.ts` `a second template-file migration and a dry run write and move nothing`. Both are the titles that Tasks 13 and 14 removed.
- Already landed (no gap): Task 13 `copy-and-own migration second upgrade logs no branded line for the hook and CI file`. The tests step's reason: "Task 7 migration already behaves so; test is a rescoped replacement". Task 14 `a second template-file migration and a dry run leave scripts/ci and the hooks unchanged`. The tests step's reason: "Task 8 migration already idempotent; snapshot now skips .claude/bkit-cloud.md".
- Enforced: true. The audit report has no `Updated tests` section, so no `test-loosened` entry applies. The narrowed second-run output check is the change that Task 13's plan text and the owner's decision call for.
- Observability: no new error paths since attempt 1. The migrations still report through `console.log` / `console.warn` with `logPrefix`.

## Identified Gaps Log

None

