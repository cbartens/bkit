Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
Loosened: none
Fingerprint: 827c9e03e0e63743c4ee21aa90e76c9c97973663c3756a8582744e013c937257
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

6 of 6 (the plan has 6 task groups)

## Integration Gaps

0 integration gaps. The cross-group contracts hold:

- Since the test base `e3415a4f6` (holistic 5), the branch outside `docs/plans/` changed `tests.ts` and `steps.ts` with their `dist/` files, `steps.test.ts`, `tests.test.ts`, `workflow-shape.test.ts`, the tests and verify prompts with their five host mirrors, the two catalogs (`.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/workflows.md`) and their rendered copies, `.bkit/instructions.md`, `docs/testing.md`, `docs/capabilities.md`, `DETAILS.md`, `.bkit/version`, `.bkit/friction.jsonl` and `docs/deferrals.jsonl`.
- Group 5 into groups 1-4: `lockBaselines` (`tests.ts:349`) now reads `changedTests` only from the three `CODE_STEPS` rows, and only from records that carry a reason. It moves a `block: null` red baseline onto the file's newest red blob. `touchedTests` (`tests.ts:452`) and `tests green`'s `changed` list both read it, so the lock and the report still share one baseline. `changed` is now built before the not-enforced return. `baselineDiff` reads a null blob as empty text. `fieldExtras` (`steps.ts:649`) refuses `--field changedTests=` in `steps finish` and `steps done`.
- Group 6 into groups 3 and 5: Task 11's `TEST FIRST` no longer names `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11`, and Task 19 owns it. The group 6 red row records it `passed-accepted` with blob `2925b22a`, which is the blob of `steps.test.ts` at HEAD and in the working tree. The test's `problem` check matches the refusal wording at `steps.ts:1387`.
- The branch's own lock passes on the current tree. I loaded `dist/commands/registry.js`, then called `touchedTests(top, status.jsonl, "build", plan)` read-only. It returned `[]`, so the next code step that runs on this branch's engine is not refused for any planned test. This closes the open concern from `build-plan-verify-5-3.md` and `-5-4.md`.
- The verify prompt rule, the tests-step restore bullet, the catalog rows, `docs/testing.md:314` and the exit 11 refusal text describe one behaviour. `steps finish` lets through only a `BLOCKED`-named change that adds lines. Verify reads the added lines and raises `test-loosened` for one that disables or loosens the test. The tests step restores from the entry's diff.

## Previously Attempted

- `build-plan-verify-holistic-1.md` to `-holistic-4.md`, with their remediation logs and `build-decision-1-4.md` / `-1-5.md`, are summarised in `build-plan-verify-holistic-1-5.md`.
- `build-plan-verify-holistic-1-5.md` (`PASS`, Tasks 1-13, 4 of 4 groups) was followed by challenge round 2 (`build-decision-1-6.md`, Fix now for Tasks 15 and 18), which added group 5.
- Group 5: `build-plan-verify-5-1.md` and `-5-2.md` (`CONCERNS`, each closed by its `build-plan-gaps-remediate-5-*-log.md`), then `-5-3.md` and `-5-4.md` (`FAIL` on the Task 11 test rewrite). `build-decision-1-7.md` (Fix now) moved that test into Task 19, which added group 6.
- Group 6: `build-plan-verify-6-1.md` (`PASS`, Task 19).

## Notes

- **Tasks satisfied:** 1 to 19.
  - Task 18 is ticked here for the first time. Every item of its `DONE WHEN` holds. The verify rule is at `bkit-build-plan-verify.md:96-100`, and the let-through gate is unchanged. The refusal text at `steps.ts:1387` says the engine refuses a `BLOCKED`-named change that removes a line, and that verify reads every added line. `docs/testing.md:314` says the same.
  - The one gap that kept Task 18 open in `build-plan-verify-5-4.md` (Fixable: false) is closed by `build-decision-1-7.md` (`Decision: Fix now`, the owner's words, not assumed) and by Task 19.
- **Tests named by a `DONE WHEN` or `TEST FIRST`:** all 42 exist exactly once in their target files (checked with `grep -cF` on each name's last segment).
- **Derived Test Matrix:** every row maps to one task's `TEST FIRST`. The `removes a line` row maps to Task 19, and the Static row to Task 7.
- **Evidence I ran:**
  - `node dist/cli.js tests changed --base=e3415a4f6463c866793f64ac09644c8530aa0e63 --fallback=bkit:gate:static-unit` exited 0 with `verdict: PASS`, `gate: bkit:gate:changed`, and every stage passed.
    - Related: 38 files, 2365 tests passed.
    - Named vitest: 143 files, 8105 passed and 2 skipped. This stage named `steps.test.ts`, `tests.test.ts`, `planned-test-lock.integration.test.ts`, `workflow-shape.test.ts` and `render/trackers.test.ts`.
    - The node, bats, lint, format and types stages passed.
    - The machine printed `db unavailable: 3 GB free`. No test failed under it.
  - `node dist/cli.js check` exited 0, with `0 write(s) would occur` and 0 blockers, so the host mirrors and rendered catalogs match their sources.
  - `pnpm tsx .bkit/core/engine/tools/instructions.ts` exited 0.
  - `bash scripts/graphify/bkit-graphify.sh check-at HEAD` exited 0 (`docs/capabilities.md matches a rebuild at 0f44565d4`). `build-decision-1-5.md` Q1 still covers the plain `pnpm bkit:graph:check` local drift.
  - I did not run `pnpm build` or `bkit:check:dist`, because this step does not build. `dist/commands/workflow/steps.js` carries `fieldExtras` and the new refusal text, and `tests.js` carries `newestBlob` and `CODE_STEPS`. Pre-push and CI run `bkit:check:dist`.
- **Test-first audit:** none was supplied to this pass. `build-tests-green-6-1.md` (`Enforced: true`, 0 gaps, 0 unproven) lists Task 19's test under `Already landed`. Its reason is that `steps.ts:1387` already words the refusal as the test checks. The group 5 audits (`build-tests-green-5-1.md` to `-5-4.md`) list Task 15's `still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11` as `Already landed`. Their reason is that the engine already refused any edit to an unlocated test's whole file.
- **Decision records:**
  - `build-decision-1-6.md` (`Fix now`) shapes Tasks 15 and 18.
  - `build-decision-1-7.md` (`Fix now`) created Task 19.
  - `build-decision-1-5.md` (`Accept`) covers the local graph drift.
  - `build-decision-1-1.md` to `-1-4.md` are as recorded in holistic 5.
  - None of these records is `Accept (assumed)`.
- **Documentation Updates:** every row is done. Group 5 kept the `bkit-build-plan-verify` catalog row and the § Test-first Judgement row in line with the new verify rule.
- **Observability:** `docs/observability.md` is present. The refusal path still records its friction row. The new `--field changedTests` refusal is a usage error that writes nothing.
- **Out of scope, proposed separately:** carried from the group 5 reports. `runs.ts:2329` writes a `step-done` row with any `--step` and raw `--field` extras, so a forged `changedTests` record could still reach the lock through that path. Task 16's `DONE WHEN` names only `steps finish` and `steps record`.

## Identified Gaps Log

None
