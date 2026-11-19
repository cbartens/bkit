# Brief: group 1 — A gate that did not run is `?`, and rounds compare only like with like

Plan: A fix-loop pause no longer counts a group gate that did not run as 0 failing tests Implementation Plan

## Why and what

### Context & Goals

The Decision Pause of a build fix loop prints a trend and a recommendation taken from it. For the group loop each round's count is the verify step's problems plus the failing tests of that round's group gate. The gate runs only after a passing verify, so a round whose verify said `CONCERNS` or `FAIL` has no gate row. `gateFailuresOf` in `.bkit/core/engine/commands/workflow/counters.ts` returns 0 for it, and the pause printed `Group gate failures after each round: 0 -> 34`, `Trend: worse` and recommended `Stop` on a loop whose gate had run once.

After this change a round whose gate did not run has no gate count (`?`, never 0). The trend compares only rounds that measured the same thing: with the gate run in only one round there is no trend (`unknown`, recommendation `null`, never `worse`). A round that ran the gate and counted 0 failing tests still counts 0. A loop in which no round ran the gate (every verify failed) still compares the verify counts as today.

Design choice against the issue's possible fix: the issue returns `null` from `gateFailuresOf` and lets that blank the whole round's count. That would also blank every round of a loop whose gate never ran (verify `FAIL` twice: `4 -> 4`, today `stuck`, recommendation `Stop`), and the existing `--loop adds the attempt line, the progress block and the loop question as Q1` test in `.bkit/core/engine/commands/workflow/decisions.test.ts` asserts that case (that file is run read-only as a regression check and not edited). This plan keeps a round's verify count when its gate did not run, marks the round as having no gate count, and only refuses to compare rounds where the gate ran in one and not in the other.

`.bkit/core/engine/commands/workflow/decisions.ts` needs no edit: it prints `loopProgress`'s `counts`, `gateCounts`, `trend`, `trendLine` and `recommend` as given, so the fix lands in `counters.ts` alone.

