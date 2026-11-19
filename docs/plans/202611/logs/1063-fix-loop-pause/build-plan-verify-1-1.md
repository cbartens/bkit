Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 2, 3
Loosened: none
Fingerprint: 69449adc53b8d3b149c2b6e1f92cca0bed61707b19083c60774becd69ae9e3fd
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode Group, judged against `build-diff-1-1.md`. Brief `Deviations`: `publish=false` only; no task deviations.
- Checks run: `pnpm exec vitest run` on `counters.test.ts`, `decisions.test.ts`, `loops.test.ts` → 3 files, 178 tests passed. `pnpm exec tsc --noEmit` → no errors. `git diff` shows that `decisions.ts`, `decisions.test.ts` and `loops.test.ts` were not edited. `node dist/cli.js check` → "0 write(s) would occur" (no drift). `dist/commands/workflow/counters.js` holds `{ ran: false, failures: null }` and mirrors the source diff. `.bkit/workflows.md` holds the `gateCounts` not-run wording.
- Task 1 behaviour as DONE WHEN states it: the #958 rows give `? → 34`, `unknown`, `recommend` null and no "rose"; a gate row that counted 0 reads `0`; two verify rounds with no gate row still compare (the `4 → 4` `decisions.test.ts` case passes). Task 1 is left off `Tasks` only because of the two gaps below.
- Task 2: `.bkit/core/.bkit/workflows.md` `gateCounts` / `trend` rows hold the not-run wording, the table keeps its columns, and the `docs/testing.md` `counters.test.ts` row names the new behaviour.
- Task 3: its DONE WHEN holds now. Fixing gap 2 changes `counters.ts`, so the fix round must run `pnpm build` again, or `dist/` goes stale.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, 0 gaps, 0 unproven, all 5 TEST FIRST tests red then green. It has no `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- The plan has no `Documentation Updates` section. `docs/observability.md` exists, and no new error path needs logging.
- No decision records or earlier verify / remediate logs were supplied.
- Out of scope, not a gap: the `counters progress` `gateCounts` help string already said "the group gate's failing tests" for both loops before this change.

## Identified Gaps Log

Gaps: 2

TASK 1: `.bkit/core/engine/commands/workflow/counters.test.ts` `a clean holistic verify with no gate row stays a round of the open loop` sits in a new `describe("loopProgress with the holistic gate and no gate row")` (line 1375) that copies the `holistic`, `gate` and `progress` builders of `describe("loopProgress with the holistic gate")`; the task UPDATE and the Reuse Inventory EXTEND row put the test inside that existing describe reusing its builders — move the `it` (body unchanged) into it and delete the duplicate describe — Fixable: true
TASK 1: `.bkit/core/engine/commands/workflow/counters.ts:490` the gate-mixed `trendLine` hard-codes "The group gate ran in only some of the rounds", but `loopProgress` serves the holistic loop too (`LOOPS` `gateTitle` "Holistic gate", and this task's holistic test builds that mixed state), so a holistic pause would print "Holistic gate failures after each round" beside a trend line naming the group gate — word it from the gate in play (e.g. "The gate"), add an assertion in a task-1 test, then `pnpm build` so `dist/commands/workflow/counters.js` matches — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Holistic test duplicates the existing describe builders instead of extending it
  **Severity:** LOW · **Class:** reuse · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/counters.test.ts:1375` · **Round:** 1
  - **DONE WHEN:** the test "a clean holistic verify with no gate row stays a round of the open loop" sits inside describe("loopProgress with the holistic gate") with an unchanged body, reusing its builders, and the duplicate describe is gone; counters.test.ts passes
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/counters.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Gate-mixed trendLine hard-codes "group gate" on the holistic loop
  **Severity:** LOW · **Class:** correctness · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/counters.ts:490` · **Round:** 1
  - **DONE WHEN:** the gate-mixed trendLine does not name the group gate on the holistic loop (a task-1 test asserts it), counters.test.ts passes, and pnpm build leaves dist/commands/workflow/counters.js matching
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/counters.test.ts
<!-- bkit:task 2 end -->
