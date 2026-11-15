Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: none
Loosened: none
Fingerprint: 23f19830296144e78987f8ce590ce1a0a10694a152f2b5150a874410befa3a2c
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 4 `DONE WHEN` holds in `.bkit/core/workflows/bkit-build.md`: step 2 titles verify items `Task {N}` (line 143), step 6 sets `DECISION_ROUTE` = `continue` after `fix` / `retry` and before `holistic` / `verify`, with the `Gate: FAIL` exclusion (line 268), step 7 routes holistic to Step 11 and verify to `tasks tick --decision` then Step 7 (lines 306-307), and the gate has its checklist line (line 338). The title form matches the `\bTask (\d+)\b` match in `.bkit/core/engine/commands/workflow/tasks.ts:219`. Its three `TEST FIRST` tests were red, then green.
- TASK 5 `DONE WHEN` holds: `.bkit/core/.bkit/workflows.md` has the **Re-runs follow answers** invariant row, `continue` in the `route` field values, the Step 15 row and the Decision Pause `Then:` bullet, and `docs/decisions.jsonl` has row `957-reruns-follow-answers` (valid JSON). Its test passes on today's debug and ship `Options:` lines.
- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: 279 of 279 tests pass.
- Tasks 4 and 5 are left off `Tasks` because each broke a test it did not fix (see Identified Gaps Log). Running `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` (the check `.bkit/authoring.md` § Before You Save asks for) shows 8 findings, and every one comes from this group's edits: 7 fail `instructions-coverage.test.ts` and 1 fails `instructions-sources.test.ts`. `pnpm instructions:show --file bkit-build.md` exits 1 here too, as the tasks step reported.
- Already landed: Task 5 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug and ship questions offer no answer that re-runs a check without a change". It passed at the group's red and the tests step accepted it, because today's debug and ship `Options:` lines offer only Stop, Try again, Confirm and Reject. No gap.
- Test-first audit: `Enforced: true`, 0 gaps, 0 unproven. No supplied decision record. This is the first verify attempt for group 2.
- Holistic `continue` skips no tick: Step 7 goes to Step 10 only when no task is open, and nothing unticks a task, so a holistic pause never leaves an accepted task unticked.
- An all-Accept verify `continue` also skips that group's group gate, because the gate runs only after a verify PASS. The plan's Success Criteria intend this ("no new `build-group-gate` row for that group"), and Step 12 still runs the whole suite.
- Observation, not a gap: line 268 writes the condition operator as a plain "or" (`From: verify` or `From: holistic`). § Notation says condition operators are always bold. The planned test's regex requires the plain "or", so changing the wording means changing that test. The same file already has plain "or" in conditions (lines 17 and 21).
- Out-of-scope proposal: if a run stops after the `continue` row but before the `tasks tick --decision` call, the resume goes to Plan Execute with the accepted tasks still open. The same group then runs again, and its re-verify accepts the gaps from the decision file. That costs one extra round, but the result is correct.
- Mirrors (`.bkit/workflows.md`, `.claude/*` and the other host copies) are not yet re-rendered. Per `.agents/rules.md` **Install to mirror**, that happens once at the end of the session, so it is no gap here.

## Identified Gaps Log

2 gaps.

TASK 4: `.bkit/core/workflows/bkit-build.md` edits left `.bkit/instructions.md` out of sync, so `.bkit/core/engine/tools/instructions-coverage.test.ts` `has no coverage findings` fails with 7 findings: no entry under `#### bkit-build` for the new lines 143, 268, 306, 307 and 338, and the `commits` / `pushes` drift anchors `bkit-build:445` now miss because the 5 added lines moved that `ledgers commit --only-if-dirty-tracked --scope=core --mode=commit` line to 450. Fix: run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` (no flag), then `pnpm instructions:sync` and add the missing entries, then re-run the test — Fixable: true
TASK 5: the new **Re-runs follow answers** row in `.bkit/core/.bkit/workflows.md` § Cross-step invariants was not copied into the `cross-step-invariants` entry of `.bkit/instructions.md`, so `.bkit/core/engine/tools/instructions-sources.test.ts` `each Special Behaviors row and authoring section has one equal entry` fails (`cross-step-invariants: text differs — run pnpm instructions:sync`). Fix: `pnpm instructions:sync`, then re-run the test — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** bkit-build.md edits not synced to .bkit/instructions.md
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:268` · **Round:** 1
  - **DONE WHEN:** .bkit/core/engine/tools/instructions-coverage.test.ts `has no coverage findings` passes: entries exist for bkit-build.md lines 143, 268, 306, 307, 338 and the commits / pushes drift anchors point at the moved ledgers commit line
  - **TEST FIRST:**
    - .bkit/core/engine/tools/instructions-coverage.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** cross-step-invariants entry not synced with the new Re-runs follow answers row
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:259` · **Round:** 1
  - **DONE WHEN:** .bkit/core/engine/tools/instructions-sources.test.ts `each Special Behaviors row and authoring section has one equal entry` passes
  - **TEST FIRST:**
    - .bkit/core/engine/tools/instructions-sources.test.ts
<!-- bkit:task 2 end -->
