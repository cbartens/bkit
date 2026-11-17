Verdict: CONCERNS
Failures: 1
Fingerprint: 4834fa19fb49800c2e714201828881247d40efb9f2b231e23fb52bde90f0b836
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- partial diff coverage: `tmp/bkit-diff-911-ship-failed-merge.md` is a partial view of `origin/dev...HEAD` (536 files, 20 largest shown), mostly local-`dev` commits outside this feature. Per the caller, this round covered the feature's own range `git diff e4927f84e..HEAD`, with weight on what changed since round 1 (`git diff 222a48b98..HEAD`: Task 7's exit-6 `--next-step` refusal, the Failure Path retry, the two new tests and the doc / mirror copies).
- Read in full for this round: `failVerb` and `failState` in `.bkit/core/engine/commands/workflow/workflows.ts`, `parseFlags` / `refuseUnsubstituted` and the verb dispatcher in `.bkit/core/engine/commands/lib.ts`, `postForVerb` in `tracker.ts`, `regenerateVerb` in `branches.ts`, the ship Failure Path, Step 2 sub-step 5, Steps 9-12 and the Merge Question in `.bkit/core/workflows/bkit-ship.md`, and the `red CI names /bkit-debug` and Failure Path tests in `ship-invariants.test.ts`.
- Round 1's findings (the exit-2 retry, the cancelled-check count, the backtick break-out) are not re-reported.

## Notes

- Verdict note: partial diff coverage.
- Task 1 was reproduced against the built CLI in a scratch repo: `node dist/cli.js workflows fail --workflow=ship '--next-step=/bkit-debug {FID}'` prints `--next-step carries the unsubstituted placeholder {FID}` and exits 2, while `'--next-step=git push'` exits 6. The ship fence always carries `--next-step="{NEXT_STEP}"` and relies on a separate "Drop `--next-step` when `NEXT_STEP` is not held" sentence, so a missed drop is the likeliest way to hit it. Before Task 7 the exit-2 retry caught this case; Task 7 narrowed the retry to exit 6, and the placeholder guard runs in `parseFlags` before `failVerb`, so it cannot return 6 today. Only `failState` writes the `workflow-failed` row and releases the lock, so the run stays `IN_PROGRESS` until the 30-minute idle reclaim. Cross-reference: the plan's Edge Cases row "The Failure Path's `workflows fail --next-step` call exits 2 (the held value was refused) → re-runs ... so the run still records the failure, releases the lock and posts the comment", and `.bkit/workflows.md` § Standard failure ("Exit 6 = `--next-step` is not one `/bkit-*` command line").
- Checked, no finding: exit 6 is unique inside `workflows fail`. `EXIT_LOCK_NOT_HELD` (also 6) is thrown only by `checkHeldLock` on `start --lock-held`; `postForVerb` and `writeFailedLabels` catch their own errors; `resolveMonth` throws 7 and `buildComment` throws 2. The refusal runs before `failState`, so the retry posts once and appends one row. `dist/commands/workflow/workflows.js` carries the same constant. In ship, `NEXT_STEP` is held only on arms that go straight to the Failure Path or the Merge Question, and `Try again` clears it, so a value from an earlier red round can't reach a later non-red failure. Ship step numbers run 1-12 with no `--number=13` / `14` left. No engine source outside the step table still names a `ship-failure-*` key.
- Test gap, no task (current code is correct, so no test can fail yet): the Step 2 and Step 12 invariant tests check that red-CI arms hold `NEXT_STEP` but not that the no-check / pending / unreadable arms and the capstone `Else` arm hold none. Only Step 10 sub-step 1 asserts "and no other route does".
- Outside this lens, not logged: `docs/testing.md:706` still says "Step 14 label calls skip when `ISSUE_ID` is empty" for ship; after the renumber that is Step 12.
- Pre-existing, not from this diff: in Step 2 sub-step 5, an exit 81 from the middle `runs wait --until=completed` line is swallowed, because the block's exit is that of `prs checks`.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A Failure Path that passes the fence's `--next-step="{NEXT_STEP}"` unsubstituted (or holds `/bkit-debug {FID}` verbatim) gets exit 2 from the flag parser's placeholder guard, not exit 6, so the retry never fires and the run ends with no workflow-failed row, the lock still held, and no failure comment or bkit:failed label
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:101` · **Round:** 1
  - **DONE WHEN:** A `--next-step` value refused for any reason before a write (the `/bkit-*` shape check in failVerb, `.bkit/core/engine/commands/workflow/workflows.ts:411`, and the `{UPPER}` placeholder guard that `parseFlags` raises at `.bkit/core/engine/commands/lib.ts:265`) exits 6, for example through a per-flag placeholder exit code on the `next-step` FlagSpec, so the ship Failure Path's exit-6 retry records the failure, releases the lock and posts the comment; every other flag's placeholder refusal still exits 2.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail refuses an unsubstituted --next-step placeholder with the --next-step refusal exit` fails on `--next-step=/bkit-debug {FID}` and `--next-step={NEXT_STEP}` exiting 2 (`--next-step carries the unsubstituted placeholder`) instead of 6, with the status file unchanged and the lock still held
<!-- bkit:task 1 end -->
