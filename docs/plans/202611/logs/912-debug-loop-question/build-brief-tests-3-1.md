# Brief: group 3 — Loop questions, docs and generated copies (tests)

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
- Group 2: A failure count for the CI evidence round — done
  - TASK 4: Save the selected run's failed job count on the CI selection — done
  - TASK 5: Record the failed job count on the CI `test-run` row — done
  - TASK 6: Finish a counted CI round only with its own failed job count — done
  - TASK 10: Prove the incident's sequence end to end with an uncounted local round that fails — done
- Group 3: Loop questions, docs and generated copies — this group
  - TASK 7: State `trendLine` at every build loop pause, and never claim progress on an unknown trend — open
  - TASK 8: Make the debug Loop Question state what the counts show — open
  - TASK 9: Update the build route sentence and the docs, and regenerate every built and mirrored copy — done

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** State `trendLine` at every build loop pause, and never claim progress on an unknown trend
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: the `compose` verb's `--loop` block ends `Q1`'s question with `p.trendLine`; on `unknown` it builds the reason from `p.trendLine`, says the limit is used up, and keeps `Try again` (Open Question Q5 default)
  - **DELETE:** `trendLine` in `.bkit/core/engine/commands/workflow/decisions.ts`: the per-trend map local to the `compose` verb, superseded by `p.trendLine`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: existing `--loop` cases that match the old fixed sentences now match `trendLine`
  - **DEPENDS ON:** 1, 3
  - **DONE WHEN:** `decisions compose --loop=tests` on an `unknown` trend writes `Recommended: … Try again` with a reason that says the limit is used up and contains neither "the last round made progress" nor "a round is left"; the `--loop=verify` pause on an uncounted group gate gives the same reason; `Q1` holds the counts from `trendLine`; `decisions.test.ts` passes; `pnpm build && git add dist/` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop on an unknown trend recommends Try again without claiming progress` fails on the reason reading "the last round made progress"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop on an unknown trend says the limit is used up` fails on the reason claiming "a round is left", or lacking "limit is used up"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > --loop states the engine's trendLine in Q1` fails on `Q1` lacking the counts "(5 → 2)"

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Make the debug Loop Question state what the counts show
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: § Loop Question step 2 holds `trendLine` as `LOOP_TREND_LINE` and adds it to the no-ask narration; step 3's `Q1` texts state `{LOOP_TREND_LINE}` per `Architecture & Component Changes` § Workflows, with no "left no fewer failures"
  - **UPDATE:** `.bkit/core/.bkit/authoring.md`: the § Human questions Loop Question example shows a filled `trendLine`
  - **UPDATE:** `.bkit/instructions.md`: the local entries of each edited `bkit-debug.md` standing line
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: add the Loop Question cases beside `debug takes a further fix or soak attempt without asking unless the trend is stuck or worse`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt`: updated alone with `vitest run .bkit/core/engine/render/trackers.test.ts -u -t "bkit-debug: the none render matches its baseline"`, never with a folder-wide `-u`
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `grep -n "left no fewer failures" .bkit/core/workflows/bkit-debug.md .bkit/core/.bkit/authoring.md .bkit/instructions.md` finds nothing; `workflow-shape.test.ts` passes; `pnpm tsx .bkit/core/engine/tools/instructions.ts` (check mode, no `--write`) exits 0; `git diff --stat .bkit/core/engine/render/__snapshots__/` lists only `bkit-debug.none.txt`, and its diff holds only the Loop Question and narration lines.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Loop Question states the engine's trend line, never a fixed claim` fails on the `Q1` texts still saying "left no fewer failures"
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Loop Question at the used-up soak limit states the trend line` fails on the `LOOP_LIMIT` `Q1` lacking "{LOOP_TREND_LINE}" or no longer recommending Stop

<!-- bkit:task 8 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Read an unknown failure count as trend `unknown`, which recommends nothing — `.bkit/core/engine/commands/workflow/counters.ts`, `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/engine/commands/workflow/counters.test.ts`, `.bkit/core/engine/commands/workflow/decisions.test.ts`
- TASK 3 (group 1, done): Print `trendLine`, one plain sentence with the counts and the reason — `.bkit/core/engine/commands/workflow/counters.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `decisions compose --loop` on an `unknown` trend recommends `Try again` with a reason built from `trendLine` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| `decisions compose --loop` on an `unknown` trend says the limit is used up, never that a round is left | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| `decisions compose --loop=verify` with a red group gate that has no count reads `unknown` and recommends by the Q5 rule, not `Decide` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 1 |
| The debug Loop Question holds `trendLine` and states it in every `Q1`, with no fixed "left no fewer failures" text | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 8 |
| The debug Loop Question's `LOOP_LIMIT` `Q1` (soak attempts used up) states `{LOOP_TREND_LINE}` and still recommends Stop | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 8 |
