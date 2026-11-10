<!-- bkit:anchor
baseSha: 1afb96fd32aa6bb0b20b5c349d7eb77c30cd48c5
baseRef: origin/dev
bkitVersion: 6.1.1
bkitLatest: 6.1.1
-->
Verdict: PASS

<!-- verdict:end -->

# Build: Owner's Fix Now Answer Reaches the Agents and the Summary Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

The issue is bug-shaped. Its `What should happen` sections under Parts 1, 2 and 4 describe the expected behaviour, but they are not change-shape `Narrative` / `Success Criteria` fields, so this plan does not copy them in.

### Success Criteria

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Process Sketch

- **WHEN** the owner answers a verify-gaps pause with some items `Accept` and one item `Fix now` **→ THEN** the pause writes the new task block and adds `Fix task: {N}` under the `Fix now` item in the decision file.
- **WHEN** that task is ticked and its own group's later verify passes, and Step 12 passes **→ THEN** `workflows summary` lists the paused group's FAIL rows under `Resolved Findings`, keeps the accepted items as a concern, prints `Verdict: CONCERNS`, and Step 15 goes on to Step 16.
- **IF** an item is unanswered, the `Fix now` task is unticked or never verified after the pause, or the item has no `Fix task:` line or names a task the plan does not have **→ THEN** the paused group's FAIL rows stay and the verdict is FAIL.
- **IF** the owner answers `Fix now` on a `**Fixable:** false` challenge task and names a direction **→ THEN** the pause rewrites that task's `DONE WHEN` and `TEST FIRST` to the direction in place, keeps its meta line, and Step 7 builds the direction.
- **IF** a hard blocker is answered `Fix now` with no direction **→ THEN** the item stays undecided and the owner is asked for the direction before anything is built.
- **IF** a test-fix step (build Step 14 or debug Step 7) ends FAIL and a later test run passes with 0 failures on the same scope **→ THEN** the summary lists the test-fix FAIL under `Resolved Findings`; with no such later run it stays a failure.

### Concrete Example

**Setup:** The owner runs `/bkit-build` in a session. The plan has 9 task groups. Group 9's verify fails at its round limit with two gaps, so the Decision Pause composes its file with `--loop=verify` and asks `Question: VERIFY_GAPS`, `From: verify`, `Group: 9`: Q1 is the loop question `Verify` (`Try again` / `Decide`), and Q2 and Q3 are the two gaps.

**Steps:**

1. Owner answers Q1 `Decide`, Q2 `Accept` and Q3 `Fix now` → System writes the `Decision:` lines, writes task 42 in a new group 10, adds `Fix task: 42` under Q3, runs `tests plan-check`, and routes to Step 7.
2. Step 7 writes task 42's tests, records them red, and writes the fix → Step 8 verifies group 10 `PASS` with `Tasks: 42` and ticks task 42.
3. Step 12 runs the final gate → `PASS`, 0 failures.
4. Step 15 runs `workflows summary` → `build-plan-tasks (group 9) FAIL` and `build-plan-verify (group 9) FAIL` appear under `Resolved Findings` as resolved by the Decision Pause, and `1 item(s) accepted at the Decision Pause` stays under the reasons.

**Outcome:** The summary prints `Verdict: CONCERNS`, and the run goes on to Step 16 and opens its PR instead of taking the Failure Path.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A `**Fixable:** false` challenge task is answered `Fix now` with a direction | Its `**DONE WHEN:**` and `**TEST FIRST:**` fields are rewritten to the direction; its number, title, group and `**Severity:** … · **Location:** … · **Round:**` meta line stay, `**Fixable:** false` included; its `Derived Test Matrix` rows are replaced by one per new test; `tests plan-check` passes. |
| A hard blocker (challenge or verify) is answered `Fix now` with no direction | The item counts as lacking a decision; the owner is asked for the direction as a follow-up; no task block is written or rewritten until it is given. |
| A hard blocker is left on a headless run | Unchanged: the run takes the Failure Path naming the hard blocker. |
| A run resumes at Decision Pause step 3 after step 6 wrote an item's `Fix task:` line, before `steps finish` | Step 5 reuses the task that line names and writes no second task block. |
| A verify pause holds `Accept` and `Fix now` items, and every `Fix now` task is ticked and verified `PASS` in its own group after the pause | The paused group's `build-plan-tasks`, `build-plan-verify` and `build-plan-gaps-remediate` FAIL rows are resolved; the accepted items stay a concern; the verdict is CONCERNS (or PASS with no other concern). |
| The verify pause is at its round limit, so its file holds the loop question as Q1 (`Verify`, `Decision: Decide — …`) before the gap items | The loop item counts as answered; the gap items from Q2 on are judged by the rule above. |
| The verify pause comes before the round limit (a `Fixable: false` gap), so its file has no loop item | The same rule applies; the gap items start at Q1. |
| A paused group's `build-plan-gaps-remediate` or `build-plan-verify` row ends CONCERNS, not FAIL | It stays under the reasons as a concern: the pause rule clears FAIL rows only, so remediation warnings are kept. |
| A group pauses more than once (an `Accept`-only pause, a re-verify that still FAILs, then a `Fix now` pause) | The latest qualifying `From: verify` decision for that group settles it: every FAIL row of that group before that decision row is judged against it. |
| A `From: holistic`, `From: challenge` or `From: tests` decision file carries a `Group:` line and a `Fix task:` line | It clears no group rows. |
| An item of that pause has no `Decision:` line | The paused group's FAIL rows stay. |
| A `Fix now` task is unticked, its group's latest verify is before the pause or not `PASS`, or its `Tasks` list omits it | The paused group's FAIL rows stay. |
| A `Fix now` item has no `Fix task:` line, or names a task the plan does not have | The paused group's FAIL rows stay: missing evidence leaves the finding unresolved. |
| A `build-decision` row has no artifact, or its decision file cannot be read | It clears nothing (the existing guard in `summary.test.ts`). |
| The decision names `Group: 8` | Only group 8's rows can be cleared; group 9's FAIL rows stay. |
| The `Fix now` task lands inside the paused group (within the caps) | The paused group is verified again; the existing same-group resolution applies, and the new rule agrees. |
| A holistic or tests pause is answered `Fix now` | Unchanged: Step 10 or Step 12 runs again after the fix group, and its own later row settles the result. |
| Build Step 14 ends FAIL and the next `build-run-tests` passes with 0 failures on the same scope | `build-failure-remediate FAIL` is resolved by `build-run-tests`; the first failed run stays listed under `## Tests`. |
| Build Step 14 ends FAIL and no later run passes, or the passing run used another scope | `build-failure-remediate FAIL` stays a failure. |
| Debug Step 7 ends FAIL and the next `debug-run-tests` passes with 0 failures on the same scope | `debug-failure-remediate FAIL` is resolved by `debug-run-tests`. |
| Debug Step 7 ends FAIL after a CI-sourced round (`debug-run-tests` `scope` = `ci:{runId}`), and only a later local run passes | `debug-failure-remediate FAIL` stays: the scopes differ, and local success alone does not resolve a CI-only failure (`docs/testing.md`). |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

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
| The Decision Pause rewrites a challenge task answered `Fix now` to the owner's direction in place: its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its meta line | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| A hard blocker answered `Fix now` with no direction is asked again before anything is built | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| Each `Fix now` item records the task that carries its fix as `Fix task: {N}` before the decision row is finished, and a resumed step 5 reuses the task that line names | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| The Contract **Owner decisions** bullet names the task block as the carrier of a `Fix now` direction, and `### 🔒 Gate — Decision Pause` checks the `Fix task` lines | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| `bkit workflows summary` on a temp tree reads the paused group's decision file and the plan from disk, and prints `CONCERNS` for a run whose only FAIL rows are the `Fix now` group's and a test-fix step's | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 3 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

