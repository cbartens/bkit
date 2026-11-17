# Brief: group 4 — Workflow and prompt

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

- Group 1: Engine evidence the pause reads — done
  - TASK 1: Move the JUnit reader and the one-file runner into the leaf module `junit.ts`, keep each case's `classname` and `file`, and split out `reportFailures` — done
  - TASK 2: Base-run helpers: an offline-first install and the exports the base run reuses — done
  - TASK 3: Count the group gate's failing tests in the verify loop's progress — done
  - TASK 14: Widen the planned TASK 3 test's `gateFailures` type label so `pnpm typecheck` passes — done
- Group 2: The base check — done
  - TASK 4: Classify failing cases against the base run — done
  - TASK 5: The `bkit tests base` verb and its local run at the base commit — done
  - TASK 6: CI evidence at the base sha, the run's mode and its install setting — done
- Group 3: The pause's wording and engine support for the resume re-run — done
  - TASK 7: `decisions compose --base-check` words the loop question from the verdict — done
  - TASK 8: `decisions apply --by=rerun` — done
  - TASK 9: `openDecision.gate` — done
- Group 4: Workflow and prompt — this group
  - TASK 10: The Decision Pause runs the base check, and Step 9's no-progress route asks the loop question — open
  - TASK 11: A resume into a red-gate pause re-runs the gate — open
  - TASK 12: Group-mode verify logs no gap for a test the group gate runs — open
