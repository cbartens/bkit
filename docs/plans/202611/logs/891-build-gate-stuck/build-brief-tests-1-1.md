# Brief: group 1 — Engine evidence the pause reads (tests)

Plan: Build Gate Pause: Base-Commit Evidence and Resume Re-Run Implementation Plan

## Why and what

### Context & Goals

A consumer's `dev` carried 3 red unit tests that the build's branch did not cause. `/bkit-build` built and verified task group 1, and then its group gate (`bkit:gate:static-unit`) failed on those 3 tests. The first Decision Pause offered an `Accept` that the workflow never defines, and the second pause offered only `Try again` or `Stop`. No fix round on the branch could change the result, so groups 2-6 never started. The owner's rescope (issue comment of 2026-11-09) drops the accepted-failure design of the superseded plan and keeps the workflow's shape: a failure a round can fix gets `Try again`, and a failure no round can fix gets a plain `Stop` recommendation, so the owner fixes the cause and resumes.

The defects this plan closes, as the issue found them by reading the code:

<!-- prettier-ignore -->
| # | Defect | Where |
| --- | --- | --- |
| 1 | The loop question recommends from the problem-count trend alone and never asks whether the failing tests also fail on the commit the branch started from. | `loopTrend` / `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts` |
| 2 | The verify loop's progress numbers count only the verify agent's problems, so a red group gate after two clean verify rounds shows `0 → 0`. | `LOOPS.verify.check` in `.bkit/core/engine/commands/workflow/decisions.ts` |
| 3 | A resume after the owner fixes `dev` returns to the stale open pause. `Try again` starts a fix round that changes nothing, and that round routes back to the pause, so the build loops. | Contract **Resume** and Step 9 sub-step 5 in `.bkit/core/workflows/bkit-build.md` |
| 4 | The pause offered `Accept` for a gate failure that the Decision Pause rules exclude, either invented by the orchestrator or logged as a gap by the verify agent. | Decision Pause step 2 in `.bkit/core/workflows/bkit-build.md`; `.bkit/core/prompts/bkit-build-plan-verify.md` |

**Goals:**

- At every pause after a red group gate (Step 8) or a red final run (Step 12), check the failing tests against the base commit, and let that verdict steer the recommendation and its wording. A CI run at that exact commit may settle it; the last CI run on `dev` never does.
- Count the group gate's failing tests in the verify loop's progress numbers.
- On a resume into a pause about a red gate, re-run that gate first and continue when it is green.
- Keep gate and suite failures out of the pause's items, and out of the verify agent's gaps in group mode.

Items 1, 2 and 4 change only the information the pause shows. Item 3 is the one route change. The plan adds no option, no owner answer and no way to build past a red test.

**Related Issues:**

- #743 — Build group gate re-runs integration tests after every group (closed)
- #607 — Test full-mode runs gate on every non-success final-check result (closed)
- #510 — Test gate and dependency install: stack-neutral gate lookup and safe exit handling (closed)
- #814 — Give load-sensitive tests a budget that holds under the full gate (open)
- #889 — Build: a holistic verify FAIL aborts the run instead of fixing it (closed)
- #771 — Catch green test lanes whose runner failed in gates/testing audits (closed)
- #346 — CI gate: block on open CRITICAL failures, age old deferrals (closed)
- #755 — Workflow optimisation: CI, tests and gates (done) (closed)
- #226 — Quality gates: pre-commit ⊆ pre-push ⊆ CI chain (closed)
- #657 — Build fix loops: stop on unfixable, pause on architectural, defer LOW (closed)

---

### Narrative

When `/bkit-build` pauses because a group gate or the final test run is red, the owner is told whether those failing tests also fail on the commit the branch started from. The recommendation follows from that: `Stop` and fix `dev` when no round here can help, or `Try again` when a round can. After the owner fixes `dev` and resumes, the build re-runs the red gate and carries on if it's now green, instead of looping on the old pause.

### Success Criteria

