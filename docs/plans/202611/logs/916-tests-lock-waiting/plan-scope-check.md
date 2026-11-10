Verdict: CONCERNS
Failures: 3
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **(plan edit)** `## 👤 ⚠️ Acceptance Scenario` § Narrative and § Success Criteria both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`. The marker is correct: #916 is a bug-shape issue (`.bkit/trackers.md` § Issue shapes, row `bug`), so it has no Narrative or Success Criteria fields, and there is no design or audit. The Acceptance Scenario is still incomplete, though, and Gate 1 cannot pass until it is filled. Fix: once the owner answers Open Question 1, write the chosen Narrative and Success Criteria into both subsections. Under option A, copy them word for word from the issue's `What should happen`. Do not invent them before the owner answers.
2. **(plan edit)** One new behaviour the plan builds has no `Derived Test Matrix` row and no `TEST FIRST` test. The `Edge Cases` row "A ticket's temporary file is left behind by a helper killed between create and rename → The scan ignores names that are not tickets" covers it. So does the `Security & Privacy` claim that "the scan accepts only names matching `^\d+\.\d{6}-\d+$`, so a stray file can neither break the sort nor be unlinked by the scan". Nothing tests that a leftover `.<pid>.tmp`, or any file whose name does not match, is left in place and does not block the line. Fix: add a matrix row, for example "a stray non-ticket file in the queue folder neither blocks the line nor gets deleted" (Integration, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`). Land its test in TASK 2, which holds 2 of its 10 allowed tests, and have it fail on a waiter never acquiring, or on the stray file being unlinked.
3. **(plan edit)** The second half of the Edge Cases row "The queue folder cannot be created or a ticket cannot be written → `take_local_stack_lock` returns 1 and `run` exits 73, naming the queue path" has no test. TASK 1's DONE WHEN and the matrix cover only the folder-creation failure (`run exits 73 naming the queue folder when it cannot be created`). Nothing tests the `error cannot write a ticket in $queue` reply in `Architecture & Component Changes`. Fix: add a matrix row and a TEST FIRST test, for example one with the queue folder made read-only (`chmod 0555 tests.queue`), that fails on `run` exiting 0 and running its command. Land it in TASK 1 (8 of 10 tests used) or TASK 2.

## OPTIONAL

1. **Re-asking after exit 81 loses the run's place in line.** Edge Case "A run releases the lock and asks again at once → it takes a new ticket at the end" covers a holder that asks again. It does not cover the common agent path: `bkit tests run` gives up at `--lock-wait-s` (default 60 s, `724-tests-run-lock-wait-exit-81`), exits 81, and the workflow re-runs the block. Each re-run takes a fresh ticket at the back of the line. A gate that arrived 50 minutes ago and loops every 60 s can then be passed by any run that arrived since its last re-ask, which is the same starvation #916 reports. The owner's criterion "with a long enough limit" may leave this case out on purpose, but the plan never says so. Add an Edge Cases row (and an Open Question if the owner wants the place kept, for example by keying a ticket on a stable run identity) or state the limit explicitly in Context & Goals.
2. **A stopped first-in-line waiter now blocks a free lock.** The Edge Case row calls this the same as "a suspended holder today". It is new behaviour: today a stopped waiter blocks nobody, but after the change it holds every run behind it while the lock sits free. The TASK 2 `try` test uses a stopped waiter, but no test or Open Question covers the waiters behind it. Consider an Open Question (accept, or skip a ticket whose owner is stopped) and a matrix row that pins the accepted behaviour.
3. **The "no queue folder / no ticket" claims are untested.** The Edge Cases rows `CI=true` / `CI=1` ("no queue folder is created") and "A child of a live holder … takes no ticket" each describe a new negative outcome that no test asserts. Add an assertion to an existing CI-no-op test and to an existing nested-reuse test that `<cache>/bkit/machine-lock/tests.queue/` is absent or empty.
4. **The `try` busy note is not asserted.** Edge Case "`try_local_stack_lock` while runs wait in line" promises a busy note that names the holders and "how many runs wait in line" (`; <N> waiting in line`). TASK 2's test fails only on `try` returning 0. Make the test also check for "waiting in line" in the note text.
5. **`docs/testing.md` has no `Reuse Inventory` row.** `Architecture & Component Changes` has `[MODIFY] docs/testing.md` (below `bkit:end`, line 709), but the "Lock docs" row names only `.bkit/core/.bkit/templates.md` and `.bkit/shared/docs/testing.md`. Add `docs/testing.md` to that row's `File` cell, so each `[MODIFY]` traces to a row.
6. **TASK 4's DONE WHEN runs `node dist/cli.js check` without a build.** `dist/` may be stale at that point (no engine edit lands before TASK 5). Add `pnpm build` before the check in TASK 4's DONE WHEN, or move the `bkit check` drift check to TASK 5.
7. **No tests for the tie-break and clock choices.** Edge Cases "Two waiters take tickets in the same microsecond" and "The wall clock jumps" have no matrix rows. They are hard to drive through a real lock, but the sort order (time, then pid) could be pinned with a test that seeds two ticket names with the same time and checks which runs first. Optional, since both rest on the documented Assumptions.

## OUT OF SCOPE

1. A detect-only `bkit check` advisory for an adopted `scripts/ci/bkit-machine-lock.sh` copy without the queue. The plan already lists it under `Suggested Scope Expansion` as needing a design decision.
2. #822 (route raw test-runner commands through the tests lock per host). A raw runner skips the queue just as it skips the lock today. It stays its own issue.
