# Brief: group 2 — A failure count for the CI evidence round (tests)

Plan: Honest Loop Trend for Unknown and Incomparable Test Rounds Implementation Plan

## Why and what

### Context & Goals

A consumer's `/bkit-debug` run reached the Loop Question after fix attempt 2 of 2. It printed `Failures per test round: ? → ? (trend: stuck)`, said "The last fix attempt left no fewer failures" and recommended Stop. Neither test round had a failure count, and the two rounds ran different tests (round 1 was the selected CI run, round 2 a local gate). The owner took the recommendation and stopped a run that had no evidence of being stuck.

Root causes, read in this session:

<!-- prettier-ignore -->
| Cause | Where | Effect |
| --- | --- | --- |
| An unknown count reads as `stuck` | `loopTrend` in `.bkit/core/engine/commands/workflow/counters.ts` (`if (first === undefined \|\| last === undefined) return "stuck";`) | `loopProgress` sets `recommend: "stop"`, and the debug Loop Question asks |
| Rounds of different scopes are compared | `loopTrend` compares `rounds[0]` with `rounds.at(-1)` whatever their `scope` | A CI round (`scope: ci:<run id>`) is compared with a local gate round |
| A CI evidence round never records a count | `tests run` CI branch in `.bkit/core/engine/commands/workflow/tests.ts` writes `failures: null`; `testRunProblem` in `.bkit/core/engine/ledgers/status.ts` refuses any other value; `steps finish` in `.bkit/core/engine/commands/workflow/steps.ts` refuses `--failures` on a CI round | The first debug round from CI is always `?`, although `runs locate` already reads the failed jobs |
| The question wording is fixed | `.bkit/core/workflows/bkit-debug.md` § Loop Question: three `Q1` texts say "left no fewer failures" | The question claims what the counts do not show; `stuck` also covers "count fell but no code changed", where the claim is false too |

Goals:

- An unknown or incomparable count produces a separate trend, `unknown`, that never recommends Stop.
- The trend compares only rounds that ran the same tests (same `scope`).
- A CI evidence round records the selected run's failed job count when `runs locate` read the jobs.
- Every loop question states what the counts show, in one engine-written sentence (`trendLine`), instead of a fixed claim.

Loop surfaces checked (the issue asks to check build and ship too):

<!-- prettier-ignore -->
| Workflow | Reads `counters progress`? | Effect of this plan |
| --- | --- | --- |
| `/bkit-debug` § Loop Question | Yes (`trend`, `counts`) | `unknown` takes the attempt without asking; the question and narration use `trendLine` |
| `/bkit-build` Step 12 (`TESTS_LOOP`) and every `decisions compose --loop` pause | Yes (`counters progress`, and `loopProgress` inside `decisions compose`) | `unknown` goes to Step 13 without a pause (the existing `Else` route); `compose` writes `trendLine` and an honest reason |
| `/bkit-ship` | No: its merge loop routes on the diagnosis verdict (`DIAGNOSE_VERDICT`), not on a trend | None |

The local gate's count stays the JUnit count `tests run` already takes from `$BKIT_TEST_REPORT_DIR` (`.bkit/workflows.md` § Failure count from JUnit reports). Round 2 in the incident had no JUnit report, so it stays `?`, and the trend now reads `unknown` instead of `stuck`. The issue's bullet asking for a local gate count "from its output" is therefore met only for gates that write JUnit reports; a gate with no report stays uncounted (Open Question Q3, decision `912-local-gate-count-stays-junit-only`).

A CI evidence round's count is in a different unit from a local round's: failed CI jobs, the capstone left out, not failing test cases. The same-scope rule keeps the two from ever being compared.

**Related Issues:**

- #912 — Debug loop question asks Stop with failure counts "? → ?" (open)
- #895 — One question format for every owner question in the workflows (open)

---

### Narrative

The owner runs `/bkit-debug` from a red CI run, and when the fix loop reaches the Loop Question, the question states what the test rounds' failure counts show. When a round recorded no count, or the rounds ran different tests, the owner is not told the last fix attempt "left no fewer failures" and is not advised to Stop on that missing evidence.

### Success Criteria