1. At a pause after a red group gate (Step 8) or a red final run (Step 12), the pause says how many failing tests also fail on the base commit: all, some, none, or "can't tell" with the reason.
2. When all failing tests are also red on the base commit, the pause recommends `Stop` and tells the owner to fix `dev` first. In adopt mode it also tells them to merge `dev` into the branch before resuming. `Try again` is still offered in every case.
3. The pause's "problems after each round" numbers include the group gate's failing tests, so a red gate never shows as "0 → 0".
4. Resuming into a pause about a red gate re-runs that gate first. If it passes, the build continues without asking. If it's still red, the pause is asked again with fresh numbers.
5. A group-gate or final-run failure is never offered as an `Accept` item, and the verify agent doesn't log gate failures as verify gaps.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The base-commit check at `/bkit-debug`'s Loop Question | No Success Criterion or matrix row needs it, and the issue declares it out of scope: debug often runs to fix exactly a base-red failure, so a "came from `dev`" label would be wrong when that failure is the job. | Deferral `891-debug-base-red-label` (`scope-declared`, citing the issue comment's Out of scope line). |
| A base-red notice at `/bkit-ship`'s CI wait | No Success Criterion or matrix row needs it, and the issue declares it out of scope: ship still needs green CI as today. | Deferral `891-ship-base-red-notice` (`scope-declared`, citing the same line). |
| Settling `all` / `some` from a red CI run at the base sha via published JUnit artifacts | The issue's scope asks only for "a CI run on that exact commit" when one exists; a passing run settles `none` here, and every other case runs locally, so every criterion is met without it. It is plan-sized: it changes the shipped CI template to upload reports, adds a `gh run download` reader and a mapping from CI cases to gate cases. | Deferral `891-ci-junit-artifact-settles-red-base-runs` (`own-cycle`). |

## Where it fits

- Group 1: Engine evidence the pause reads — this group
  - TASK 1: Move the JUnit reader and the one-file runner into the leaf module `junit.ts`, keep each case's `classname` and `file`, and split out `reportFailures` — open
  - TASK 2: Base-run helpers: an offline-first install and the exports the base run reuses — open
  - TASK 3: Count the group gate's failing tests in the verify loop's progress — open
- Group 2: The base check — next
  - TASK 4: Classify failing cases against the base run — open
  - TASK 5: The `bkit tests base` verb and its local run at the base commit — open
  - TASK 6: CI evidence at the base sha, the run's mode and its install setting — open
- Group 3: The pause's wording and engine support for the resume re-run — later
  - TASK 7: `decisions compose --base-check` words the loop question from the verdict — open
  - TASK 8: `decisions apply --by=rerun` — open
  - TASK 9: `openDecision.gate` — open
- Group 4: Workflow and prompt — later
  - TASK 10: The Decision Pause runs the base check, and Step 9's no-progress route asks the loop question — open
  - TASK 11: A resume into a red-gate pause re-runs the gate — open
  - TASK 12: Group-mode verify logs no gap for a test the group gate runs — open
- Group 5: Docs, generated files and mirrors — later
  - TASK 13: Update the catalog and test docs, and regenerate `dist/`, the capability register and the host mirrors — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Move the JUnit reader and the one-file runner into the leaf module `junit.ts`, keep each case's `classname` and `file`, and split out `reportFailures`
  - **CREATE:** `.bkit/core/engine/commands/workflow/junit.ts`: a leaf module that imports none of `tests.ts`, `steps.ts` or `runs.ts`, holding the definitions moved from `tests.ts` and the new `reportFailures`
  - **DELETE:** `CaseState` in `.bkit/core/engine/commands/workflow/tests.ts`: moved to `junit.ts`
  - **DELETE:** `JunitCase` in `.bkit/core/engine/commands/workflow/tests.ts`: moved to `junit.ts`
  - **DELETE:** `parseJunit` in `.bkit/core/engine/commands/workflow/tests.ts`: moved to `junit.ts` with its private helpers `XML_ENTITIES`, `decodeXml`, `ATTRS`, `attr` and `escapeCdata`
  - **DELETE:** `countReportFailures` in `.bkit/core/engine/commands/workflow/tests.ts`: moved to `junit.ts`
  - **DELETE:** `runToLog` in `.bkit/core/engine/commands/workflow/tests.ts`: moved to `junit.ts`
  - **DELETE:** `REPORT_ENV` in `.bkit/core/engine/commands/workflow/tests.ts`: moved to `junit.ts`
  - **DELETE:** `runTestFile` in `.bkit/core/engine/commands/workflow/tests.ts`: moved to `junit.ts`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: import the moved definitions from `./junit.js` and re-export none
  - **UPDATE:** `JunitCase` in `.bkit/core/engine/commands/workflow/junit.ts`: add `classname: string | null` and `file: string | null`
  - **UPDATE:** `parseJunit` in `.bkit/core/engine/commands/workflow/junit.ts`: read both attributes from each `<testcase>` tag, null when absent
  - **UPDATE:** `runTestFile` in `.bkit/core/engine/commands/workflow/junit.ts`: export it, signature unchanged
  - **UPDATE:** `countReportFailures` in `.bkit/core/engine/commands/workflow/junit.ts`: return the length of the new `reportFailures(dir): JunitCase[] | null`, which returns the `failure` / `error` cases of every `*.xml` under `dir`, or null with none
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.test.ts`: import the moved symbols from `./junit.js`; the existing `parseJunit` `toEqual<JunitCase[]>` expectations gain the two fields
  - **UPDATE:** `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`: import the moved symbols from `junit.ts`
  - **DONE WHEN:** `junit.ts` imports none of `tests.ts`, `steps.ts` or `runs.ts`; `tests.ts` holds none of the moved definitions; `parseJunit` returns `classname` and `file` for every case; `runTestFile` and `reportFailures` are exported from `junit.ts`; `vitest run .bkit/core/engine/commands/workflow/tests.test.ts` and `vitest run .bkit/core/engine/audits/repo/test-file-script.integration.test.ts` pass; and `pnpm build` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `parseJunit > keeps each case's classname and file attribute` fails on the case's `file` being undefined instead of the report's path
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `reportFailures > returns the failing and erroring cases of every report, or null with none` fails on `reportFailures` not being exported from `junit.ts`, so no case list comes back

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Base-run helpers: an offline-first install and the exports the base run reuses
  - **UPDATE:** `installCommand` in `.bkit/core/engine/shared/package-manager.ts`: optional `preferOffline` appends `--prefer-offline`
  - **UPDATE:** `install` in `.bkit/core/engine/commands/workflow/worktrees.ts`: export it with an optional `{ preferOffline }` passed to `installCommand`
  - **UPDATE:** `copyListed` in `.bkit/core/engine/commands/workflow/worktrees.ts`: export it unchanged
  - **UPDATE:** `withCleanup` in `.bkit/core/engine/commands/ci/ci.ts`: export it unchanged
  - **UPDATE:** `.bkit/core/engine/commands/workflow/runtime.ts`: extract the `assert` verb's latest-row filter as exported `latestRuntimeRow(events, workflow?)`, and call it from `assert`
  - **DONE WHEN:** `installCommand({ frozen: true, preferOffline: true })` returns `pnpm install --frozen-lockfile --prefer-offline`, the four helpers are exported, `pnpm typecheck` passes, the existing `runtime assert`, `worktrees setup` and package-manager tests pass unchanged, and `pnpm build` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/shared/package-manager.test.ts` `a prefer-offline frozen install adds --prefer-offline` fails on the argv ending at `--frozen-lockfile` without "--prefer-offline"

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Count the group gate's failing tests in the verify loop's progress
  - **UPDATE:** `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: optional `gate` step prefix; per round add the latest same-attempt `test-run` row's `failures` for step `{gate}-{group}`, 0 with no row, null when the row's count is null or the row is red (verdict `FAIL`) with 0 counted failures
  - **UPDATE:** `LoopProgress` in `.bkit/core/engine/commands/workflow/counters.ts`: `rounds[].gateFailures` and `gateCounts`
  - **UPDATE:** `countersCommand` in `.bkit/core/engine/commands/workflow/counters.ts`: the `counters progress` output help names `gateCounts` and `rounds[].gateFailures`
  - **UPDATE:** `LOOPS` in `.bkit/core/engine/commands/workflow/decisions.ts`: `verify.gate = "build-group-gate"`, passed to `loopProgress`
  - **UPDATE:** `decisionsCommand` in `.bkit/core/engine/commands/workflow/decisions.ts`: `compose` prints `Group gate failures after each round: {gateCounts}` for the verify loop
  - **READ:** `readStatusRows` in `.bkit/core/engine/commands/workflow/status.ts`: the `test-run` rows
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: existing `bkit counters progress` expectations that compare whole outputs gain the new fields
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: existing compose expectations on a verify-loop file gain the `Group gate failures after each round` line
  - **DONE WHEN:** a verify round with a red gate of 3 failures and 0 verify problems counts 3, a null gate count and a red gate with 0 counted failures each read `?` with trend `stuck`, the compose progress block prints the gate line, `counters.test.ts` and `decisions.test.ts` pass, and `pnpm build` has run, so `pnpm bkit:check:dist` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `loopProgress with a gate > adds the group gate's failing tests to each verify round` fails on the counts reading 0 → 0 instead of "3 → 3"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `loopProgress with a gate > a red gate row with no failure count makes the round unknown` fails on the round counting 0 instead of `?` and the trend not being "stuck"
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `loopProgress with a gate > a red gate row with 0 counted failures makes the round unknown` fails on the round counting 0, so a red gate reads "0 → 0" instead of `?` with trend `stuck`
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `loopProgress with a gate > a verify round whose gate did not run adds no gate failures` fails on `gateCounts` being absent instead of "0 → 3"
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions compose > prints the group gate's failing tests per round for the verify loop` fails on the file lacking a "Group gate failures after each round" line

<!-- bkit:task 3 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `parseJunit` keeps each case's `classname` and `file` attribute | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `reportFailures` returns the failing and erroring cases of every report under a folder, or null with no report, and `countReportFailures` counts exactly those cases | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| a prefer-offline frozen install adds `--prefer-offline` after `--frozen-lockfile` | Unit | `.bkit/core/engine/shared/package-manager.test.ts` | 2 |
| verify loop progress adds the group gate's failing tests to each round (a round with a red gate of 3 and 0 verify problems counts 3, never 0; two such rounds read `3 → 3`, never `0 → 0`) | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| a red gate row with a null failure count makes the round `?` and the trend `stuck` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| a red gate row (verdict `FAIL`) with 0 counted failures makes the round `?` and the trend `stuck` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| a verify round whose gate did not run adds no gate failures, so the round counts only its verify problems and the trend compares those totals | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| `decisions compose --loop=verify` prints the group gate's failing tests per round | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 3 |
| `--base-check` verdict `all` with no items recommends `Stop` and says the tests fail on `dev` too | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| `--base-check` verdict `all` with items recommends `Decide` with the same reason | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| adopt mode adds "merge `dev` into the branch before resuming." | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| verdict `some` names how many a round can fix and how many come from `dev` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| verdict `none` keeps the trend recommendation and says the failures come from this branch | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| verdict `unknown` keeps the trend recommendation and says `cause unknown: {reason}` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| `Try again` is an option for every verdict | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| the progress block prints `Also red on base {base}: {baseRed} of {failing} ({source} run)`, and `Also red on base {base}: can't tell ({reason})` for `unknown` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| a missing `--base-check` file, or one that is not the verb's JSON shape, is a usage error whose message names the problem | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 7 |
| `decisions apply --by=rerun` writes `Decision: Re-run gate` under Q1 and sets `Status: DECIDED` | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 8 |
| `apply --by=rerun` refuses a file without `Gate: FAIL` or not `Status: OPEN` with a message naming that condition, writing nothing | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 8 |
