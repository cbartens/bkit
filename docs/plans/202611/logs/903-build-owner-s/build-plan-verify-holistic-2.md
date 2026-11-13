Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 1, 2, 3, 4, 6
Loosened: none
Fingerprint: 371ae57c2a29b3b5e4454c01c6cb2e0f28b3d723f15961e311958fef1afa38ea
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

5 of 5 (the plan has 5 task groups).

## Integration Gaps

1 integration gap, plus 2 failing tests logged as task gaps (both caused by Group 5 changing what earlier groups' tests and copies pin).

- Group 5 → Group 4 (Task 7): Tasks 8 and 9 edited `.bkit/core/workflows/bkit-build.md` and `.bkit/core/.bkit/workflows.md` after Task 7 regenerated the copies, and no later step re-renders them. `pnpm bkit check` exits 1 (`7 write(s) would occur — DRIFT DETECTED`): `.bkit/workflows.md`, the `.claude/`, `.cursor/` and `.opencode/` `bkit-build.md` commands, both `.agents` `bkit-build` skills and the `.bkit/version` pin. Task 7's DONE WHEN (`pnpm bkit check` passes with no drift) no longer holds.
- Group 5 → Group 3 (Task 5): Task 9 reworded step 6 (`bkit-build.md:249`) after the none-render baseline was written, so `trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` fails on the one line `bkit-build.none.txt:222`. Task 5's DONE WHEN names that test.
- Group 5 → Group 3/Group 2 fixtures (Task 8): the owner-chosen reopen rule in `openDecision` changes the result of the existing `workflows.test.ts:495` fixture, which writes a `DECIDED` file with no `build-decision` row.

The rest fits together: Task 8's reopen rule sends a resumed run to Decision Pause step 3, where Task 5's reuse rule and Task 9's early `Fix task:` write stop a second fix task block; `openDecision`'s `finished` paths are repo-relative, the same form `status.jsonl` decision rows carry (this run's own row names `docs/plans/202611/logs/903-build-owner-s/build-decision-1-1.md`). Task 3's `pausedGroups` reads only `build-decision` rows and decision-file headers, which Group 5 does not change.

## Previously Attempted

`build-plan-verify-holistic-1.md` (PASS, Tasks 1-7, before Group 5 existed). Group reports read: `build-plan-verify-1-1.md`, `-2-1.md`, `-3-1.md`, `-4-1.md` (CONCERNS, closed by `build-plan-gaps-remediate-4-1-log.md`), `-4-2.md`, `-5-1.md` (PASS; it named the two failing tests below as out of its scope).

## Notes

- Mode: Holistic, HEAD `5543db6b0`. Satisfied on HEAD: Tasks 1, 2, 3, 4, 6. Held back: Task 5 (its DONE WHEN names `render/trackers.test.ts`, which fails), Task 7 (`pnpm bkit check` drift), Task 8 (broke `workflows.test.ts:495` and did not fix it), Task 9 (left the none-render baseline stale). The code of Tasks 8 and 9 meets their own DONE WHEN text: `openDecision` in `workflows.ts:265-303` reopens a `DECIDED` / `ASSUMED` file no `build-decision` row names, and `bkit-build.md:227` writes `Fix task: {N}` before `tests plan-check`, with `.bkit/core/.bkit/workflows.md` and `.bkit/instructions.md` matching. Each held-back task clears once the three logged fixes land.
- Decision record `build-decision-1-1.md` (Q1, `Decision: Fix now — B - 1`, `Fix task: 8`) is the owner's direction Task 8 was rewritten to; it accepts no gap.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1 (`failed: related, named`). Both stages failed on the same 2 tests and nothing else: `related` 9576 passed / 2 failed, `named` 9545 passed / 2 failed. Lint, format and typecheck passed. Both failures were re-confirmed with a targeted `vitest run` of the two files (267 passed, 2 failed).
- Snapshot check: rendering `bkit-build.md` through `substituteWorkflow(…, "none")` into the scratchpad and diffing it against `bkit-build.none.txt` shows exactly one differing line (222), so `vitest run .bkit/core/engine/render -u` is the whole fix.
- Other checks on HEAD: `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0; `tsc --outDir {scratch}` + `diff -rq` against `dist/` shows no difference (dist is current, including `dist/commands/workflow/workflows.js`); `pnpm bkit:graph:check` matches a rebuild at `5543db6b0`; `pnpm prettier --check .bkit/core/.bkit/workflows.md docs/testing.md` passes. None of these runs changed the working tree.
- All 23 `TEST FIRST` names exist once in their named files, and each of the 23 `Derived Test Matrix` rows (plan lines 132-154) maps to its task's `DONE WHEN`. Ledgers: the 6 `903-*` decision keys are in `docs/decisions.jsonl`, both `Out of Scope` deferral keys are in `docs/deferrals.jsonl`, and the `docs/testing.md:639` `summary.test.ts` row names all three resolution cases. `docs/observability.md` is n/a per the plan.
- No test-first audit report was supplied for this round. The group audits recorded 0 gaps and 0 unproven; `build-tests-green-5-1.md` lists one Already landed test, Task 8's "workflows start does not report openDecision for a DECIDED decision file that a build-decision row names", accepted because the old `openDecision` already skipped every non-OPEN file and the test guards the new rule against reopening a finished pause.
- `tmp/bkit-diff-903-build-owner-s.md` is a partial diff against a stale local `origin/dev` and is mostly other issues' work; this run judged the plan's changes from `git diff dev...HEAD` (26 files outside `docs/plans`).
- Suggested fix order for the remediation round: fix the `workflows.test.ts:495` fixture, re-render the snapshot, then run `pnpm bkit upgrade` (or `pnpm bkit:generate`) and confirm `pnpm bkit check` exits 0.

## Identified Gaps Log

3 gaps.

- TASK 8: `.bkit/core/engine/commands/workflow/workflows.test.ts` `a resumed run prints its last DONE step; a closed decision is not open` (line 495) — test broken by Task 8 and not fixed: its fixture writes a `Status: DECIDED` decision file with no `build-decision` row, which Task 8's owner-chosen rule now reopens, so `openDecision` is no longer null. Fix: add a `build-decision` row naming `${REL}/build-decision-1-1.md` to the fixture, as the new test at line 613 does — Fixable: true
- TASK 9: `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt:222` — stale none-render baseline: it reads "only if step 5 has not written it yet" while `.bkit/core/workflows/bkit-build.md:249` reads "only if it is still missing after step 5" (the only differing line), so `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` fails, which also breaks Task 5's DONE WHEN. Fix: re-render with `pnpm exec vitest run .bkit/core/engine/render -u` and commit the snapshot — Fixable: true
- INTEGRATION: Group 5 (Tasks 8, 9) changed `.bkit/core/workflows/bkit-build.md` and `.bkit/core/.bkit/workflows.md` after Group 4's Task 7 regenerated the copies, so Task 7's DONE WHEN no longer holds: `pnpm bkit check` exits 1 with `7 write(s) would occur — DRIFT DETECTED` (`.bkit/workflows.md` lacks the **Resume after the answers** bullet and the step 5 `Fix task` sentence; `.claude/`, `.cursor/`, `.opencode/` commands and both `.agents` `bkit-build` skills lack Group 5's step 5/6 and Resume text; `.bkit/version` pin). Fix: `pnpm bkit upgrade` (or `pnpm bkit:generate`) after the snapshot fix, and commit the re-rendered copies — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 8: existing test broken by the reopen rule and not fixed
  **Severity:** MEDIUM · **Class:** test-broken · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.test.ts:495` · **Round:** 1
  - **DONE WHEN:** workflows.test.ts "a resumed run prints its last DONE step; a closed decision is not open" passes: its fixture adds a build-decision row naming ${REL}/build-decision-1-1.md, and the test still expects openDecision null
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/workflows.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 9: none-render baseline stale after the step 6 rewording (breaks Task 5 DONE WHEN)
  **Severity:** MEDIUM · **Class:** test-broken · **Fixable:** true · **Location:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt:222` · **Round:** 1
  - **DONE WHEN:** pnpm exec vitest run .bkit/core/engine/render -u re-renders bkit-build.none.txt from .bkit/core/workflows/bkit-build.md and trackers.test.ts "bkit-build: the none render matches its baseline byte for byte" passes
  - **TEST FIRST:**
    - .bkit/core/engine/render/trackers.test.ts
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** INTEGRATION: Group 5 wording never re-rendered into the copies; bkit check reports drift (Task 7 DONE WHEN)
  **Severity:** MEDIUM · **Class:** integration · **Fixable:** true · **Location:** `.claude/commands/bkit-build.md:229` · **Round:** 1
  - **DONE WHEN:** after pnpm bkit upgrade (or pnpm bkit:generate), pnpm bkit check exits 0 with no drift and .bkit/workflows.md, the .claude/.cursor/.opencode bkit-build commands and both .agents bkit-build skills carry Group 5 text
  - **TEST FIRST:**
<!-- bkit:task 3 end -->