- Each test round records a failure count whenever one can be worked out. For a CI round that is at least the number of failed jobs. For a local gate that is the failed-test count from its output.
  - "The failed-test count from its output" is the count from the gate's JUnit report (Open Question Q3, default A).
- When a count is unknown, the trend is not `stuck`. It is a separate state, for example `unknown`, that never recommends Stop by itself.
- The question wording matches what is known. It never says "left no fewer failures" when the counts are `?`.
- Rounds with different scopes (CI vs local gate, or two different gates) are not compared as if they were the same test.

### Out of Scope

None. Every item in the issue's "What should happen" and "Affected area" is in the runbook. The ship loop needs no change because it does not read `counters progress` (`Context & Goals`). The Loop Question's option and recommendation layout belongs to #895's own plan, and Assumption A2 covers how the two meet. The issue's local gate count "from its output" is met only for gates that write JUnit reports: parsing runner output is a rejected approach (Open Question Q3, `.agents/rules.md` § Stack-agnostic), not deferred work.

## Where it fits

- Group 1: An honest loop trend in the engine — done
  - TASK 1: Read an unknown failure count as trend `unknown`, which recommends nothing — done
  - TASK 2: Compare only rounds that ran the same tests — done
  - TASK 3: Print `trendLine`, one plain sentence with the counts and the reason — done
- Group 2: A failure count for the CI evidence round — this group
  - TASK 4: Save the selected run's failed job count on the CI selection — open
  - TASK 5: Record the failed job count on the CI `test-run` row — open
  - TASK 6: Finish a counted CI round, and prove the incident's sequence end to end — open
