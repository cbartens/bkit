Verdict: CONCERNS
Failures: 2
Fingerprint: cf1df3ba7f54c506e7cc288695787470549f8708e5e13426a29044fba34142a0
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- partial diff coverage: `tmp/bkit-diff-912-debug-loop-question.md` is a partial diff dominated by the dev merge. Round 2 read the Task 11 change in full instead: `git diff 493a7ae76 HEAD` on `.bkit/core/engine/commands/workflow/decisions.ts` (lines 458-473), `.bkit/core/engine/commands/workflow/decisions.test.ts` (lines 427-479) and `dist/commands/workflow/decisions.js`.
- Callers traced: `bkit-build.md` `{LOOP_FLAGS}` (line 165), the Step 8 sub-step 11 route that holds `PAUSE_MAX` (lines 752-767), the Step 9 zero-fix pause (line 844), Decision Pause step 6 `counters grant` (lines 264-283) and the step 7 `retry` route (line 293), and the Resume line (49).
- Engine paths checked: `str` in `status.ts:180`, the flag parser in `lib.ts:300-326` (keeps `""` for `--max=`, refuses a literal `{PAUSE_MAX}`), and `pointLimit` / `grantCount` in `counters.ts:260-305, 525-558`.
- The five round-1 LOW findings recorded in `docs/deferrals.jsonl` are not reported again.

## Notes

- Task 1 and Task 2 each leave the Task 11 claim "the limit is used up" reachable below the real limit. Task 11's DONE WHEN trusts `--max`, but `bkit-build.md` refreshes `PAUSE_MAX` only at the Step 8, Step 10 and Step 12 routes. Decision Pause step 6 discards the `max` that `counters grant` prints, and a resumed run holds no `PAUSE_MAX` at all. `.bkit/core/.bkit/workflows.md:1018` says the limit is `maxAttempts x (1 + grants)`.
- One fix covers both: `compose` derives the limit from the status file, as `pointLimit` does.
- The pause header `build verify: attempt 3 of 3` shows the same stale `--max`. That line predates this feature, so no task is logged for it.
- Outside this lens, not logged: the plan's Test table row (line 111) and Architecture section (line 378) still say every `unknown` `--loop` pause fires at a used-up limit, which Task 11 shows is false.
- The new test covers the below-limit branch, and the existing test `--loop on an unknown trend says the limit is used up` covers the at-limit branch. Both read the code correctly.
- Cross-referenced: `.bkit/core/.bkit/workflows.md` § Ask points (lines 998, 1018) and § Decision Pause (line 984). `docs/security.md` and `docs/architecture.md` have no rule this change touches.
- No tests were run; this is a read-only challenge.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** After the owner answers Try again at a used-up verify limit, counters grant raises the limit to 6 but PAUSE_MAX stays 3; a Step 9 round that fixes nothing on a red gate then composes --attempt=3 --max=3 and tells the owner "the limit is used up" with three rounds left
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:464` · **Round:** 1
  - **DONE WHEN:** decisions compose --loop decides "the limit is used up" against the loop's limit including the run's saved allowance-granted rows for that point (and group for verify), the same maxAttempts x (1 + grants) that counters route and grant compute, so a --max below that limit never produces the claim; decisions.test.ts passes.
  - **TEST FIRST:**
    - - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop=verify after a granted allowance does not say the limit is used up`
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A resumed build that never held PAUSE_MAX composes --max= (empty); Number("") is 0, so every unknown-trend pause claims "the limit is used up" whatever the attempt
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:463` · **Round:** 1
  - **DONE WHEN:** limitUsed is true only when --attempt and --max are both whole numbers written as digits; an empty or blank --max (or --attempt) gives the unknown-trend reason without any claim about the limit or a round left; decisions.test.ts passes.
  - **TEST FIRST:**
    - - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop=verify with an empty --max does not say the limit is used up`
<!-- bkit:task 2 end -->
