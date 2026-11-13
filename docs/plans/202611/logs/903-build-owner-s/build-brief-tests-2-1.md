# Brief: group 2 — A verified Fix now task or an Accept-only pause clears its paused group's FAIL (Part 2) (tests)

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

- Group 1: A test-fix FAIL is cleared by the next passing test run (Part 4) — done
  - TASK 1: Resolve a failed test-fix step by a later passing test run on the same scope — done
- Group 2: A verified Fix now task or an Accept-only pause clears its paused group's FAIL (Part 2) — this group
  - TASK 2: Parse the `Fix task:` line and the decision file's header block — open
  - TASK 3: Resolve a verify pause's group FAIL rows once each `Fix now` task is verified — open
  - TASK 4: Resolve a verify pause's group FAIL rows when every item is answered `Accept` — open
- Group 3: The Decision Pause carries the owner's Fix now direction (Part 1) — next
  - TASK 5: Rewrite a `Fix now` challenge task in place, ask again for a hard blocker's direction, and record `Fix task: {N}` — open
- Group 4: Docs and generated copies — later
  - TASK 6: Document the two resolution rules and the reshaped Decision Pause — open
  - TASK 7: Regenerate the built and mirrored copies — open

## The work

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Parse the `Fix task:` line and the decision file's header block
  - **UPDATE:** `DecisionItem` in `.bkit/core/engine/commands/workflow/decisions.ts`: add `fixTask: number | null`.
  - **UPDATE:** `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: read the positive integer on an item's `Fix task:` line, else null.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.ts`: export `decisionHeader(text)`, the `Key: value` lines before the first blank line; the file-header comment names the `Fix task:` line.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/decisions.test.ts`: two new cases in `describe("parseDecisionItems")`.
  - **UPDATE:** `dist/commands/workflow/decisions.js`: rebuilt with `pnpm build` and staged with the source.
  - **READ:** `lineOf` in `.bkit/core/engine/commands/workflow/decisions.ts`: the whole-text line reader `decisionHeader` must not reuse.
  - **READ:** `.bkit/core/engine/commands/workflow/decisions.ts`: check for #891's base-check reader `readBaseCheck`, the precondition that #891 is merged and synced into this branch. **If** it is absent → stop before any edit, because #891 has not landed.
  - **DONE WHEN:** `.bkit/core/engine/commands/workflow/decisions.ts` holds #891's `readBaseCheck`; `parseDecisionItems` returns `fixTask: 42` for a `Fix now` item with `Fix task: 42`, and null with no line or a non-integer value; `decisionHeader` returns `From` and `Group` from the header and ignores a `Group: 3` line inside an item; both new cases and every existing `decisions.test.ts` case pass; `pnpm bkit:gate:static` passes; `pnpm bkit:check:dist` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `reads the task a Fix now item names on its Fix task line` fails on `fixTask` being undefined instead of 42
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `decisionHeader reads the header block only` fails on `decisionHeader` not being exported from `decisions.ts`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Resolve a verify pause's group FAIL rows once each `Fix now` task is verified
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: build `pausedGroups` from the run's `build-decision` rows (header `From: verify` and a numeric `Group`, every item decided, the loop item's `Decide` counting as a decision, at least one `Fix now`, every `Fix now` item's `fixTask` naming a plan task that passes `taskVerified` after the decision row), keeping the latest qualifying row per group; resolve that group's `build-plan-tasks`, `build-plan-verify` and `build-plan-gaps-remediate` rows whose last verdict is `FAIL` and which come before the decision row, naming the decision file and the task numbers. CONCERNS rows of the group are left as they are.
  - **READ:** `taskVerified` in `.bkit/core/engine/commands/workflow/summary-findings.ts`: the per-task evidence.
  - **READ:** `.bkit/core/engine/commands/workflow/decisions.ts`: the `decisions compose` verb, the exact decision-file layout the fixtures copy (header block, `## Progress` block, loop item, gap items).
  - **READ:** `compose` in `.bkit/core/engine/commands/workflow/decisions.test.ts`: the helper that generates a real `decisions compose --loop=verify` file, which the fixtures may use instead of copying the layout.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.test.ts`: nine new cases in `describe("buildSummary")`. Each decision-file fixture uses the layout `decisions compose` writes: the header block (`Status`, `Question: VERIFY_GAPS`, `From: verify`, `Pause step`, `Plan`, `Group`, `Verify attempt`), a blank line, and for a round-limit pause (`--loop=verify`) the `## Progress` block and Q1 `Verify` with `Decision: Decide — …`, then the gap items (Q2 `Accept`, Q3 `Fix now` with `Fix task: 42`); the no-loop variant starts its gap items at Q1.
  - **UPDATE:** `planOf` in `.bkit/core/engine/commands/workflow/workflows.test.ts`: takes a group per task, so one plan holds group 9's tasks and the fix task 42 in group 10.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: one new case in `describe("bkit workflows summary")`, built with its `tree`, `done`, `task` and `planOf` helpers, with a verify artifact whose header holds `Verdict: PASS` and `Tasks: 42` (the header `taskVerified` reads).
  - **UPDATE:** `dist/commands/workflow/summary.js`: rebuilt with `pnpm build` and staged with the source.
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** with a round-limit `From: verify`, `Group: 9` decision file (Q1 `Verify` `Decide`, Q2 `Accept`, Q3 `Fix now`, `Fix task: 42`) and task 42 ticked and verified `PASS` in group 10 after the pause, `s.reasons` holds no group 9 FAIL row, `Resolved Findings` names the decision file, the accepted-items concern stays and the verdict is CONCERNS; the no-loop variant gives the same result; a `Fix now` task inside group 9 resolves each group 9 row once; an unanswered item, a missing `Fix task:` line, a `Fix task:` naming a task the plan does not have, an unticked or unverified task, or another group named in `Group:` keeps the FAIL; a paused group's `build-plan-gaps-remediate` and `build-plan-verify` CONCERNS rows stay under the reasons; a `From: holistic` or `From: challenge` file with `Group:` and `Fix task:` lines clears no group rows; a group that paused more than once is settled by its latest qualifying decision; the existing cases (`a group's failed execution stays unresolved when verification still has concerns`, `retains remediation warnings and unrelated group failures after a verification PASS`, `a build's last unanswered verify FAIL fails it`, the bare-decision guard) still pass; `bkit workflows summary` on the temp tree prints CONCERNS; `pnpm bkit:check:dist` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause's Fix now group is resolved once each fix task is verified` fails on "build-plan-verify (group 9) FAIL" staying in the reasons after task 42 was verified, with the loop question Q1 answered `Decide`
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause before the round limit resolves its Fix now group the same way` fails on the no-loop file's group 9 FAIL rows staying in the reasons after task 42 was verified
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause clears its group's FAIL only when every item is answered` fails on the group's FAIL rows staying when every item is answered
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause` fails on the group's FAIL rows staying when the fix task is ticked and verified after the pause
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause clears only the group its Group header names` fails on the named group's FAIL rows staying
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a Fix now item without a Fix task line or naming a missing task keeps its group's FAIL` fails on the control pause, whose `Fix task: 42` names a verified task, keeping its group's FAIL rows
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a paused group's CONCERNS rows stay concerns after its Fix now task is verified` fails on "build-plan-tasks (group 9) FAIL" staying in the reasons beside the kept CONCERNS rows
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a holistic or challenge decision file clears no group rows` fails on the control `From: verify` pause keeping its group's FAIL rows
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a group that paused more than once is settled by its latest qualifying decision` fails on the group's FAIL rows staying after the later `Fix now` pause's task was verified
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved` fails on the verb printing a FAIL verdict for the temp tree

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Resolve a verify pause's group FAIL rows when every item is answered `Accept`
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: a `From: verify` decision file with a numeric `Group` whose every item is decided (the loop item's `Decide` counting) and whose gap items are at least one and all `Accept`, with no `Fix now`, also qualifies for `pausedGroups`; it resolves the same FAIL rows before the decision row as Task 3's rule, with the reason `the Decision Pause ({rel}), every item accepted`. The accepted-items concern stays, and a bare `build-decision` row with no answered decision file still clears nothing.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.test.ts`: one new case in `describe("buildSummary")`, with a decision-file fixture in the `decisions compose` layout Task 3 uses (Q1 `Verify` `Decide`, Q2 and Q3 `Accept`, no `Fix task:` line).
  - **UPDATE:** `dist/commands/workflow/summary.js`: rebuilt with `pnpm build` and staged with the source.
  - **READ:** `.bkit/core/engine/commands/workflow/summary.test.ts`: the existing case `a group's failed execution stays unresolved when verification still has concerns`, whose `build-decision` rows carry no decision file.
  - **DEPENDS ON:** 3
  - **DONE WHEN:** with a round-limit `From: verify`, `Group: 9` decision file whose Q1 `Verify` is `Decide` and whose Q2 and Q3 are `Accept`, `s.reasons` holds no group 9 FAIL row from before the pause, `Resolved Findings` names the decision file, the accepted-items concern stays and the verdict is CONCERNS; the same file with Q3 unanswered keeps the group 9 FAIL rows; a group 9 FAIL row after the pause stays in `s.reasons`; the existing cases `a group's failed execution stays unresolved when verification still has concerns` and the bare-decision guard still pass, as do all of Task 3's cases; `pnpm bkit:check:dist` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `an Accept-only verify pause resolves its group's FAIL rows before the pause` fails on "build-plan-tasks (group 9) FAIL" staying in the reasons after a pause that answered every gap item `Accept`

<!-- bkit:task 4 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Resolve a failed test-fix step by a later passing test run on the same scope — `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/workflow/summary.test.ts`, `dist/commands/workflow/summary.js`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| A build test-fix FAIL is resolved by a later passing `build-run-tests` on the same scope, and stays without one, with another scope or with a later FAIL | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| A debug test-fix FAIL is resolved by a later passing `debug-run-tests` on the same scope | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| A debug test-fix FAIL after a CI-sourced round (`scope` = `ci:{runId}`) stays a failure when only a later local run passes | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| `parseDecisionItems` reads the task number on a `Fix now` item's `Fix task:` line, and null without one | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `decisionHeader` reads `From:` and `Group:` from the header block only, never from an item's text | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| A group's FAIL rows are resolved when its round-limit verify pause (loop question Q1 answered `Decide`) sent each `Fix now` item to a verified task, and the accepted items stay a concern; a `Fix now` task inside the paused group resolves each row once | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A verify pause before the round limit (no loop item) clears its group's FAIL rows the same way | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A verify pause clears its group's FAIL only when every item is answered | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A `Fix now` item clears its group's FAIL only through a ticked task its own group verified after the pause | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A verify pause clears only the group its `Group:` header names | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A `Fix now` item with no `Fix task:` line, or one naming a task the plan does not have, keeps the paused group's FAIL rows | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A paused group's `build-plan-gaps-remediate` and `build-plan-verify` CONCERNS rows stay concerns after its `Fix now` task is verified; only its FAIL rows clear | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A `From: holistic` or `From: challenge` decision file with `Group:` and `Fix task:` lines clears no group rows | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A group that paused more than once is settled by its latest qualifying `From: verify` decision | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A verify pause that answers every item `Accept`, with no `Fix now`, resolves its group's FAIL rows before the pause, and the accepted items stay a concern | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 4 |
| `bkit workflows summary` on a temp tree reads the paused group's decision file and the plan from disk, and prints `CONCERNS` for a run whose only FAIL rows are the `Fix now` group's and a test-fix step's | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 3 |