- Group 5: Docs, generated files and mirrors — next
  - TASK 13: Update the catalog and test docs, and regenerate `dist/`, the capability register and the host mirrors — open

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** The Decision Pause runs the base check, and Step 9's no-progress route asks the loop question
  - **READ:** `.bkit/instructions.md`: the `bkit-build.md` entries, by `pnpm instructions:show --file bkit-build.md`, before editing the workflow's sentences
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Decision Pause step 2 — the two item rules reworded (a failing group-gate or suite test is never an item), `GATE_LOG`, the `tests base` block (non-zero → **Failure Path**) and `{BASE_FLAGS}` on the compose call for a red-gate or `TESTS_LOOP` pause; step 4 — offer only the file's options; Step 9 sub-step 5 — `PAUSE_LOOP` = `verify` when `GATE_VERDICT` = FAIL; the Decision Pause gate checklist names the base check
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions entries for the changed and added standing lines under `#### bkit-build` (the item lines at 9788 and 9795 among them), by the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts` first, then `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated by `vitest run .bkit/core/engine/render -u`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: existing expectations on the reworded item lines follow the new wording
  - **DEPENDS ON:** 5, 7
  - **DONE WHEN:** `bkit-build.md` holds the `tests base` call and `{BASE_FLAGS}` only under the gate-pause condition, and `workflow-shape.test.ts` (engine calls included), `.bkit/core/engine/checks/status-holes.test.ts`, the render tests, `.bkit/core/engine/tools/instructions-coverage.test.ts` and `.bkit/core/engine/tools/instructions.test.ts` pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > the Decision Pause checks a red gate against the base commit before composing` fails on the Decision Pause holding no "tests base --log=" call
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > a no-progress round after a red gate pauses with the loop question` fails on Step 9 sub-step 5 not setting `PAUSE_LOOP` = `verify`
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > a failing gate or suite test is never a pause item` fails on step 2 still reading "because it is always fixed" and step 4 lacking the file-options rule

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** A resume into a red-gate pause re-runs the gate
  - **READ:** `.bkit/instructions.md`: the `bkit-build.md` entries, by `pnpm instructions:show --file bkit-build.md`, before editing the workflow's sentences
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Contract **Resume** — `openDecision.gate` = `FAIL` → `DECISION_ROUTE` from `from`, Decision Pause step 6's `steps finish --step=build-decision` block first, then `decisions apply --by=rerun` (so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again), `GATE_RERUN` = true, then Step 8 sub-step 8 (`VERIFY_VERDICT` = PASS, same `VERIFY_ATTEMPT`) or Step 12, with no `counters grant`; Step 8 sub-step 11 and Step 12 sub-step 4 — a route placed after the `counters route` block (so `{PAUSE_MAX}`, `PAUSE_STEP` and `PAUSE_POINT` are set on a fresh-session resume) sends a still-red re-run straight to the **Decision Pause**, a green re-run takes the existing green route without asking, and every route clears `GATE_RERUN`
  - **UPDATE:** `.bkit/instructions.md`: § Local Instructions entries for the changed and added standing lines under `#### bkit-build`, by the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts` first, then `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated by `vitest run .bkit/core/engine/render -u`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the `resume facts` test's field list gains `gate`
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: a case for the resume re-run sequence (a `build-decision` row, then a second `build-group-gate` row under the same verify attempt)
  - **DEPENDS ON:** 8, 9, 10
  - **DONE WHEN:** the Contract **Resume** bullet routes a `Gate: FAIL` pause to the re-run with `steps finish` before `apply`, Steps 8 and 12 route a still-red re-run to the pause and a green one onward, the `status-holes.test.ts` resume re-run case reports no hole, and `workflow-shape.test.ts`, `.bkit/core/engine/checks/status-holes.test.ts`, the render tests, `.bkit/core/engine/tools/instructions-coverage.test.ts` and `.bkit/core/engine/tools/instructions.test.ts` pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `resume facts > build re-runs a red gate pause instead of asking it` fails on the Resume bullet holding no "decisions apply --by=rerun" call
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > a re-run gate that is still red goes straight to the Decision Pause` fails on Step 8 sub-step 11 or Step 12 sub-step 4 lacking the `GATE_RERUN` route
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > a green re-run gate continues without asking and clears GATE_RERUN` fails on a Step 8 sub-step 11 or Step 12 sub-step 4 route lacking "GATE_RERUN" cleared, or the green route asking a question

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Group-mode verify logs no gap for a test the group gate runs
  - **READ:** `.bkit/instructions.md`: the prompt's entries, by `pnpm instructions:show --file bkit-build-plan-verify.md`, before editing the prompt's sentences
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: Process step 6 (Group mode) gains the rule; step 7 (Holistic) unchanged; the rule notes that after the last group, with no group gate, Step 12's final run and holistic verify cover a failing test
  - **UPDATE:** `.bkit/instructions.md`: the § Local Instructions entry for the new standing line under `#### bkit-build-plan-verify`, by the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts` first, then `pnpm instructions:sync`
  - **READ:** `.bkit/prompts.md`: the `bkit-build-plan-verify` row (`verify one group, or the whole plan once, vs the plan; …`) still describes the prompt, so the index gets no edit
  - **DEPENDS ON:** 10
  - **DONE WHEN:** the prompt's Group-mode step holds the rule, its Holistic step still logs each failing test as a gap, `.bkit/prompts.md`'s `bkit-build-plan-verify` row is unchanged and accurate, and `workflow-shape.test.ts`, `.bkit/core/engine/tools/instructions-coverage.test.ts` and `.bkit/core/engine/tools/instructions.test.ts` pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build > group-mode verify logs no gap for a test the group gate runs` fails on the Group-mode step lacking "not a gap" for a gate-run test

<!-- bkit:task 12 end -->

### Earlier tasks this group depends on

- TASK 5 (group 2, done): The `bkit tests base` verb and its local run at the base commit — `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts`, `.bkit/core/engine/commands/workflow/tests-base.ts`, `.bkit/core/engine/commands/workflow/tests.ts`, `tests/fixtures/gates/pnpm.cjs`, `.bkit/core/.bkit/cli.md`
- TASK 7 (group 3, done): `decisions compose --base-check` words the loop question from the verdict — `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/.bkit/cli.md`
- TASK 8 (group 3, done): `decisions apply --by=rerun` — `.bkit/core/engine/commands/workflow/decisions.ts`
- TASK 9 (group 3, done): `openDecision.gate` — `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`

Reuse Inventory rows left out: 3; Architecture entries left out: 4 — read them in docs/plans/202611/891-build-gate-stuck-plan.md § Reuse Inventory and § Architecture & Component Changes.
