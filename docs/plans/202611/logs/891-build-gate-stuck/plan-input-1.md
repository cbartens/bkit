## Session Prompt — this run's, newer than everything below

does #891 need bkit-plan next or do we just fix here and now in worktree?

Run bkit-plan 891

## Issue description — oldest

### Failing test or CI run

none yet. Seen on a consumer's live `/bkit-build` run on 2026-11-08 (Where and when).

### What happened

A consumer's `dev` had 3 red unit tests that the build's branch did not cause. The build checked this: it ran the same tests on a clean `dev` checkout and got the same 3 failures. The red tests were the consumer's own (a dead-code registry missing two new files, and a suppression-count ceiling not raised). bkit did not cause them.

The build then got stuck at its first task group and could not get out:

1. Group 1 was built and verified. The group gate (`bkit:gate:static-unit`) failed only on those 3 tests.
2. Decision Pause 1 asked the owner. The owner answered **Accept**. Step 5 of the Decision Pause (`.bkit/core/workflows/bkit-build.md:197-202`) wrote the `docs/decisions.jsonl` row with `rationale` = `accepted by owner: …`.
3. The build re-ran Step 8. Verify passed, and the group gate failed again on the same 3 tests.
4. That was verify round 2 of 2, so Decision Pause 2 offered only `Try again` (another round, in which no code can change, so it fails the same way) or `Stop`.

Nothing the owner can answer gets groups 2-6 built while `dev` is red. The only way through is to fix the consumer's tests first, which is out of scope for the issue being built.

Why, in the code:

- `bkit tests run` sets the verdict from the gate's exit code alone: `verdict = exitCode === 0 ? "PASS" : "FAIL"` (`.bkit/core/engine/commands/workflow/tests.ts:1873`). It never asks whether the failing tests also fail on the base branch, and it never reads the owner's accepted decision row.
- Step 8 sub-step 10 continues only when `GATE_VERDICT` != FAIL. Sub-step 11 sends every gate FAIL to another verify round or to a pause (`.bkit/core/workflows/bkit-build.md:714-731`). No branch exists for "the only failures were already red on `dev` and the owner accepted them".
- Step 12's final test run has the same shape (`.bkit/core/workflows/bkit-build.md:945-975`): exit 1 means `TEST_VERDICT` = FAIL, and every round can only fix, ask or fail. Even past the group gates, the final run would stop on the same 3 tests.

So the accept is written down and then has no effect on the gate it was meant to unblock.

### What should happen

When a gate fails only on tests that also fail on the base branch, the build says so plainly and lets the owner accept them once. After that:

- the group gates and the Step 12 run treat those exact tests as known, and stop only on new failures;
- every other failing test still fails the gate;
- `/bkit-ship` still shows the accepted tests to the owner before merge.

The pause also stops offering `Try again` when the only failures are accepted base-branch failures, because no round can change them.

### Steps to reproduce

1. In a consumer repo, make one unit test fail on `dev` and commit it.
2. Start `/bkit-build` on any issue with 2 or more task groups.
3. At the group-1 Decision Pause, answer `Accept` for the failing test.
4. Group 1's gate fails again on that test, and the second pause offers only `Try again` or `Stop`. Groups 2+ never start.

### How often

Every build started while `dev` has any red test in the gate's scope.

### Affected area

- `.bkit/core/workflows/bkit-build.md` Step 8 (group gate routing) and Step 12 (final test run), plus the Decision Pause's Accept handling.
- `.bkit/core/engine/commands/workflow/tests.ts` (`tests run` verdict).
- Probably `/bkit-debug` and `/bkit-ship` too, wherever they run the same gates. Not checked.

### Where and when

A consumer repo on bkit 6.1.1, 2026-11-08. The build paused at Step 8, group 1 of 6, verify attempt 2 of 2.

### Evidence

- Re-ran the consumer's 2 failing test files on its clean `dev` HEAD: `Tests 3 failed | 8 passed (11)`, the same 3 failures the build reported.
- The build's own pause text: "Your accept doesn't carry over to the gate, so the workflow asks once more", and "Neither option gets groups 2–6 built while the gate is red."

### References

- #843 — Friction triage (https://github.com/cbartens/bkit/issues/843): parent.
- #889 — Build: a holistic verify FAIL aborts the run instead of fixing it (https://github.com/cbartens/bkit/issues/889): a nearby verify-routing gap, but a different one.
- `.bkit/core/workflows/bkit-build.md` § Decision Pause, Step 8, Step 12.
- Related, not part of this fix: the test-first audit matches tests by their JUnit case name (`isNamedCase`, `.bkit/core/engine/commands/workflow/tests.ts:601-602`). The consumer's own `bkit-test-file` script writes one case per plain `node` test file, named after the file, so planned test names inside those files never match. That is why tasks 1 and 2 stayed unticked. It comes from the consumer's script, but bkit could say in its docs that runner-less tests need one JUnit case per test name.

## Issue comment — posted 2026-11-08T12:17:00.000Z

### Next step: plan, not debug

The cause needs no diagnosis. It is set out in the body: the verdict comes from the exit code alone (`.bkit/core/engine/commands/workflow/tests.ts:1873`), and the build has no route past a failed gate (`.bkit/core/workflows/bkit-build.md:714-731`, and Step 12). What is still open is how to fix it, so this goes to `/bkit-plan`. The label changes from `next:debug` to `next:plan`.

### Decisions the plan should start from

1. **How bkit knows a test was already red on the base branch.** When the owner accepts at the Decision Pause, bkit records exactly which test cases failed: their names from the JUnit reports (the standard test-results files) that `tests run` already reads (`parseJunit`, `tests.ts:582`). Later gate runs in the same build ignore those cases and fail only on any other failing case.
   - Rejected for now: running the gate on the base branch as well and comparing. It is more trustworthy, but it doubles every gate's run time.
2. **A failure with no test name still blocks.** Lint, type checks and other steps that write no JUnit report give the engine no case names (it already reports their failure count as unknown, `tests.ts:1874-1878`). An accept cannot match them, so they still fail the gate. The pause says so plainly, so the owner knows an accept covers only named test failures.
3. **Scope.**
   - `.bkit/core/engine/commands/workflow/tests.ts`: `tests run` takes the accepted cases and returns PASS when every failing case is accepted.
   - `.bkit/core/workflows/bkit-build.md`:
     - the Decision Pause's Accept writes the accepted cases;
     - Step 8 and Step 12 pass them to the gate;
     - the pause stops offering `Try again` when the only failures are accepted ones.
   - `.bkit/core/workflows/bkit-debug.md:376` runs the same `tests run` verb, so it gets the same handling.
   - `/bkit-ship` runs no `tests run` gate. It needs only to show the accepted tests to the owner before merge.
