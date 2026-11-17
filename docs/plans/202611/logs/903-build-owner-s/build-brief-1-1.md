# Brief: group 1 — A test-fix FAIL is cleared by the next passing test run (Part 4)

Plan: Build: Owner's Fix Now Answer Reaches the Agents and the Summary Implementation Plan

## Why and what

### Context & Goals

The owner answers at `/bkit-build`'s Decision Pause, and a later step ignores the answer. The issue has four parts; this plan covers the three that can be scoped today and states what Part 3 holds as of 2026-11-11.

<!-- prettier-ignore -->
| Part | Defect | Where (re-check after #891 merges) |
| --- | --- | --- |
| 1 | A `Fix now` answer with a direction on a `**Fixable:** false` challenge task never reaches the build agents. Decision Pause step 5 keeps the task "as it is", so its `DONE WHEN` and `TEST FIRST` still describe the option the owner turned down. `tests red` reads the plan's `TEST FIRST`, so a test writer that follows the owner records the wrong test `missing`, and one that follows the plan logs `BLOCKED`. A hard blocker answered `Fix now` with no direction has no route. | `.bkit/core/workflows/bkit-build.md` § Decision Pause steps 4-6, Contract **Owner decisions** bullet |
| 2 | `buildSummary` clears a failed group only through a later passing verify of the **same** group. After a verify-gaps pause answered `Fix now`, the fix runs as a new task in a new group, the old group is never verified again, and its `build-plan-tasks`, `build-plan-verify` and `build-plan-gaps-remediate` FAIL rows stay. Every such run summarises as FAIL and Step 15 sends it to the Failure Path with no PR. Nothing links a `Fix now` item to the task that carries its fix. | `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts` (the `answer` lookup); `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts` |
| 3 | Whatever #891's build leaves undone. #891 is not shipped: `feat/891-build-gate-stuck` has all 22 plan tasks ticked and holistic verify attempt 5 `PASS`, and its remaining steps (challenge, final run, summary, ship) are still to run. Compared with its issue body, the parts it does not deliver were dropped by the owner's rescope (accept-once of base-red tests, `/bkit-ship` showing them) or recorded as its own deferrals. None of them is an owner answer that a later step ignores, except the headless `Stop` route its plan lists as a scope candidate. | Open Question Q1 |
| 4 | `RESOLVED_BY` has no entry for `build/build-failure-remediate` or `debug/debug-failure-remediate`. A test-fix step that ends FAIL (for example because the machine-wide tests lock blocked its own confirming re-run) stays a summary failure even when the next full test run passes on the same scope. `/bkit-debug` reaches its summary in that state: Step 7 → Step 3 (`TEST_VERDICT` = PASS) → Step 9 → Step 10. | `RESOLVED_BY` and the `answer` lookup in `.bkit/core/engine/commands/workflow/summary.ts` |

**Goals:**

- The plan's task block is the one place a `Fix now` direction reaches the test writer, the code writer, `tests red` and verify.
- The decision file records which task carries each `Fix now` item's fix, so the summary can check that evidence instead of guessing.
- The summary clears a failure only on evidence its contract assesses (`.bkit/workflows.md` § Summary / handover step, **Resolution evidence**), and keeps it when evidence is missing.

**Checks the issue asks for (Part 1's "also check"):**

- **Steps 8-10:** Step 8 verify (`@bkit-build-plan-verify`) and Steps 9-10 gap remediation (`@bkit-build-plan-gaps-remediate`) already get the decision file in their `Read:` lists and read its `Decision:` lines (`.bkit/core/.bkit/workflows.md` § Decision Pause **Fixer reads the answer**; `bkit-build-plan-verify.md` and `bkit-build-plan-gaps-remediate.md` decision-record clauses). Step 8 also judges against the rewritten task block, so no Step 8-10 prompt changes.
- **`/bkit-debug`:** it has no Decision Pause. Its only owner question is the **Loop Question** (`bkit-debug.md` § Loop Question: `Try again` or stop), which has no `Fix now` answer, so Part 1 does not reach it.
- **Contract-change trace (`.agents/rules.md` § Contract changes):** `grep -l 'build-decision-'` over `.bkit/core/workflows/`, `.bkit/core/prompts/` and `.bkit/core/docs/templates/` finds only `bkit-build.md`. `grep -l 'Decision:'` over the same folders also finds `bkit-build-plan-verify.md` and `bkit-build-plan-gaps-remediate.md`, which read `Decision:` lines only, so a new `Fix task:` line changes nothing for them; the other hits (`bkit-design.md`, `bkit-plan.md`, `bkit-design-update.md`, `bkit-plan-update.md`, `bkit-debug-failure-diagnose.md`, `bkit-audit-gates.md`) use `Decision:` for their own records, not the build decision file. In the engine, `challenge merge` and `challengeResolution` read the decision file through `parseDecisionItems`, which keeps every existing field. On the resume path, a run resumed after step 5 wrote a task block but before step 6 wrote its `Fix task:` line keeps the group's FAIL, which is the safe side; the per-group loop and the remediation paths read no new field.

**Related Issues:**

- #891 — Build: gate stuck on tests already red on dev, owner accept ignored (open)
- #899 — Build: owner's Fix now direction never reaches the build agents (closed)
- #900 — Build: summary says FAIL after Fix now moved a group's gaps elsewhere (closed)
- #864 — Move project docs to templates with adoption warnings (open)
- #843 — Friction triage (open)

---

### Narrative

The owner answers `Fix now` at `/bkit-build`'s Decision Pause, giving a direction where the item needs one, and the build builds that direction, and the summary credits the verified fix instead of reporting FAIL. A test-fix step that ended FAIL no longer fails the summary once the next test run on the same scope passes.

### Success Criteria

The owner approved this wording at plan approval; it is drawn from the issue's `What should happen` text for Parts 1, 2 and 4.

1. A `**Fixable:** false` challenge task answered `Fix now` with a direction has its `DONE WHEN` and `TEST FIRST` rewritten to that direction before Step 7 runs.
2. A hard blocker answered `Fix now` with no direction gets a follow-up question, and no task is built for it until the owner gives the direction.
3. A group whose verify pause answered every item, with each `Fix now` task ticked and verified `PASS` in its own group after the pause, has no FAIL reason in `workflows summary`; each accepted item stays a concern. A verify pause that answered every item `Accept`, with no `Fix now`, clears the same FAIL rows, and its accepted items stay a concern.
4. An unanswered item, a `Fix now` item with a missing or wrong `Fix task:` line, or an unticked or unverified fix task keeps the paused group's FAIL.
5. A `build-failure-remediate` or `debug-failure-remediate` FAIL counts as resolved when a later test run in the same run passes with 0 failures on the same scope, and stays a failure without one.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The Part 4 rule for `debug-failure-soak`: debug Step 8 can finish FAIL and routes to Step 3, so a debug run can reach its summary with a soak FAIL that `RESOLVED_BY` has no entry for | Part 4 names only `build-failure-remediate` and `debug-failure-remediate`; no matrix row, edge case or decision needs the soak step. A soak iteration hunts an intermittent failure, so whether one later pass proves it gone is an owner decision, not a mechanical copy of Part 4. | Deferral `903-debug-soak-fail-resolved-by-later-passing-run` (`needs-decision`, options A-C in its `description`). |
| The Part 4 rule for the diagnose steps: `build-failure-diagnose` (build Step 13) and `debug-failure-diagnose` (debug Step 6) can end FAIL, and `RESOLVED_BY` has no entry for them, so a later passing test run on the same scope leaves the summary at FAIL | The issue names only the two remediate steps; no Success Criterion, matrix row, edge case or decision needs the diagnose steps. A diagnose step that ends FAIL may have found no cause at all, so whether a later pass settles it is an owner decision, beside the soak step's. | Deferral `903-diagnose-fail-resolved-by-later-passing-run` (`needs-decision`, options in its `description`). |

## Where it fits

- Group 1: A test-fix FAIL is cleared by the next passing test run (Part 4) — this group
  - TASK 1: Resolve a failed test-fix step by a later passing test run on the same scope — open
- Group 2: A verified Fix now task or an Accept-only pause clears its paused group's FAIL (Part 2) — next
  - TASK 2: Parse the `Fix task:` line and the decision file's header block — open
  - TASK 3: Resolve a verify pause's group FAIL rows once each `Fix now` task is verified — open
  - TASK 4: Resolve a verify pause's group FAIL rows when every item is answered `Accept` — open
- Group 3: The Decision Pause carries the owner's Fix now direction (Part 1) — later
  - TASK 5: Rewrite a `Fix now` challenge task in place, ask again for a hard blocker's direction, and record `Fix task: {N}` — open
- Group 4: Docs and generated copies — later
  - TASK 6: Document the two resolution rules and the reshaped Decision Pause — open
  - TASK 7: Regenerate the built and mirrored copies — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Resolve a failed test-fix step by a later passing test run on the same scope
  - **UPDATE:** `RESOLVED_BY` in `.bkit/core/engine/commands/workflow/summary.ts`: add `build/build-failure-remediate` → `build-run-tests` and `debug/debug-failure-remediate` → `debug-run-tests`.
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: for these two entries the `answer` lookup also requires the later run's `scope` to equal the `scope` of the `*-run-tests` `step-done` row (never a `test-run` row) whose `attempt` equals the fix step's `attempt`; a missing row or `scope` leaves the FAIL.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.test.ts`: three new cases in `describe("buildSummary")`, built with the existing `input` helper.
  - **UPDATE:** `dist/commands/workflow/summary.js`: rebuilt with `pnpm build` and staged with the source.
  - **READ:** `.bkit/core/workflows/bkit-build.md`: Step 12 `--scope` and Step 14 `--attempt-of=build-run-tests:current`.
  - **READ:** `.bkit/core/workflows/bkit-debug.md`: Step 3 `--scope` (including the CI-sourced `ci:{runId}` round) and Step 7 `--attempt-of=debug-run-tests:current`.
  - **DONE WHEN:** the three new cases pass; with rows `build-run-tests` attempt 1 FAIL, `build-failure-remediate` FAIL, `build-run-tests` attempt 2 PASS with 0 failures on the same scope, `s.reasons` holds no `build-failure-remediate FAIL`, `Resolved Findings` names `build-run-tests`, and the first failed run stays listed under the summary's `## Tests`; another scope, no later run, or a later FAIL keeps it in `s.reasons`; a debug fix FAIL after a `ci:{runId}` round stays in `s.reasons` when only a later local run passes; a `test-run` row with a different `scope` and the same `attempt` does not change the result; every existing case in `summary.test.ts` still passes; `pnpm bkit:check:dist` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a test-fix FAIL resolved by a later passing test run on the same scope is historical` fails on "build-failure-remediate FAIL" staying in the reasons after the same-scope passing run
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug fix FAIL resolved by a later passing debug test run is historical` fails on "debug-failure-remediate FAIL" staying in the reasons after the same-scope passing run
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug fix FAIL after a CI-sourced round is not resolved by a local pass` fails on the control case, a local first round followed by a same-scope local pass, keeping "debug-failure-remediate FAIL" in the reasons

<!-- bkit:task 1 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Clear a paused group's FAIL rows after its `Fix now` tasks are verified, or after an `Accept`-only pause | `.bkit/core/engine/commands/workflow/summary.ts` | language server: references to `taskVerified` (summary.ts `buildSummary`, summary-findings.ts `challengeResolution`); read `buildSummary`, `RESOLVED_BY`, the `answer` lookup and the Decision Pause block | `buildSummary`'s same-group `answer` lookup — covers a re-verified group, missing the moved-fix case; `taskVerified` — exactly the per-task evidence needed | EXTEND | A pre-pass over `build-decision` rows builds a map from paused group to its latest qualifying decision file; the per-group loop resolves that group's `build-plan-tasks`, `build-plan-verify` and `build-plan-gaps-remediate` rows whose last verdict is FAIL and which come before that row; `taskVerified` checks each `Fix now` task, and an `Accept`-only pause qualifies through the same map with no task to check. |
| Clear a test-fix FAIL after a later passing test run on the same scope | `.bkit/core/engine/commands/workflow/summary.ts` | `grep -rn 'failure-remediate'` over `summary*.ts` (no hit); read `RESOLVED_BY` and the `answer` lookup; read build Step 14 and debug Step 7 `steps finish` (`--attempt-of=*-run-tests:current`) and the `--scope` flags of build Step 12 and debug Step 3 | `RESOLVED_BY` + the `answer` lookup — covers step-to-step resolution, missing these two entries and a scope match | EXTEND | Add `build/build-failure-remediate` → `build-run-tests` and `debug/debug-failure-remediate` → `debug-run-tests`; for these entries the lookup also requires the later run's `scope` to equal the scope of the run the fix step followed. |
| Test the new behaviour | `.bkit/core/engine/commands/workflow/summary.test.ts` | `grep -n 'it(\|describe('` over `summary.test.ts`, `decisions.test.ts`, `workflow-shape.test.ts`, `workflows.test.ts`; read `planOf` in `workflows.test.ts` (it puts every task in `GROUP 1`) and the `compose` helper in `decisions.test.ts` (`decisions compose` fixtures) | `summary.test.ts` (`buildSummary` cases, the `input` and `row` helpers), `decisions.test.ts` (`parseDecisionItems` describe, `compose` helper), `workflow-shape.test.ts` (Decision Pause cases, `section` helper), `workflows.test.ts` (`bkit workflows summary` describe with a temp tree, `planOf` helper) | EXTEND | New cases go into the existing describes and reuse their helpers; `planOf` gains a per-task group, so the verb case holds the paused group's tasks and the fix task in different groups; no new test file and no second plan helper. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`

- **Existence Check:** the file exists; `buildSummary`, `RESOLVED_BY` and the `answer` lookup read on HEAD.
- **Part 4:** add `"build/build-failure-remediate": ["build-run-tests"]` and `"debug/debug-failure-remediate": ["debug-run-tests"]` to `RESOLVED_BY`. For these two keys the `answer` lookup also requires the later run's `scope` to equal the `scope` of the `*-run-tests` row whose `attempt` equals the fix step's `attempt` (both rows are `type: "step-done"` rows of `input.rows`, never the `test-run` rows that share their `step` and `attempt`; a missing row or a missing `scope` on either leaves the FAIL). A CI-sourced debug round (`scope` = `ci:{runId}`) therefore never matches a later local run, which keeps its FAIL. The existing conditions stay: later index, `PASS`, `failures` absent or 0, same task group (both undefined here).
- **Part 2:** before the per-group loop, build `pausedGroups: Map<number, {index, rel, tasks}>` from the run's `build-decision` rows. A row qualifies when its artifact's text (`read`) has `decisionHeader` `From` = `verify` and a numeric `Group`; `parseDecisionItems` gives at least one item; every item has a `decision` (a round-limit file's loop item, Q1 `Verify`, counts with its `Decide` answer, and is neither `Accept` nor `Fix now`); and either at least one gap item is `Fix now`, or there is at least one gap item and every gap item is `Accept` (an `Accept`-only pause). Every `Fix now` item has a `fixTask` that names a plan task for which `taskVerified(input, task, index)` is true (a `fixTask` naming a task the plan does not have fails the row); an `Accept`-only pause has no task to check. When several rows qualify for one group, the map keeps the latest. In the per-group loop, for `workflow === "build"` and `g.step` in `build-plan-tasks`, `build-plan-verify`, `build-plan-gaps-remediate` whose last verdict is `FAIL`, whose `taskGroupOf(row)` is a key of `pausedGroups` and whose last row's index is below that decision's index → `resolved.set(g.key, "the Decision Pause (`{rel}`), Fix now task(s) {N, …} verified")`, or `"the Decision Pause (`{rel}`), every item accepted"` for an `Accept`-only pause, and continue. A CONCERNS row of a paused group (a remediation warning, or a CONCERNS verify) is never cleared by this rule. Rows of the same group after the decision are left to the existing rules.
- The accepted-items concern, the bare-decision guard and every other rule stay as they are. `build-plan-verify` has no `RESOLVED_BY` entry and gets none: only the pause rule above clears it.
