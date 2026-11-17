Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 6, 8, 9, 10
Loosened: none
Fingerprint: d011899e24462a57df3fb979a09f7e166525df9b1302b1fadc5366a3fbebf42c
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 task groups)

## Integration Gaps

2 integration gaps, both left by Group 3 against a Group 2 `DONE WHEN`:

1. **Render baseline (Tasks 5 and 11).** Task 11 added the `diff` to the § Decision Pause `CHANGED_TESTS` item rule (`.bkit/core/workflows/bkit-build.md:154`). The none-render baseline `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt:127` still holds Task 5's wording. `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` fails, and Task 5's `DONE WHEN` names that test. Both group 3 code logs record `BLOCKED — bkit:generate` because the machine-wide tests lock was held, so the snapshot was never regenerated. Task 11 broke a test and did not fix it.
2. **Capabilities register (Task 7).** `pnpm bkit:graph:check` exits 1. The `docs/capabilities.md` committed at Task 7 (holistic attempt 2 saw it match at `2875682b3`) is not what `fab852ad0` produces: commands goes from 1865 to 1866 symbols (the new `baselineDiff` export), and the commands-to-shared edges go from 412 to 407. Task 7's `DONE WHEN` names this check.

Every other cross-group contract holds:

- `steps finish` stores `blob` (the baseline text) and `after` (`hash-object -w` of the file now) on each `changedTests` record. `lockBaselines` reads `after` as the next baseline's `text`, and it carries the chain's first `blob` as `origin`.
- `finish` judges additivity against `text` (the current baseline). `tests green` diffs `changed` against `origin` (the first baseline), so the owner sees the whole change since the red.
- Task 8's `fromChange` guard in `touchedTests` (`tests.ts:458`) keeps the holistic-1 `fromChange` field's meaning.
- `tests red`'s `standing` check still reads only `block`.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (`CONCERNS`, 4 gaps) and `build-plan-verify-holistic-2.md` (`PASS`, Tasks 1-7) covered Groups 1 and 2. Group 3 did not exist yet. `build-plan-gaps-remediate-holistic-1-log.md` closed holistic 1's gaps.
- Group 3 reports `build-plan-verify-3-1.md` (`FAIL`, 2 gaps; closed by `build-plan-gaps-remediate-3-1-log.md`), `build-plan-verify-3-2.md` (`FAIL`, 1 gap; accepted by `build-decision-1-3.md`) and `build-plan-verify-3-3.md` (`PASS`, Tasks 8-11).

## Notes

- **Tasks satisfied:** 1, 2, 3, 4, 6, 8, 9 and 10. Each `DONE WHEN` holds. Every group 3 `TEST FIRST` test exists exactly once: 5 in `steps.test.ts`, 1 in `tests.test.ts` and 2 in `workflow-shape.test.ts`. All of them pass.
- **Tasks not satisfied:**
  - Task 5: `trackers.test.ts` fails.
  - Task 7: `pnpm bkit:graph:check` exits 1.
  - Task 11: its code, prompts, docs and 5 tests are in place, but it left the render baseline it broke unfixed.
- **Evidence I ran:**
  - `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` (run as `node dist/cli.js tests changed ...`) exited 1 with `verdict: FAIL` and `failed: named`.
    - Related unit stage: 135 files passed; 6561 tests passed, 2 skipped.
    - Named stage: 1 failed of 8563 (`trackers.test.ts`, the snapshot above); 160 files passed.
    - node, bats, lint, format and types stages ran with no failure.
  - `node dist/cli.js check` exited 0, with `0 write(s) would occur` and 0 blockers.
  - `pnpm tsx .bkit/core/engine/tools/instructions.ts` exited 0.
  - `pnpm bkit:graph:check` exited 1 (gap 2). It left no tracked file changed.
- **Decision records:**
  - `build-decision-1-3.md` (`Decision: Accept`, `VERIFY_GAPS`, group 3) accepts the 13 planned tests of Tasks 2-4 that commit `cc3170b86` rewrote, so they are no gap here. Ledger row: `914-group3-rewrites-of-earlier-planned-tests`.
  - `build-decision-1-2.md` (`Fix now — diff + refuse`) is the direction Task 11 follows.
  - `build-decision-1-1.md` concerns group 1's gate.
- **Test-first audit:** none was supplied to this holistic pass, so step 8 had nothing to decide.
- **Documentation Updates:** every row is done. `docs/testing.md:314` and `:740`, `.bkit/core/.bkit/workflows.md` (§ Decision Pause `:991`/`:995`, § Test-first `:1796-1802`), `.bkit/core/.bkit/prompts.md`, `.bkit/core/docs/templates/bkit-plan.md` and `.bkit/instructions.md` all match the code. The `docs/knowledge.jsonl` correction belongs to ship's doc update.
- **Observability:** `docs/observability.md` is present. The refusal path still logs through `ctx.log` and appends the `agent-rework` friction row, and a let-through writes `changedTests` on the row.
- **Not gaps:**
  - The three LOW build-challenge findings recorded in `docs/deferrals.jsonl` (`914-build-planned-test-challenge-low-*`) are outside the runbook.
  - The `BLOCKED — bkit:generate` lines in `build-plan-tasks-3-log.md` and `build-plan-gaps-remediate-3-1-log.md` do not satisfy any `DONE WHEN`. They are the cause of gap 1.

## Identified Gaps Log

2 gaps.

INTEGRATION: Task 7 DONE WHEN (`pnpm bkit:graph:check` exits 0 with no drift) no longer holds after Group 3 (Tasks 8-11): `pnpm bkit:graph:check` exits 1, `docs/capabilities.md` is not what fab852ad0 produces (commands 1865 -> 1866 symbols from the new `baselineDiff` export, commands -> shared edges 412 -> 407); fix with `pnpm bkit:graph:refresh` and commit `docs/capabilities.md` and `DETAILS.md` — Fixable: true
INTEGRATION: Task 11 (Group 3) reworded the § Decision Pause `CHANGED_TESTS` item rule in `.bkit/core/workflows/bkit-build.md:154` but left `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt:127` at Task 5's (Group 2) wording, so `.bkit/core/engine/render/trackers.test.ts` `none render baselines > bkit-build: the none render matches its baseline byte for byte` fails (the one failure of `bkit tests changed --base=origin/dev`, exit 1) and Task 5's DONE WHEN no longer holds; regenerate with `vitest run .bkit/core/engine/render/trackers.test.ts -u` and check that only that line changes — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** INTEGRATION: Task 11 left the bkit-build none-render baseline at Task 5 wording, so trackers.test.ts fails
  **Severity:** MEDIUM · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt:127` · **Round:** 1
  - **DONE WHEN:** `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` passes against a baseline regenerated after Task 11 edited `.bkit/core/workflows/bkit-build.md:154`, with only that line changed
  - **TEST FIRST:**
    - .bkit/core/engine/render/trackers.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** INTEGRATION: Group 3 baselineDiff export left docs/capabilities.md stale, so Task 7 graph check fails
  **Severity:** LOW · **Class:** integration · **Fixable:** true · **Location:** `docs/capabilities.md:167` · **Round:** 1
  - **DONE WHEN:** `pnpm bkit:graph:check` exits 0 with no drift after `pnpm bkit:graph:refresh` and a commit of `docs/capabilities.md` and `DETAILS.md`
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