Out of scope: the gate re-run on `Try again` (#1038) and the one-command round decision (#1000). They change the same pause but not these counts; this plan touches only `loopProgress` and `gateFailuresOf`, which neither names.

**Related Issues:**

- #1063 — a fix-loop pause counts a skipped group gate as 0 failing tests (this plan's issue)
- #958 — Agents and the orchestrator write their own .md files; the engine checks and counts (the build where it showed, run 2 group 8)
- #1000 — Build: one engine command decides each fix-loop round (same pause, different code)
- #1038 — Build: Try again on a red-gate pause re-runs the gate before another fix round (same pause, different code)

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| The #958 case: a `CONCERNS` verify round with 3 problems and no gate row, then a `PASS` round with a red gate row (34 failing): `loopProgress` gives `gateCounts` `? → 34`, trend `unknown`, `recommend` null, the first round's `gateFailures` null, and a `trendLine` that does not say the count rose (the fields `decisions compose` prints) | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |
| A round that ran the gate and counted 0 reads `0`, next to a not-run round that reads `?`: `gateCounts` `? → 0` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |
| The existing "a verify round whose gate did not run adds no gate failures" test asserts `? → 3` and trend `unknown`, not `0 → 3` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |
| Gate ran in round 1 (red), did not run in round 2 (`CONCERNS`): trend `unknown`, `trendLine` says the gate ran in only one round, never `closing` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |
| A holistic round with a `PASS` verify and no gate row is not clean, so it stays a round of the open loop | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 1 |

## Where it fits

- Group 1: A gate that did not run is `?`, and rounds compare only like with like — this group
  - TASK 1: Give each round its gate state in `loopProgress` and compare only rounds measured the same way — open
  - TASK 2: Describe the not-run gate in the workflow doc and the test table — open
  - TASK 3: Rebuild `dist/` and refresh the rendered workflow doc — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Give each round its gate state in `loopProgress` and compare only rounds measured the same way
  - **READ:** `.bkit/core/engine/commands/workflow/counters.ts`: `loopTrend`, `gateFailuresOf`, `loopProgress`, and the `counters progress` `output` help strings
  - **READ:** `.bkit/core/engine/commands/workflow/decisions.ts`: the `compose --loop` block that prints `Problems after each round`, the gate line and `Trend`; it prints `gateCounts`, `trend`, `trendLine` and `recommend` from `loopProgress` as given and is not edited
  - **READ:** `.bkit/core/engine/commands/workflow/loops.ts`: `LOOPS` (`verify` is grouped with a gate and no `sinceClean`; `holistic` has `sinceClean` and a gate)
  - **UPDATE:** `gateFailuresOf` in `.bkit/core/engine/commands/workflow/counters.ts`: a round with no `test-run` row for the gate step reads as not run (null, unknown), not 0; a row with `failures` 0 and verdict PASS still reads 0; a red row with no count or 0 counted failures stays unknown as today; reword its doc comment to say "not run" and "unknown" apart from "counted 0"
  - **UPDATE:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: record per round whether the gate ran (a `test-run` row exists for that attempt); a round whose gate did not run keeps its verify count unadded and reports `gateFailures` null (printed `?` in `gateCounts`); choose the compared first round as the earliest round with the last round's `scope` and the same gate-ran state as the last round; with no such earlier round the trend is `unknown`, `recommend` null, and `trendLine` says the gate ran in only some of the rounds (so the rounds cannot be compared) instead of the different-tests sentence; keep the existing different-scope sentence for a scope difference
  - **UPDATE:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: in the `clean` check (`cleanRound(r) && (gateStep === undefined || gateOf(r) === 0)`) keep the gate required to count 0, and say in its doc comment that a clean verify with no gate row (not run) is not clean, so a `sinceClean` loop never closes on a gate that did not run; update the `loopProgress` doc comment's "0 with no row" wording to "not run (unknown), never 0"
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.ts`: the `counters progress` `output` help strings for `gateCounts` (a round whose gate did not run reads `?`) and `trend` (`unknown` also when the gate ran in only some of the rounds)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: in `describe("loopProgress with a gate")` the new tests below, and the existing `a verify round whose gate did not run adds no gate failures` test, whose `0 → 3` assertions become `? → 3` with trend `unknown`; in `describe("loopProgress with the holistic gate")` the new holistic test below
  - **READ:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: the existing `--loop` tests, including the `4 → 4` verify rounds with no gate row (`Problems after each round: 4 → 4`, `loopRecommended` `Decide`); run as a regression check, never edited
  - **READ:** `docs/testing.md`: § Test first, § Tiers this project has (unit tier, real temp git repo for `decisions.test.ts`)
  - **DONE WHEN:** `pnpm exec vitest run .bkit/core/engine/commands/workflow/counters.test.ts` passes, and the unedited `.bkit/core/engine/commands/workflow/decisions.test.ts` and `.bkit/core/engine/commands/workflow/loops.test.ts` still pass; for the #958 rows `loopProgress` gives `gateCounts` `? → 34`, trend `unknown`, `recommend` null and a `trendLine` that does not say the count rose; a gate row that counted 0 still reads `0`; two verify rounds with no gate row at all still compare their verify counts; `pnpm exec tsc --noEmit` reports no error in `counters.ts`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `a not-run gate then a red gate has no trend` fails on `gateCounts` reading "0 → 34", the trend reading `worse` with `recommend` "stop", and the `trendLine` saying "The count rose"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `a gate that ran and counted 0 reads 0 beside a not-run round that reads ?` fails on `gateCounts` reading "0 → 0" for the not-run round
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `a verify round whose gate did not run adds no gate failures` fails on `gateCounts` being "0 → 3" and the trend not being `unknown` — an existing test whose assertions this task changes
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `a red gate then a verify round with no gate run has no trend` fails on the trend reading `closing` for rounds that measured different things
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `a clean holistic verify with no gate row stays a round of the open loop` fails on the loop closing at the round with no gate row, leaving only the rounds after it

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Describe the not-run gate in the workflow doc and the test table
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: in the `counters progress` field table, the `gateCounts` row says a round whose gate did not run (verify `CONCERNS` or `FAIL`, so no gate ran) reads `?`, never `0`, and that a round is clean only when its gate also counted 0, so a clean verify with no gate row is not clean; the `trend` row says `unknown` also covers rounds where the gate ran in only some of the rounds; the `recommend` row stays `null` on `unknown`
  - **UPDATE:** `docs/testing.md`: the `commands/workflow/counters.test.ts` row in § Key test files (the one naming `loopProgress` same-scope trend, the rule this change alters) adds that a round whose gate did not run reads `?` and the trend compares only rounds with the same scope and gate state; no other row changes
  - **READ:** `.bkit/core/.bkit/workflows.md`: the `counters progress` field table and the `Loop question` bullet after it
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `.bkit/core/.bkit/workflows.md` holds the not-run wording in the `gateCounts` and `trend` rows and the `docs/testing.md` `counters.test.ts` row names the new behaviour; the `.bkit/core/.bkit/workflows.md` table still has the same columns
  - **TEST FIRST:** n/a — documentation only; the behaviour it describes is tested by task 1

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Rebuild `dist/` and refresh the rendered workflow doc
  - **READ:** `package.json`: the `build` script
  - **UPDATE:** `dist/commands/workflow/counters.js`: the compiled output of task 1 (`pnpm build`, then `git add dist/`)
  - **UPDATE:** `.bkit/workflows.md`: refreshed from `.bkit/core/.bkit/workflows.md` by `pnpm tsx .bkit/core/engine/cli.ts upgrade`
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** `pnpm build` exits 0 and `dist/commands/workflow/counters.js` holds the not-run gate handling; `.bkit/workflows.md` holds the `gateCounts` not-run wording; `bkit check` reports no drift
  - **TEST FIRST:** n/a — a build and a mirror refresh; the behaviour is tested by task 1

<!-- bkit:task 3 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Tests for the new rounds | `.bkit/core/engine/commands/workflow/counters.test.ts` | read `describe("loopProgress with a gate")` and `describe("loopProgress with the holistic gate")`; `grep -n 'gate' .bkit/core/engine/commands/workflow/decisions.test.ts` | the two describes already hold the `verify`, `gate` and `holistic` row builders and `progress` helper | EXTEND | New `it`s beside the existing ones, reusing their builders. |

Reuse Inventory rows left out: 2; Architecture entries left out: 0 — read them in docs/plans/202611/1063-fix-loop-pause-plan.md § Reuse Inventory and § Architecture & Component Changes.

## Deviations

publish=false
