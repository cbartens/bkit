# Brief: group 1 — An honest loop trend in the engine

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

- Group 1: An honest loop trend in the engine — this group
  - TASK 1: Read an unknown failure count as trend `unknown`, which recommends nothing — open
  - TASK 2: Compare only rounds that ran the same tests — open
  - TASK 3: Print `trendLine`, one plain sentence with the counts and the reason — open
- Group 2: A failure count for the CI evidence round — next
  - TASK 4: Save the selected run's failed job count on the CI selection — open
  - TASK 5: Record the failed job count on the CI `test-run` row — open
  - TASK 6: Finish a counted CI round, and prove the incident's sequence end to end — open
- Group 3: Loop questions, docs and generated copies — later
  - TASK 7: State `trendLine` at every build loop pause, and never claim progress on an unknown trend — open
  - TASK 8: Make the debug Loop Question state what the counts show — open
  - TASK 9: Update the build route sentence and the docs, and regenerate every built and mirrored copy — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Read an unknown failure count as trend `unknown`, which recommends nothing
  - **UPDATE:** `LoopTrend` in `.bkit/core/engine/commands/workflow/counters.ts`: add `"unknown"`
  - **UPDATE:** `loopTrend` in `.bkit/core/engine/commands/workflow/counters.ts`: two or more rounds with no `failures` on the first or last compared round → `unknown`; on #891's shape the round's `failures` is the combined check-plus-gate count `loopProgress` builds
  - **UPDATE:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: `recommend` is `null` on `first-round` and `unknown`
  - **UPDATE:** `countersCommand` in `.bkit/core/engine/commands/workflow/counters.ts`: the `progress` verb's `trend` and `recommend` output help name `unknown`
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: add an `unknown` key to the `compose` verb's per-trend `trendLine` map, so the map indexed by `LoopTrend` typechecks (Task 7 deletes the map)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: the `loopTrend` case `loopTrend([r(5), r()], true)` now expects `unknown`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: the #891 cases `loopProgress with a gate > a red gate row with no failure count makes the round unknown` and `loopProgress with a gate > a red gate row with 0 counted failures makes the round unknown` now expect `trend: "unknown"` (was `stuck`), and `recommend: null` where asserted
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: any #891 `--loop` case whose status holds a round with no count and pins `Decide` now expects the Open Question Q5 recommendation (none at `a8b0f055c`: the `stuckStatus` rows carry counts); a verify-loop pause on such a round now recommends `Try again`
  - **DONE WHEN:** `loopTrend([r(5), r()], true)` returns `unknown`; `counters progress` on a log whose last round has no `failures` prints `trend: unknown` and `recommend: null`; the two #891 gate cases read `unknown`; `decisions compose --loop=verify` on a red group gate with no count prints `Trend: unknown` and recommends by Open Question Q5 (default `Try again`), not `Decide` on the trend; `counters.test.ts` and `decisions.test.ts` pass; `pnpm typecheck` passes; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `loopTrend > a missing count is unknown, not stuck` fails on a round with no count still returning "stuck"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > a round with no count reports unknown and no recommendation` fails on `recommend` being "stop" for counts `5 → ?`
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop=verify with an uncounted group gate reads unknown` fails on the pause reading "Trend: stuck" and recommending `Decide` for a red group gate row with no count (#891 shape)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Compare only rounds that ran the same tests
  - **UPDATE:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: the compared pair is the earliest round whose `scope` equals the last round's (two absent scopes are equal) and the last round; fewer than two such rounds → `unknown`; `codeChanged` is judged between the pair's `parentSha` values
  - **UPDATE:** `LoopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: `rounds[]` items gain `scope: string | null`
  - **UPDATE:** `countersCommand` in `.bkit/core/engine/commands/workflow/counters.ts`: the `progress` verb's `rounds` and `codeChanged` output help name the scope rule
  - **READ:** `Step` in `.bkit/core/engine/ledgers/status.ts`: `scope` on `step-done` rows
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: add a `--since-clean` case over unscoped holistic rounds with known counts that still reads its trend as today (a regression guard, not a red test)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a log with rounds `ci:123` (2) and `pnpm bkit:gate:static-unit` (`?`) prints `trend: unknown`; rounds `ci:123` (2), local (5), local (2) print `trend: closing`; with distinct `parentSha` values and no source change between the two local rounds the same counts print `codeChanged: false`, `trend: stuck`; the `--since-clean` case passes; every existing `bkit counters progress` case (rows with no `scope`) still passes; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > does not compare a CI round with a local gate round` fails on rounds `ci:123` (3) and a local gate (3) reading "stuck"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > compares the last round with the earliest round of the same scope` fails on rounds CI (2), local (5), local (2) not reading "closing"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > reports each round's scope` fails on `rounds` items carrying no `scope`
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > judges codeChanged between the compared same-scope rounds` fails on the trend reading "closing" when it should read `stuck`, for a git repo (as in `judges codeChanged on source only, from the rounds' parent commits`) with a source change between the CI round and the first local round and none between the two local rounds

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Print `trendLine`, one plain sentence with the counts and the reason
  - **UPDATE:** `LoopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: add `trendLine: string`
  - **UPDATE:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: build `trendLine` per `Architecture & Component Changes` § Engine — loop trend (first round, closing, stuck with a count not lower, stuck with a lower count and no source change, worse, unknown count, different scopes), unit-free, with different scopes winning over a missing count
  - **UPDATE:** `countersCommand` in `.bkit/core/engine/commands/workflow/counters.ts`: the `progress` verb's output help adds `trendLine`
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `counters progress` prints a `trendLine` for every trend; no `trendLine` says the count did not fall unless both compared counts are known and the last is not lower; no `trendLine` contains "failures" or "problems"; with different scopes and a missing count, `trendLine` is the different-scopes sentence; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > trendLine names an unknown count instead of claiming no fewer failures` fails on `trendLine` lacking "recorded no count"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > trendLine says the rounds ran different tests` fails on `trendLine` lacking "ran different tests"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > trendLine for a fall without a code change says no source code changed` fails on `trendLine` lacking "no source code changed"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > trendLine for the same count states both counts` fails on `trendLine` lacking "(21 → 21)"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `bkit counters progress > trendLine prefers different scopes over a missing count` fails on rounds `ci:123` (2) and a local gate (`?`) giving `trendLine` "recorded no count" instead of "ran different tests"

<!-- bkit:task 3 end -->

Reuse Inventory rows left out: 4; Architecture entries left out: 2 — read them in docs/plans/202611/912-debug-loop-question-plan.md § Reuse Inventory and § Architecture & Component Changes.