- Group 3: Loop questions, docs and generated copies — next
  - TASK 7: State `trendLine` at every build loop pause, and never claim progress on an unknown trend — open
  - TASK 8: Make the debug Loop Question state what the counts show — open
  - TASK 9: Update the build route sentence and the docs, and regenerate every built and mirrored copy — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Save the selected run's failed job count on the CI selection
  - **UPDATE:** `CiSelection` in `.bkit/core/engine/ledgers/status.ts`: optional `failedJobCount?: number` on the `mode: "ci"` variant
  - **UPDATE:** `validateCiSelection` in `.bkit/core/engine/ledgers/status.ts`: `failedJobCount` absent or a safe integer > 0
  - **READ:** `ciSelectionIdentity` in `.bkit/core/engine/ledgers/status.ts`: stays unchanged, so the count never starts a new CI generation
  - **UPDATE:** `locateCi` in `.bkit/core/engine/commands/workflow/runs.ts`: set `failedJobCount` = failed jobs other than `bkit-tests-check`, 1 when only the capstone failed, omitted when none failed; the jobs from the exit-80 fallback `--evidence-file` go through the same filter
  - **DONE WHEN:** a located selection with two failed test jobs and a failed capstone saves `failedJobCount: 2`; a capstone-only failure saves 1; a run with no failed job saves no `failedJobCount`; a `--evidence-file` envelope with one failed test job and a failed capstone saves 1; `validateCiSelection` refuses 0, -1 and 1.5 and accepts a selection without the field; `ciSelectionIdentity` returns the same value with and without the field; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/ledgers/status.test.ts` `CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity` fails on a selection with `failedJobCount: 0` being accepted
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `saves the failed job count without the capstone job` fails on the saved selection carrying no `failedJobCount`
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `counts the capstone job when it is the only failed job` fails on `failedJobCount` being absent instead of 1
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `saves no failed job count when no job failed` fails on a run with no failed job saving a `failedJobCount` of 0 or 1 instead of none
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `counts fallback evidence jobs without the capstone job` fails on a `--evidence-file` selection carrying no `failedJobCount`, or a count that includes `bkit-tests-check`

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Record the failed job count on the CI `test-run` row
  - **UPDATE:** `testRunProblem` in `.bkit/core/engine/ledgers/status.ts`: a `source: ci` row's `failures` is `null` or a safe integer > 0
  - **READ:** `ciRoundMatches` in `.bkit/core/engine/ledgers/status.ts`: calls `testRunProblem`, so a counted round still matches its selection
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: the `run` verb's CI branch writes `failures: selection.failedJobCount ?? null` to `appendTestRun` and the emitted object; the `failures` output help names the CI case
  - **READ:** `.bkit/core/engine/checks/status-holes.ts`: the completeness check reads `ciRoundMatches`, so a counted CI round must raise no evidence hole
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `tests run --ci-run` with a selection holding `failedJobCount: 2` prints and records `failures: 2`; with no count it records `null` as before; `testRunProblem` refuses a CI row with `failures: 0`; a CI round with `failures: 2` and its matching `step-done` row raises no `tests run --ci-run` hole; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0; Task 6 lands in the same commit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `CI evidence test rounds > records the selected run's failed job count` fails on the CI round recording `failures` null when the selection holds 2
    - `.bkit/core/engine/ledgers/telemetry.test.ts` `test-run status row validation > accepts a counted CI evidence round and refuses 0` fails on "invalid CI evidence round" for a CI row with `failures: 2`
    - `.bkit/core/engine/checks/status-holes.test.ts` `check — hole classes > a counted CI round with its step-done row raises no CI evidence hole` fails on a `tests run --ci-run` hole reported for a CI round with `failures: 2`

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Finish a counted CI round, and prove the incident's sequence end to end
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: on a CI round, `failures` must equal the `test-run` row's `failures` when that is a number, and be absent when it is `null`; the error text stays `CI evidence does not match the active selection`
  - **READ:** `.bkit/core/workflows/bkit-debug.md`: § Step 3 `{FAILURES_FLAG}` already passes `--failures` whenever `tests run` prints a count
  - **UPDATE:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts`: the fake `gh` jobs fixture fails `bkit-tests-check` alongside the failed test jobs, as a real red run does, and the test asserts the count leaves the capstone out
  - **DEPENDS ON:** 2, 5
  - **DONE WHEN:** `steps finish --failures=2` on a CI round whose row holds 2 writes the `step-done` row with `failures: 2`; `--failures=3` on that round is refused with no row written; `--failures=2` on a CI round whose row holds `failures: null` is refused with no row written; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0, before the integration test runs `dist/cli.js`; the integration test replays Step 3 twice with the capstone failed, runs the Loop Question's `counters progress`, sees the CI round's `failures` without the capstone, `counts: "2 → ?"` and `trend: "unknown"`, and passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `finishes a CI round only with its own failed job count` fails on a `--failures=2` that matches the round's row being refused with a usage exit; the same test asserts that `--failures` on a row with `failures: null` and a different count are both refused
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown` fails on the CI round recording no failure count, so the Loop Question's `counters progress` never reads `unknown` for the right reason

<!-- bkit:task 6 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Compare only rounds that ran the same tests — `.bkit/core/engine/commands/workflow/counters.ts`, `.bkit/core/engine/commands/workflow/counters.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `validateCiSelection` accepts a positive whole `failedJobCount` and a selection without it, and refuses 0, negatives and fractions; the identity ignores it | Unit | `.bkit/core/engine/ledgers/status.test.ts` | 4 |
| `runs locate` saves `failedJobCount` without the capstone job, and 1 when only the capstone failed | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 4 |
| `runs locate` omits `failedJobCount` when the selected run has no failed job | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 4 |
| `runs locate --evidence-file` leaves a failed capstone out of `failedJobCount` | Unit | `.bkit/core/engine/commands/workflow/runs.test.ts` | 4 |
| `tests run` records the selected run's `failedJobCount` as the CI round's `failures` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `testRunProblem` accepts a CI round with a positive count or `null`, and refuses 0 | Unit | `.bkit/core/engine/ledgers/telemetry.test.ts` | 5 |
| A counted CI round with its matching `step-done` row raises no `tests run --ci-run` evidence hole | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 5 |
| `steps finish` finishes a CI round whose `--failures` equals its `test-run` row, and refuses a different count or any `--failures` when the row has no count | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 6 |
| Debug Step 3 commands record the CI round's failed job count with the failed capstone left out, and the Loop Question's `counters progress` then reads `unknown` after a local round with no count (the incident replayed through the real CLI) | Integration | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` | 6 |