<!-- prettier-ignore -->
| Name or change | Kind | Breaking? | Notes |
| --- | --- | --- | --- |
| `Fix task: {N}` line under each `Fix now` item of a `build-decision-{RUN}-{K}.md` file | New decision-file line | No | Optional: a file without it still parses (`fixTask` null). A decision file written before this change keeps its paused group's FAIL, as today. |
| `DecisionItem.fixTask: number \| null` | New field on an exported interface | No | Additive; every existing caller (`applyRecommendations`, `apply`, `pending`, `buildSummary`, `challengeResolution`, `acceptedLocations`) ignores it. |
| `decisionHeader(text)` exported from `decisions.ts` | New export | No | New name; no existing export is renamed. |
| A challenge task answered `Fix now` with a direction is rewritten in place | Workflow behaviour | No | The task keeps its number and meta line, so the summary's challenge resolution, `context brief` and `tests plan-check` see the same task. A run paused before the upgrade and resumed after it follows the new step 5. |
| Summary verdict of a run whose only FAIL rows are a `Fix now` group's or a test-fix step's | Summary behaviour | No | Moves from FAIL to CONCERNS or PASS only on the evidence above; nothing that was PASS or CONCERNS becomes FAIL. The pause rule clears FAIL rows only, so a CONCERNS run never turns PASS through it: a paused group's CONCERNS rows stay concerns. |
| A hard blocker answered `Fix now` with no direction gets a follow-up question | Owner-visible workflow behaviour | No | The owner is asked for the direction before anything is built; today the pause goes on to step 5 with no direction. Headless runs are unchanged. |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question Q1:** What does Part 3 ("whatever #891's build leaves undone") add to this plan? → the owner decides at plan approval.
  - **Options:** A) Nothing beyond Parts 1, 2 and 4 now: every part of #891's issue body it does not deliver was dropped by the owner's rescope or recorded as its own deferral, and none is an ignored owner answer; if #891's remaining steps (challenge, final run, summary) leave a task undone, that task joins this plan through a plan revision — keeps the plan buildable today, but may need one revision · B) Also fold in the headless `Stop` route that #891's plan lists as a scope candidate (a headless pause that takes `Stop` re-runs the red gate instead of stopping) — it fits "an answer a later step ignores", but it needs a design call (Failure Path at once, or the step 8 handover) and #913 rewrites the same Stop handover · C) Hold the whole plan until #891 ships, then plan Part 3 in the same pass — no revision risk, but it delays Part 4, which does not wait on #891.
  - **Recommended:** A) — #891's remaining work is known and deferred; B belongs with #913's Stop-handover design.
  - **Default if unanswered:** A.
- **Open Question Q2:** Once Part 4 clears a test-fix FAIL, does the flake behind the first failed run stay a concern? → the owner decides at plan approval.
  - **Options:** A) No concern: the passing run on the same scope is the evidence, and the failed run stays listed under the summary's `## Tests` and in `Assessment History` — the flake is visible but does not hold the verdict at CONCERNS · B) A concern whenever a failed `*-run-tests` precedes the final pass — flags every flake, but a real failure that Step 14 fixed looks the same, so every fixed run becomes CONCERNS · C) A concern only when the test-fix step changed no files — closest to "it was a flake", but the step row carries no changed-files field, so it needs a new signal on the row.
  - **Recommended:** A) — B cannot tell a flake from a fix, and C adds a new status field for a judgement the `## Tests` list already shows.
  - **Default if unanswered:** A.
- **Open Question Q3:** Should `@bkit-debug-failure-remediate` report FAIL when the only thing blocked was its own confirming re-run (`.bkit/core/prompts/bkit-debug-failure-remediate.md`, the `FAIL` verdict line)? → the owner decides at plan approval.
  - **Options:** A) Keep FAIL: the step could not confirm its result, and with Part 4 the next full test run judges it — no prompt change · B) Report CONCERNS when the step changed no files and only the tests-lock re-run was blocked — the step row reads truer, but it changes a verdict contract that build Step 14 and debug Step 7 share, and `.bkit/prompts.md`.
  - **Recommended:** A) — Part 4 already settles the summary, and a step that could not confirm its fix is honestly FAIL.
  - **Default if unanswered:** A.
- **Open Question Q4:** What are this plan's `Narrative` and `Success Criteria`? #903 is bug-shaped, with no design and no change-shape fields, so both sections read MISSING and the plan cannot invent them. → the owner decides at plan approval; Gate 1 stays blocked until both sections are filled.
  - **Proposed Narrative:** The owner answers `Fix now` at `/bkit-build`'s Decision Pause, giving a direction where the item needs one, and the build builds that direction, and the summary credits the verified fix instead of reporting FAIL. A test-fix step that ended FAIL no longer fails the summary once the next test run on the same scope passes.
  - **Proposed Success Criteria** (from the issue's `What should happen` text for Parts 1, 2 and 4):
    1. A `**Fixable:** false` challenge task answered `Fix now` with a direction has its `DONE WHEN` and `TEST FIRST` rewritten to that direction before Step 7 runs.
    2. A hard blocker answered `Fix now` with no direction gets a follow-up question, and no task is built for it until the owner gives the direction.
    3. A group whose verify pause answered every item, with each `Fix now` task ticked and verified `PASS` in its own group after the pause, has no FAIL reason in `workflows summary`; each accepted item stays a concern.
    4. An unanswered item, a `Fix now` item with a missing or wrong `Fix task:` line, or an unticked or unverified fix task keeps the paused group's FAIL.
    5. A `build-failure-remediate` or `debug-failure-remediate` FAIL counts as resolved when a later test run in the same run passes with 0 failures on the same scope, and stays a failure without one.
  - **Options:** A) Adopt the proposed wording — the plan proceeds at once, and the wording is drawn from the issue, but it is the planner's reading of it · B) The owner writes their own Narrative and Success Criteria — the contract is the owner's own words, but the plan waits for them.
  - **Recommended:** A) — each criterion restates one of the issue's `What should happen` rules, and every one already has a `Derived Test Matrix` row.
  - **Default if unanswered:** both sections keep the MISSING marker, and Gate 1 stays blocked.
