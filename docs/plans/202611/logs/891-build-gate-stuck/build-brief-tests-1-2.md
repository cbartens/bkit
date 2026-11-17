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
  - TASK 1: Move the JUnit reader and the one-file runner into the leaf module `junit.ts`, keep each case's `classname` and `file`, and split out `reportFailures` — done
  - TASK 2: Base-run helpers: an offline-first install and the exports the base run reuses — done
  - TASK 3: Count the group gate's failing tests in the verify loop's progress — done
  - TASK 14: Widen the planned TASK 3 test's `gateFailures` type label so `pnpm typecheck` passes — open
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

<!-- bkit:task 14 start -->

- [ ] **TASK 14:** Widen the planned TASK 3 test's `gateFailures` type label so `pnpm typecheck` passes
  - **UPDATE:** `.bkit/core/engine/commands/workflow/counters.test.ts`: in `loopProgress with a gate > adds the group gate's failing tests to each verify round`, the `rounds.map` callback's parameter type `{ gateFailures: number }` becomes `{ gateFailures?: number | null }`, matching `LoopProgress.rounds[].gateFailures`; no expectation changes
  - **DONE WHEN:** `pnpm typecheck` exits 0 with no TS2345 at `counters.test.ts`, every assertion in the test is unchanged, and `counters.test.ts` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/counters.test.ts` `loopProgress with a gate > adds the group gate's failing tests to each verify round` fails on `tsc -p tsconfig.test.json` reporting TS2345 for the `{ gateFailures: number }` callback type

<!-- bkit:task 14 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| verify loop progress adds the group gate's failing tests to each round (a round with a red gate of 3 and 0 verify problems counts 3, never 0; two such rounds read `3 → 3`, never `0 → 0`) | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| a red gate row with a null failure count makes the round `?` and the trend `stuck` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| a red gate row (verdict `FAIL`) with 0 counted failures makes the round `?` and the trend `stuck` | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| a verify round whose gate did not run adds no gate failures, so the round counts only its verify problems and the trend compares those totals | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 3 |
| adds the group gate's failing tests to each verify round | Unit | `.bkit/core/engine/commands/workflow/counters.test.ts` | 14 |

### Planned tests that already exist

- TASK 14 `.bkit/core/engine/commands/workflow/counters.test.ts` `loopProgress with a gate > adds the group gate's failing tests to each verify round` — exists at `.bkit/core/engine/commands/workflow/counters.test.ts:968`; update that test in place: add expectations, never remove or loosen one