- **Open Question Q5:** Does a verify pause that the owner answered with `Accept` on every item (no `Fix now`) resolve its group's FAIL rows? The issue's Part 2 rule reads as yes ("answered every item, and each `Accept` item stays a concern"), but `summary.test.ts` `a group's failed execution stays unresolved when verification still has concerns` asserts that an `Accept` pause followed by a CONCERNS re-verify keeps the group's `build-plan-tasks` FAIL, and no ledger row records why. That case's `build-decision` rows carry no decision file, so it holds under every option below. → the owner decides at plan approval.
  - **Options:** A) Keep the FAIL: the plan's rule needs at least one verified `Fix now` task, and the answer is recorded as a decision row — no new behaviour, but an `Accept`-only run still fails its summary and takes the Failure Path · B) Resolve the group: an `Accept`-only pause whose file answers every item clears its group's FAIL rows before the pause, and the accepted items stay a concern — matches the issue's wording and drops no signal, but widens Task 3's rule and adds a matrix row and a test · C) Defer it to its own decision — keeps this plan small, but the inconsistency stays live.
  - **Recommended:** B) — the issue's rule covers it, and the accepted-items concern already carries the signal; a bare `build-decision` row with no answered decision file still clears nothing.
  - **Default if unanswered:** A, the plan as written.
- **Assumption:** #891 merges to `dev` before Groups 2 and 3 are built, and Step 3 (Branch Sync) brings it into this branch → if wrong, Task 2 (`decisions.ts`) and Task 4 (`bkit-build.md`) edit text #891 also changes, and the sync conflicts. Group 1 touches only `summary.ts` and `summary.test.ts`, which #891 does not change.
- **Assumption:** A `*-run-tests` `PASS` row with no `failures` field (the gate wrote no JUnit report) counts as 0 failures, as the existing `answer` lookup treats it → if wrong, a consumer with no JUnit reporters keeps the test-fix FAIL; it never clears a FAIL wrongly, because `steps finish` refuses a `PASS` with failures.
- **Assumption:** Two test runs ran "the same scope" when their `step-done` rows' `scope` strings are equal (`--scope="{TEST_SCOPE}"` in build Step 12 and debug Step 3; `steps finish` requires `scope` on `build-run-tests` / `debug-run-tests` rows, per the closed deferral `58-test-verdict-scope-arg-accepts-empty-silently`) → if wrong (a workflow wrote two names for one gate), the test-fix FAIL stays, which is the safe side.
- **Assumption:** This plan lands before #895, which rewrites the decision-file layout and `parseDecisionItems`, and #895 rebases onto `fixTask` and `decisionHeader` → if #895 lands first, Task 2 is re-planned against #895's layout, and #895 must keep a per-item `Fix task:` line and a header block with `From:` and `Group:`, or every `Fix now` group keeps its FAIL.
- **Assumption:** A paused group's own `build-group-gate` FAIL rows stay outside the pause rule, because a group-gate failure is never a Decision Pause item (`bkit-build.md` § Decision Pause step 2: "always fixed") → if a gate-red group can ever reach a `Fix now` verify pause, its gate FAIL stays, which is the safe side.
- **Assumption:** A challenge task rewritten to the owner's direction keeps `**Fixable:** false` in its meta line, because the meta line records the challenge finding, and no build step skips a task for `Fixable: false` (only Decision Pause step 2 reads it, to make the item a hard blocker) → if a later step starts reading `Fixable: false` as "do not build", the rewritten task is not built and verify reports it open.
- **Assumption:** `taskVerified` in `.bkit/core/engine/commands/workflow/summary-findings.ts` is the right evidence for a `Fix now` task: ticked, its group's latest `build-plan-verify` after the pause is `PASS` with 0 failures and lists the task in `Tasks`, and no later execute or gap-fix row for that group → if wrong, the summary is stricter than needed (the FAIL stays), never looser.
- **Assumption:** `context brief` builds both Step 7 briefs from the plan's task blocks and matrix rows (`.bkit/core/engine/commands/workflow/context.ts`, `## The work`), so a rewritten challenge task reaches the test writer and the code writer with no `Read:` change → if wrong, the agents see the old block and Part 1 fails as today.
- **Assumption:** Every decision file of a verify pause carries the `Group:` and `From:` header lines (`--header=Group={GROUP}` in Decision Pause step 2) → if a file lacks them, its group cannot be named and nothing is cleared.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Rejected path | Why rejected |
| --- | --- |
| Part 1: add the decision file to the `Read:` lists of `@bkit-build-plan-tests` and `@bkit-build-plan-tasks` (Step 7 sub-steps 4 and 7) instead of rewriting the task block | `tests red` and `tests green` read the planned test names from the plan's `TEST FIRST`, not from the decision file. A test writer that follows the owner writes a test the plan does not name, so `tests red` records the planned one `missing`, and verify judges against the old `DONE WHEN`. The plan block must change either way, and once it does, the extra `Read:` entry only gives the agents a second source that can disagree with the plan. |
| Part 1: rewrite the challenge task as a new task block and tick the old one | The summary's challenge resolution matches a finding to its task by location, severity and round (`challengeResolution`), so a new block would leave the original finding unresolved or need a second matching rule. Rewriting in place keeps the meta line and the match. |
| Part 1: let the orchestrator restate the direction in the agents' `Context` | The Contract **Owner decisions** bullet forbids it, and a restatement is lossy; the plan block is a reviewed, checked (`tests plan-check`) artefact. |
| Part 2: infer the `Fix now` task from "every task added after the pause" | The plan keeps no record of when a task was added, and challenge or holistic tasks added later in the run would be mistaken for the fix. An explicit `Fix task: {N}` line is evidence the summary can check, and a missing one fails safe. |
| Part 2: write the `Fix task:` line through a new `bkit decisions` flag | Decision Pause step 6 already writes every `Decision:` line by hand; one more line there needs no verb, and a missed line keeps the FAIL, so the failure mode is visible, not silent. |
| Part 2: clear a group's FAIL when every plan task is ticked and Step 12 passed | Too broad: it would clear a group whose `Fix now` task was never verified, or whose item was never answered, which the **Resolution evidence** rule ("missing or ambiguous evidence leaves the finding unresolved") forbids. |
| Part 2: add a summary reason line saying why a decision file written before this change (no `Fix task:` line) keeps its group's FAIL | The summary already names each kept FAIL row, and the decision file is listed beside it; a special reason for old files adds a branch that is dead once in-flight runs finish. It joins the plan only on the owner's decision (Suggested Scope Expansion). |
| Part 2: match the decision to its verify round through the `Verify attempt:` header as well as `Group:` | Row order gives the same result: the rule clears only rows before the decision row, and judges each `Fix now` task by verify rows after it. |
| Part 4: let any later `*-run-tests` PASS clear the test-fix FAIL, whatever its scope | A narrower re-run (one file, or the unit tier only) would clear a FAIL the full gate never confirmed. The issue asks for the same scope. |

**Recommendations for a later phase:** decide whether the Part 4 rule applies to `debug-failure-soak` and to the two diagnose steps (Out of Scope rows), and decide the headless `Stop` route with #913.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The Part 4 rule for `debug-failure-soak`: debug Step 8 can finish FAIL and routes to Step 3, so a debug run can reach its summary with a soak FAIL that `RESOLVED_BY` has no entry for | Part 4 names only `build-failure-remediate` and `debug-failure-remediate`; no matrix row, edge case or decision needs the soak step. A soak iteration hunts an intermittent failure, so whether one later pass proves it gone is an owner decision, not a mechanical copy of Part 4. | Deferral `903-debug-soak-fail-resolved-by-later-passing-run` (`needs-decision`, options A-C in its `description`). |
| The Part 4 rule for the diagnose steps: `build-failure-diagnose` (build Step 13) and `debug-failure-diagnose` (debug Step 6) can end FAIL, and `RESOLVED_BY` has no entry for them, so a later passing test run on the same scope leaves the summary at FAIL | The issue names only the two remediate steps; no Success Criterion, matrix row, edge case or decision needs the diagnose steps. A diagnose step that ends FAIL may have found no cause at all, so whether a later pass settles it is an owner decision, beside the soak step's. | Deferral `903-diagnose-fail-resolved-by-later-passing-run` (`needs-decision`, options in its `description`). |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The headless `Stop` route: a headless pause that takes `Stop` re-runs the red gate by `From:` until its loop limit sends it to the Failure Path | #891's plan `docs/plans/202611/891-build-gate-stuck-plan.md` § Suggested Scope Expansion; Open Question Q1 B | Decision Pause step 6 routing; Task 4 | Needs a design decision; decide it with #913. |
| #913 — Owner Stop writes the full handover in debug, build and ship (OPEN) | #913 | Decision Pause step 6 and step 8 handover in `bkit-build.md`; Task 4 | Keep separate; build it after this plan so Task 4's step 5-6 text is settled. |
| #902 — Show every choice made without asking in each workflow's summary (OPEN) | #902 | `buildSummary` in `summary.ts`; Tasks 1 and 3 | Keep separate; it adds summary lines, this plan changes resolution rules. |
| #895 — One question format for every owner question in the workflows (OPEN) | #895 | The decision-file item layout this plan extends with `Fix task:`; `parseDecisionItems` (Task 2) | Keep separate, and build it after this plan (Assumption on #895); its format must keep the `Fix task:` line and the header block `decisionHeader` reads. |
| #904 — Question advisor: a fresh top-tier agent behind every owner question (OPEN) | #904 | The Decision Pause asks (steps 3-4); Task 4 | Keep separate. |
| `openDecision` in `workflows.ts` slices the decision file's header block inline instead of calling the new `decisionHeader` | This plan's investigation (`feat/891-build-gate-stuck`) | `decisions.ts` `decisionHeader` (Task 2) | Fold in only after #891 merges and only on owner decision; a one-call refactor with no behaviour change. |
| A Decision Pause composed before a step renumber posts its old step number | `docs/deferrals.jsonl` `705-build-plan-convert-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-279` | Decision file header lines (`Pause step`) that `decisionHeader` reads | Keep deferred; unrelated to the owner's answer. |
| `/bkit-debug` base-red label, `/bkit-ship` base-red notice, CI JUnit artifact for red base runs | `docs/deferrals.jsonl` `891-debug-base-red-label`, `891-ship-base-red-notice`, `891-ci-junit-artifact-settles-red-base-runs` | Part 3 (what #891 leaves undone) | Keep deferred: each was declared out of scope by #891's owner rescope and is not an ignored owner answer. |
| An `Accept`-only verify pause followed by a CONCERNS re-verify keeps the group's `build-plan-tasks` FAIL, with no recorded reason | `related-issues.md` #900, the `/bkit-debug #900` comment, item 2 (`summary.test.ts` `a group's failed execution stays unresolved when verification still has concerns`) | Task 3's pause rule | Put to the owner as Open Question Q5; it joins the plan only through that answer. |
| A decision file written before this change gets a reason line saying why its group stays FAIL | `related-issues.md` #900 comment, item 4 | Task 3's summary reasons | Fold into Task 3 only on the owner's decision; Alternative Approaches says why the plan leaves it out. |
| Match the decision to its verify round through the `Verify attempt:` header as well as `Group:` | `related-issues.md` #900 comment, item 3 | Task 3's pause rule | Keep as is: row order gives the same result (Alternative Approaches). |
| #907 — fix-loop strategy labels (OPEN) | `related-issues.md` #907 | `decisions.ts`; the `STANDARD → PIVOT → FINAL` sentence inside the **Fixer reads the answer** bullet Task 5 rewrites | Keep separate; Task 5 leaves that sentence as it is. |
| `audit-deterministic-bookkeeping-agent-artifact-envelope-arithmetic` (OPEN failure) | `related-failures.md` | `Fix task:` is one more machine-read line the orchestrator writes by hand | Keep separate. |

## Security & Privacy

- [ ] **New API Route** — n/a.
- [ ] **New DB Table/Column** — n/a.
- [ ] **Role-Gated Mutation** — n/a.
- [ ] **User Input** — n/a: the only new input is the `Fix task:` line the orchestrator writes into its own decision file; the parser accepts only a positive integer and reads anything else as null, which keeps the FAIL.
- [ ] **PII** — n/a.
- [ ] **Redirect URL** — n/a.
- [ ] **Webhook** — n/a.
- [ ] **New Secret/Env Var** — n/a.

None — no new routes, DB writes, secrets, or user input. Per `docs/security.md`, decision files and plan text are repo content the workflow itself writes; no untrusted external content is read.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added or removed; `package.json` and `pnpm-lock.yaml` stay as they are.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-11) lists only dev tools behind: `vitest` and `@vitest/coverage-v8` 5.0.5 → 5.1.0, `oxlint` 1.89.0 → 1.91.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5 (held on ^6 by decision `bkit-repo-holds-vite-major`). None blocks the build. Toolchain: Node v24.16.0, pnpm 10.34.7. No stack CLI is involved.
- [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the runbook reads or updates exists in this worktree and was opened while planning; the only missing input is the owner's Narrative and Success Criteria (`Acceptance Scenario`, Q4) and the answers to Q1-Q5.
- [ ] **Project Context:** read `docs/decisions.jsonl` rows `682-summaries-written-by-bkit`, `build-fix-now-pause-writes-no-code-and-has-no-set-aside-path` (latest `SUPERSEDED` by `796-tests-subagent-separate-from-code`), every `891-*` row; `docs/failures.jsonl` row `846-summary-retains-resolved-findings` (the Resolution evidence design); `docs/deferrals.jsonl` rows `891-debug-base-red-label`, `891-ship-base-red-notice`, `891-ci-junit-artifact-settles-red-base-runs`. No `docs/knowledge.jsonl` row covers the summary or the Decision Pause; the ACTIVE rows `kn-7-dist-staleness-pnpm-build-must-run-before-push-for-bk` (rebuild `dist/` with each engine edit), `instructions-store-clause-text-and-local-entries-need-hand-edits` and `renumbering-a-workflow-leaves-instructions-md-local-entries-stale` (`instructions:sync` never rewrites a changed local entry) shape Tasks 1-4.
- [ ] **Testing & Quality:** every behaviour row is Unit, per `docs/testing.md` § Which tier does a behaviour need? and § Tiers: `buildSummary` and `parseDecisionItems` are pure, the workflow text is the deliverable (§ A guard asserts the rule, the exception paragraph), and the `workflows summary` verb test drives the real temp-folder boundary in `workflows.test.ts`. No backing service, network or UI is involved, so no Integration, `@live` or E2E row applies.
- [ ] **Prerequisite Plans:** `docs/plans/202611/891-build-gate-stuck-plan.md` (#891) fully built, verified and merged to `dev` before Groups 2 and 3; Task 2's `readBaseCheck` check stops a build started earlier. Group 1's code has no prerequisite, but `/bkit-build`'s blocker check holds the whole run while #891 is open (Integration Shape).

### Conditional

- [ ] **Secrets & Env Vars:** n/a — no credential is added.
- [ ] **Schema State:** n/a — bkit has no database; `docs/data-schema.md` holds no table.
- [ ] **Architecture & UI:** no new file and no UI; every change edits an existing file in the place `docs/architecture.md` already gives it.
- [ ] **Observability:** n/a — no new log, audit table or trace. The summary's `Resolved Findings` and `Assessment History` sections already record each resolution.
- [ ] **Notifications:** n/a — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

bkit has no database. The plan reads and writes only workflow files: `status.jsonl` rows, `build-decision-{RUN}-{K}.md` decision files and the plan's task blocks.

### Data Schema Usage

None — no database table or field is read or written. The file formats used are:

- **Input (Read):** `step-done` rows' `step`, `verdict`, `failures`, `attempt`, `group`, `scope`, `artifacts` (`.bkit/workflows.md` § status row table); a decision file's header block (`From:`, `Group:`) and items (`Decision:`, new `Fix task:`); the plan's task blocks (`[x]`, `**DONE WHEN:**`, `**TEST FIRST:**`, meta line).
- **Output (Write):** the decision file's new `Fix task: {N}` line under each `Fix now` item (Decision Pause step 6); a challenge task's rewritten `**DONE WHEN:**` / `**TEST FIRST:**` fields and `Derived Test Matrix` rows (Decision Pause step 5).

### Data Schema Changes

None — no database change. The decision file gains one optional line per `Fix now` item, `Fix task: {N}`; a file without it still parses.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A `Fix now` direction on a challenge task reaches the build agents | `.bkit/core/workflows/bkit-build.md` | `grep -n 'Fix now\|build-decision-{RUN}'` over `bkit-build.md`; `grep -rln 'Deviations'` over engine, prompts and workflows; read `context.ts` brief writer (`## The work`, `## Deviations`); read Step 7-10 `Read:` lists | Decision Pause step 5 already shapes a new task block "by the owner's direction" — covers new tasks, missing the challenge task kept "as it is"; the brief's `## Deviations` section carries session run instructions, not per-task decisions | EXTEND | Step 5's challenge branch rewrites the task's `DONE WHEN` and `TEST FIRST` in place, the same way the new-task branch shapes them; the brief then carries it with no `Read:` change. |
| A hard blocker answered `Fix now` with no direction is asked again | `.bkit/core/workflows/bkit-build.md` | `grep -n 'still lacks a decision\|noRecommendation\|hard blocker'` over `bkit-build.md`; `.bkit/core/.bkit/workflows.md` § Decision Pause bullets | Decision Pause step 4 route "**If** any asked item still lacks a decision" → follow-ups — covers unanswered items, missing the direction rule | EXTEND | A hard blocker's `Fix now` without a direction counts as lacking a decision, so the existing follow-up branch asks for it. |
| The decision file links each `Fix now` item to the task that carries its fix | `.bkit/core/engine/commands/workflow/decisions.ts` | language server: references to `parseDecisionItems` (decisions.ts, summary.ts, summary-findings.ts, challenge.ts); `grep -rln 'Fix task\|fixTask'` over `.bkit/core` and `dist` (only challenge merge's unrelated `fixTasks` output) | `parseDecisionItems` / `DecisionItem` — parse each item's `Decision:` line, missing a task link | EXTEND | Add `fixTask: number \| null` to `DecisionItem`, read from a `Fix task: {N}` line; additive, every caller keeps working. |
| Read a decision file's header lines (`From:`, `Group:`) | `.bkit/core/engine/commands/workflow/decisions.ts` | `grep -n 'export\|header'` over `decisions.ts` on HEAD and on `feat/891-build-gate-stuck`; read `openDecision` in `workflows.ts` (#891 branch) | private `lineOf` (reads the whole text, so an item line could match); `openDecision`'s inline header-block slice for `Gate:` (not exported) | EXTEND | Export `decisionHeader(text)` from `decisions.ts`, reading only the lines before the first blank line, as `openDecision` does; `openDecision` is left as it is (Suggested Scope Expansion). |
| Clear a paused group's FAIL rows after its `Fix now` tasks are verified | `.bkit/core/engine/commands/workflow/summary.ts` | language server: references to `taskVerified` (summary.ts `buildSummary`, summary-findings.ts `challengeResolution`); read `buildSummary`, `RESOLVED_BY`, the `answer` lookup and the Decision Pause block | `buildSummary`'s same-group `answer` lookup — covers a re-verified group, missing the moved-fix case; `taskVerified` — exactly the per-task evidence needed | EXTEND | A pre-pass over `build-decision` rows builds a map from paused group to its latest qualifying decision file; the per-group loop resolves that group's `build-plan-tasks`, `build-plan-verify` and `build-plan-gaps-remediate` rows whose last verdict is FAIL and which come before that row; `taskVerified` checks each `Fix now` task. |
| Clear a test-fix FAIL after a later passing test run on the same scope | `.bkit/core/engine/commands/workflow/summary.ts` | `grep -rn 'failure-remediate'` over `summary*.ts` (no hit); read `RESOLVED_BY` and the `answer` lookup; read build Step 14 and debug Step 7 `steps finish` (`--attempt-of=*-run-tests:current`) and the `--scope` flags of build Step 12 and debug Step 3 | `RESOLVED_BY` + the `answer` lookup — covers step-to-step resolution, missing these two entries and a scope match | EXTEND | Add `build/build-failure-remediate` → `build-run-tests` and `debug/debug-failure-remediate` → `debug-run-tests`; for these entries the lookup also requires the later run's `scope` to equal the scope of the run the fix step followed. |
| Document the two new resolution rules and the reshaped `Fix now` | `.bkit/core/.bkit/workflows.md` | `grep -n 'Resolution evidence\|Fix now'` over `.bkit/workflows.md` and `.bkit/core/.bkit/workflows.md` | § Summary / handover step **Resolution evidence** table; § Decision Pause **Fix now**, **Hard blockers**, **Record** and **Fixer reads the answer** bullets | EXTEND | Add two table rows and reword the four bullets; `.bkit/workflows.md` is re-rendered by `bkit upgrade`. |
| Test the new behaviour | `.bkit/core/engine/commands/workflow/summary.test.ts` | `grep -n 'it(\|describe('` over `summary.test.ts`, `decisions.test.ts`, `workflow-shape.test.ts`, `workflows.test.ts`; read `planOf` in `workflows.test.ts` (it puts every task in `GROUP 1`) and the `compose` helper in `decisions.test.ts` (`decisions compose` fixtures) | `summary.test.ts` (`buildSummary` cases, the `input` and `row` helpers), `decisions.test.ts` (`parseDecisionItems` describe, `compose` helper), `workflow-shape.test.ts` (Decision Pause cases, `section` helper), `workflows.test.ts` (`bkit workflows summary` describe with a temp tree, `planOf` helper) | EXTEND | New cases go into the existing describes and reuse their helpers; `planOf` gains a per-task group, so the verb case holds the paused group's tasks and the fix task in different groups; no new test file and no second plan helper. |

## Architecture & Component Changes

Every change edits an existing file; no file is created or deleted. Line numbers move once #891 merges, so each entry names its symbol or section.

**Ledger rows:** `903-fix-now-rewrites-challenge-task-in-place`, `903-hard-blocker-fix-now-needs-a-direction`, `903-fix-task-line-links-decision-to-task`, `903-fix-now-group-fail-resolved-by-verified-fix-tasks`, `903-test-fix-fail-resolved-by-same-scope-passing-run`, `903-debug-soak-fail-resolved-by-later-passing-run`, `903-diagnose-fail-resolved-by-later-passing-run`

### Database Migrations

None — bkit has no database.

### Engine — summary and decisions

The summary learns two resolution rules; the decision parser learns one line and the header block.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`

- **Existence Check:** the file exists; `buildSummary`, `RESOLVED_BY` and the `answer` lookup read on HEAD.
- **Part 4:** add `"build/build-failure-remediate": ["build-run-tests"]` and `"debug/debug-failure-remediate": ["debug-run-tests"]` to `RESOLVED_BY`. For these two keys the `answer` lookup also requires the later run's `scope` to equal the `scope` of the `*-run-tests` row whose `attempt` equals the fix step's `attempt` (both rows are `type: "step-done"` rows of `input.rows`, never the `test-run` rows that share their `step` and `attempt`; a missing row or a missing `scope` on either leaves the FAIL). A CI-sourced debug round (`scope` = `ci:{runId}`) therefore never matches a later local run, which keeps its FAIL. The existing conditions stay: later index, `PASS`, `failures` absent or 0, same task group (both undefined here).
- **Part 2:** before the per-group loop, build `pausedGroups: Map<number, {index, rel, tasks}>` from the run's `build-decision` rows. A row qualifies when its artifact's text (`read`) has `decisionHeader` `From` = `verify` and a numeric `Group`; `parseDecisionItems` gives at least one item; every item has a `decision` (a round-limit file's loop item, Q1 `Verify`, counts with its `Decide` answer, and is neither `Accept` nor `Fix now`); at least one is `Fix now`; and every `Fix now` item has a `fixTask` that names a plan task for which `taskVerified(input, task, index)` is true (a `fixTask` naming a task the plan does not have fails the row). When several rows qualify for one group, the map keeps the latest. In the per-group loop, for `workflow === "build"` and `g.step` in `build-plan-tasks`, `build-plan-verify`, `build-plan-gaps-remediate` whose last verdict is `FAIL`, whose `taskGroupOf(row)` is a key of `pausedGroups` and whose last row's index is below that decision's index → `resolved.set(g.key, "the Decision Pause (`{rel}`), Fix now task(s) {N, …} verified")` and continue. A CONCERNS row of a paused group (a remediation warning, or a CONCERNS verify) is never cleared by this rule. Rows of the same group after the decision are left to the existing rules.
- The accepted-items concern, the bare-decision guard and every other rule stay as they are. `build-plan-verify` has no `RESOLVED_BY` entry and gets none: only the pause rule above clears it.

#### [MODIFY] `.bkit/core/engine/commands/workflow/decisions.ts`

- **Existence Check:** the file exists; `parseDecisionItems`, `DecisionItem` and the private `lineOf` read on HEAD and on `feat/891-build-gate-stuck`.
- Add `fixTask: number | null` to `DecisionItem`: the positive integer on the item's `Fix task:` line, else null (a non-integer value reads null).
- Export `decisionHeader(text: string): Record<string, string>`: each `Key: value` line of the header block, the lines before the first blank line, so an item's own text is never read as a header.
- The file-header comment block names the new `Fix task:` line in the item layout.

### Workflow — Decision Pause

The plan's task block becomes the one carrier of a `Fix now` direction.

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** the file exists; § Decision Pause steps 4-6 and the Contract **Owner decisions** bullet read on HEAD; #891's diff to the same section read on `feat/891-build-gate-stuck`.
- Run `pnpm instructions:show --file bkit-build.md` before editing (`.agents/rules.md` § Shared instructions).
- **Step 4 route:** the branch "**If** any asked item still lacks a decision" also covers a hard blocker answered `Fix now` with no direction: ask the owner for the direction as the follow-up.
- **Step 5, Fix now, challenge task:** replace "keep that task open. It runs as it is." with: rewrite the task's `**DONE WHEN:**` and `**TEST FIRST:**` to the owner's direction in the TEST FIRST form step 5 already gives new tasks; replace the task's `Derived Test Matrix` rows with one per new test; keep its number, title, group and meta line, `**Fixable:** false` included; leave it open. Every challenge-task item reaches this branch with a direction: step 2 makes an item of a challenge task only when its block says `**Fixable:** false` (an overflow item has no task block and gets a new one), so each is a hard blocker, and step 4 asks again for a hard blocker's missing direction. The plan therefore writes no "no direction → runs as it is" branch.
- **Step 5, reuse on resume:** **If** an item already has a `Fix task:` line → reuse the task it names and write no second task block, so a run resumed at step 3 after step 6 does not duplicate the fix task.
- **Step 6:** under each `Fix now` item, whoever answered it, add `Fix task: {N}` naming the task that carries its fix (the challenge task itself, or the new block step 5 wrote).
- **Contract, Owner decisions:** reword the bullet's "only by reading the decision file" sentence, so the two carriers do not contradict each other: a subagent learns the `Accept`, `Try again` and `Stop` answers by reading the decision file named in its `Read`, and a `Fix now` direction through the task block step 5 writes or rewrites. The ban on restating an answer in `Context` stays.
- **Gate — Decision Pause:** add `- [ ] Fix now tasks shaped to the owner's direction, each named on a Fix task line`.
- **`.bkit/instructions.md`:** hand-edit the `#### bkit-build` local entries in the same task for every standing line this rewrites or adds (the **Owner decisions** line, the step 4 route, the step 5 challenge branch, the step 6 `Decision:` lines, the Decision Pause gate items): delete each retired line and add the new wording. `pnpm instructions:sync` only adds lines and never rewrites or drops a local entry whose line changed, so it cannot do this.

### Docs and generated files

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; § Summary / handover step and § Decision Pause bullets read on HEAD.
- **Resolution evidence** table: add a row "Failed group execution, verification or gap remediation after a verify pause answered `Fix now`" → "The pause's decision file answers every item, and each `Fix now` item's `Fix task` is ticked and covered by its own group's later passing verification. Accepted items remain concerns." Add a row "Failed test-fix step (build Step 14, debug Step 7)" → "A later passing test run with 0 failures on the same scope as the run the fix followed", plus the flake wording Q2 settles. The `Fix now` row clears FAIL rows only; remediation warnings stay concerns.
- The existing row "Failed group execution or gap remediation → The latest passing verification of the same group" gains a pointer to the new `Fix now` row, so an agent does not read same-group verification as the only evidence.
- Decision Pause bullets: **Fix now** (a challenge task is rewritten to the owner's direction in place, keeping its meta line; each item gets a `Fix task:` line), **Hard blockers** (`Fix now` needs the owner's direction), **Record** (the item layout gains `Fix task: {N}`), **Fixer reads the answer** (Step 7's agents read the direction from the task block in their brief; Steps 8-10 keep reading the decision file's `Decision:` lines). The bullet's `STANDARD → PIVOT → FINAL` sentence stays as it is (#907 owns it).

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists; § Counter derivation test coverage row for `commands/workflow/summary.test.ts` read.
- Extend the `summary.test.ts` row's scope with "a verify pause's `Fix now` group resolved by its verified fix tasks; a test-fix FAIL resolved by a later same-scope passing run".

#### [MODIFY] generated copies

- `dist/` is rebuilt with `pnpm build` and staged in the same task as each engine edit (Tasks 1, 2 and 3), because `.husky/pre-commit` runs `pnpm bkit:check:dist` whenever a non-test engine `.ts` file is staged (`.agents/rules.md` § Engine builds).
- `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt` is re-rendered by Task 4 (`vitest run .bkit/core/engine/render -u`), its one owner; Task 6's `pnpm bkit:generate` re-runs the same render and must leave the file unchanged.
- `.bkit/instructions.md` is hand-edited by Task 4 (Workflow — Decision Pause above).
- The host mirrors, `.bkit/workflows.md` and `docs/capabilities.md` are regenerated by `pnpm bkit:generate` (build, `cli:sync`, `instructions:sync`, `bkit upgrade`, render snapshots `-u`, graph refresh) in Task 6, never hand-edited.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None — no artifact is replaced. The step 5 sentence "keep that task open. It runs as it is." is rewritten in place (Architecture § Workflow — Decision Pause); no file or symbol is removed.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` (renders `.bkit/workflows.md`) | Two **Resolution evidence** rows (the `Fix now` group, the failed test-fix step) and the **Fix now**, **Hard blockers**, **Record** and **Fixer reads the answer** Decision Pause bullets. |
| `docs/testing.md` | The `commands/workflow/summary.test.ts` row's scope names the two new resolution cases. |
| `.bkit/instructions.md` | Task 4 hand-edits the `#### bkit-build` local entries for every rewritten or added `bkit-build.md` standing line; `pnpm instructions:sync` only adds lines, so it cannot drop or rewrite a changed entry. |
| `docs/decisions.jsonl` | Five plan decisions, keys on the `**Ledger rows:**` line. |
| `docs/deferrals.jsonl` | Two `Out of Scope` deferrals, `903-debug-soak-fail-resolved-by-later-passing-run` and `903-diagnose-fail-resolved-by-later-passing-run`. |
| `docs/knowledge.jsonl` | None — no new gotcha beyond the decisions. |
| `docs/architecture.md` | None — no topology or component change. |
| `docs/technology.md` | None — no framework or convention change. |
| `docs/data-schema.md` | None — no database. |
| `docs/design.md` | None — no UI. |
| `docs/observability.md` | None — no new log or span. |
| `docs/capabilities.md` | Regenerated by `pnpm bkit:generate` (`bkit:graph:refresh`) when graphify is installed; no hand edit. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — bkit has no database. | — |
| **Code** | `git revert {COMMIT}` of the build's commits. | A decision file that already carries `Fix task:` lines still parses after a revert; the old parser ignores the line. |
| **Risk window** | None — nothing is deployed; consumers get the change only through a bkit release and `bkit upgrade`. | — |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: the summary rule that does not wait on #891 (Group 1), then the decision parser and the summary rule built on it (Group 2), then the Decision Pause text (Group 3), then docs and generated copies (Group 4). Groups 2 and 3 start only after #891 is merged to `dev` and synced into this branch (Pre-Flight).

**Integration Shape (advice only):** one PR for all tasks is fine. Group 1's code does not depend on #891, but `/bkit-build`'s blocker check stops the whole run while #891 (the issue's `bkit:blocked-by`) is open, so Group 1 lands early only if the owner builds it by hand; otherwise it lands with the rest.

<!-- bkit:group 1 start -->

### TASK GROUP 1: A test-fix FAIL is cleared by the next passing test run (Part 4)

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

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: A verified Fix now task clears its paused group's FAIL (Part 2)

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

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: The Decision Pause carries the owner's Fix now direction (Part 1)

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Rewrite a `Fix now` challenge task in place, ask again for a hard blocker's direction, and record `Fix task: {N}`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 4 route (a hard blocker answered `Fix now` with no direction still lacks a decision), step 5 **Fix now** challenge branch (rewrite `**DONE WHEN:**`, `**TEST FIRST:**` and the task's `Derived Test Matrix` rows to the owner's direction; keep number, title, group and meta line, `**Fixable:** false` included; no "runs as it is" branch, because every challenge-task item is a hard blocker), step 5 reuse (an item that already has a `Fix task:` line reuses that task and writes no second block), step 6 (`Fix task: {N}` under each `Fix now` item), the Contract **Owner decisions** bullet (reword its "only by reading the decision file" sentence: the decision file for `Accept`, `Try again` and `Stop`, the task block for a `Fix now` direction; the ban on restating answers in `Context` stays), and `### 🔒 Gate — Decision Pause` (`- [ ] Fix now tasks shaped to the owner's direction, each named on a Fix task line`).
  - **UPDATE:** `.bkit/instructions.md`: hand-edit the `#### bkit-build` local entries for every rewritten or added standing line (delete retired lines, add the new wording); `pnpm instructions:sync` cannot drop or rewrite a changed entry.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: four new cases in `describe("build")`, using the `section(build, /Decision Pause/)` helper. Each case asserts the instruction itself (the field names it rewrites, the `Fix task: {N}` line, the reworded contract), not the absence of "runs as it is".
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: re-rendered with `vitest run .bkit/core/engine/render -u`, which `.bkit/core/engine/render/trackers.test.ts` checks. This task is the snapshot's one owner.
  - **READ:** `.bkit/instructions.md`: run `pnpm instructions:show --file bkit-build.md` before editing.
  - **READ:** `.bkit/core/engine/commands/workflow/context.ts`: the `## The work` brief section that carries the rewritten block to Step 7's agents.
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the Decision Pause section holds no "It runs as it is" for a challenge task; step 5's challenge branch names `**DONE WHEN:**`, `**TEST FIRST:**` and the `Derived Test Matrix` rows as rewritten and the meta line as kept; step 5 reuses a task an existing `Fix task:` line names; step 4's route names a hard blocker's `Fix now` with no direction; step 6 names `Fix task: {N}`; the Contract **Owner decisions** bullet names the task block as the carrier of a `Fix now` direction and no longer says a subagent learns the answers "only" from the decision file; `### 🔒 Gate — Decision Pause` holds the `Fix task` line item; the four new cases, the existing `a Fix now edit is checked with plan-check before the loop goes on` case and `.bkit/core/engine/render/trackers.test.ts` pass; `.bkit/core/engine/tools/instructions-coverage.test.ts` (`the repo` → `has no coverage findings`) and `.bkit/core/engine/tools/instructions.test.ts` pass; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a Fix now challenge task is rewritten to the owner's direction in place` fails on step 5's challenge branch naming no `**DONE WHEN:**`, `**TEST FIRST:**` and `Derived Test Matrix` rewrite of the challenge task
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a hard blocker answered Fix now with no direction is asked again` fails on step 4's route having no branch for a hard blocker's missing direction
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `each Fix now item records its Fix task line before the decision row is finished` fails on step 6 writing no `Fix task:` line, or step 5 not reusing the task an existing `Fix task:` line names
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the owner decisions contract names the task block as the Fix now carrier` fails on the Contract **Owner decisions** bullet naming only the decision file, or the Decision Pause gate having no `Fix task` line item

<!-- bkit:task 4 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Docs and generated copies

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Document the two resolution rules and the reshaped Decision Pause
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Summary / handover step **Resolution evidence** table gains the `Fix now` group row (FAIL rows only; remediation warnings stay concerns) and the failed test-fix row (with the Q2 answer on the flake), and the existing "Failed group execution or gap remediation" row points at the new `Fix now` row; § Decision Pause **Fix now**, **Hard blockers**, **Record** and **Fixer reads the answer** bullets match Task 4, with **Fixer reads the answer** naming the task block for Step 7 and the decision file for Steps 8-10, and its `STANDARD → PIVOT → FINAL` sentence left as it is.
  - **UPDATE:** `docs/testing.md`: the `commands/workflow/summary.test.ts` row's scope names the two new resolution cases.
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** both table rows, the pointer on the existing row and the four bullets are in `.bkit/core/.bkit/workflows.md`; the `docs/testing.md` row names both cases; `pnpm prettier --check .bkit/core/.bkit/workflows.md docs/testing.md` passes; `.bkit/core/engine/tools/instructions-coverage.test.ts` still passes.
  - **TEST FIRST:** n/a — docs only, no behaviour change.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Regenerate the built and mirrored copies
  - **READ:** `.bkit/instructions.md`: run the no-flag check `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` first; it must exit 0, because Task 4 already hand-edited the local entries.
  - **UPDATE:** `.bkit/workflows.md`: re-rendered by `pnpm bkit:generate` (its `bkit upgrade`).
  - **READ:** `dist/commands/workflow/summary.js`: with the rest of `dist/`, already rebuilt and staged by Tasks 1, 2 and 3; `pnpm bkit:generate`'s `pnpm build` must leave it unchanged.
  - **READ:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: owned by Task 4; `pnpm bkit:generate`'s render must leave it unchanged.
  - **UPDATE:** `docs/capabilities.md`: refreshed by `pnpm bkit:generate` when graphify is installed.
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `pnpm bkit:generate` exits 0; `pnpm bkit check` passes with no drift; `.bkit/workflows.md` holds Task 5's rows; `dist/commands/workflow/summary.js` contains `build/build-failure-remediate`; `git diff --exit-code dist/ .bkit/core/engine/render/__snapshots__/bkit-build.none.txt` shows no change from the generate run; dogfood replay: after `pnpm build`, a scratch folder holding `feat/864-move-project-docs:docs/plans/202611/logs/864-move-project-docs/status.jsonl` (Step 14 FAIL, then a passing `build-run-tests`) and its plan, run with `node dist/cli.js workflows summary --workflow=build --file={scratch status.jsonl}`, lists `build-failure-remediate` under `Resolved Findings`.
  - **TEST FIRST:** n/a — regenerated copies only, no behaviour change.

<!-- bkit:task 6 end -->

<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row (none: no file is created).
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** n/a — no new log or trace (`docs/observability.md`); resolutions show in the summary's `Resolved Findings`.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate (no doc is added or removed).
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `pnpm bkit check` pass.
- [ ] **Test Synchronization:** no E2E test exists for these surfaces; the existing `summary.test.ts`, `decisions.test.ts`, `workflow-shape.test.ts` and `workflows.test.ts` cases stay green alongside the new ones.
- [ ] **Build Configuration:** `tsconfig.json` `exclude` keeps `**/*.test.ts` out of `dist/`; no test-only file is added.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/summary.test.ts`):** the three Part 4 cases and the nine Part 2 cases; pure rows and decision-file text in the `decisions compose` layout, no temp files.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/decisions.test.ts`):** the `Fix task:` parse and `decisionHeader` cases.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/workflows.test.ts`):** the `bkit workflows summary` case on a temp tree with a real `status.jsonl`, decision file and plan; the tree is removed after the case, as the describe's other cases do.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/workflow-shape.test.ts`):** the four Decision Pause cases.
- [ ] **Unit (`.bkit/core/engine/tools/instructions-coverage.test.ts`, `.bkit/core/engine/tools/instructions.test.ts`):** pass after Task 4's hand-edit of `.bkit/instructions.md`.
- [ ] **Apply local migrations:** n/a — bkit has no database.
- [ ] **Run all tests:** `pnpm vitest run .bkit/core/engine/commands/workflow .bkit/core/engine/audits/workflows .bkit/core/engine/render .bkit/core/engine/tools/instructions-coverage.test.ts .bkit/core/engine/tools/instructions.test.ts`, `pnpm bkit:check:dist` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** After `pnpm build`, copy a past run's `status.jsonl`, decision file and plan where a verify pause answered `Fix now` into a scratch folder, add the `Fix task:` line, and run `node dist/cli.js workflows summary` on it: the paused group's FAIL rows show under `Resolved Findings` and the verdict is CONCERNS.
- [ ] **Step 2:** Run the same command on a scratch copy of `docs/plans/202611/logs/864-move-project-docs/status.jsonl` from `feat/864-move-project-docs` (Step 14 FAIL, then a passing `build-run-tests`; this worktree's copy holds only plan rows) with its plan: `build-failure-remediate FAIL` shows under `Resolved Findings`.
- [ ] **Step 3:** In a session build, answer a `**Fixable:** false` challenge item `Fix now` with a direction, and check that the plan's task block and Step 7's `build-brief-*` file both show the direction.
