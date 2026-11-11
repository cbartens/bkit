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
- **IF** an item is unanswered, the `Fix now` task is unticked or never verified after the pause, or the item has no `Fix task:` line **→ THEN** the paused group's FAIL rows stay and the verdict is FAIL.
- **IF** the owner answers `Fix now` on a `**Fixable:** false` challenge task and names a direction **→ THEN** the pause rewrites that task's `DONE WHEN` and `TEST FIRST` to the direction in place, keeps its meta line, and Step 7 builds the direction.
- **IF** a hard blocker is answered `Fix now` with no direction **→ THEN** the item stays undecided and the owner is asked for the direction before anything is built.
- **IF** a test-fix step (build Step 14 or debug Step 7) ends FAIL and a later test run passes with 0 failures on the same scope **→ THEN** the summary lists the test-fix FAIL under `Resolved Findings`; with no such later run it stays a failure.

### Concrete Example

**Setup:** The owner runs `/bkit-build` in a session. The plan has 9 task groups. Group 9's verify fails at its round limit with two gaps, so the Decision Pause asks `Question: VERIFY_GAPS`, `From: verify`, `Group: 9`.

**Steps:**

1. Owner answers Q1 `Accept` and Q2 `Fix now` → System writes the `Decision:` lines, writes task 42 in a new group 10, adds `Fix task: 42` under Q2, runs `tests plan-check`, and routes to Step 7.
2. Step 7 writes task 42's tests, records them red, and writes the fix → Step 8 verifies group 10 `PASS` with `Tasks: 42` and ticks task 42.
3. Step 12 runs the final gate → `PASS`, 0 failures.
4. Step 15 runs `workflows summary` → `build-plan-tasks (group 9) FAIL` and `build-plan-verify (group 9) FAIL` appear under `Resolved Findings` as resolved by the Decision Pause, and `1 item(s) accepted at the Decision Pause` stays under the reasons.

**Outcome:** The summary prints `Verdict: CONCERNS`, and the run goes on to Step 16 and opens its PR instead of taking the Failure Path.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A `**Fixable:** false` challenge task is answered `Fix now` with a direction | Its `**DONE WHEN:**` and `**TEST FIRST:**` fields are rewritten to the direction; its number, title, group and `**Severity:** … · **Location:** … · **Round:**` meta line stay; its `Derived Test Matrix` rows are replaced by one per new test; `tests plan-check` passes. |
| A hard blocker (challenge or verify) is answered `Fix now` with no direction | The item counts as lacking a decision; the owner is asked for the direction as a follow-up; no task block is written or rewritten until it is given. |
| A hard blocker is left on a headless run | Unchanged: the run takes the Failure Path naming the hard blocker. |
| A verify pause holds `Accept` and `Fix now` items, and every `Fix now` task is ticked and verified `PASS` in its own group after the pause | The paused group's `build-plan-tasks`, `build-plan-verify` and `build-plan-gaps-remediate` FAIL rows are resolved; the accepted items stay a concern; the verdict is CONCERNS (or PASS with no other concern). |
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

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| A build test-fix FAIL is resolved by a later passing `build-run-tests` on the same scope, and stays without one, with another scope or with a later FAIL | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| A debug test-fix FAIL is resolved by a later passing `debug-run-tests` on the same scope | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 1 |
| `parseDecisionItems` reads the task number on a `Fix now` item's `Fix task:` line, and null without one | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| `decisionHeader` reads `From:` and `Group:` from the header block only, never from an item's text | Unit | `.bkit/core/engine/commands/workflow/decisions.test.ts` | 2 |
| A group's FAIL rows are resolved when its verify pause sent each `Fix now` item to a verified task, and the accepted items stay a concern | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A verify pause clears its group's FAIL only when every item is answered | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A `Fix now` item clears its group's FAIL only through a ticked task its own group verified after the pause | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| A verify pause clears only the group its `Group:` header names | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| The Decision Pause rewrites a challenge task answered `Fix now` to the owner's direction in place | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| A hard blocker answered `Fix now` with no direction is asked again before anything is built | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| Each `Fix now` item records the task that carries its fix as `Fix task: {N}` before the decision row is finished | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
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
| Summary verdict of a run whose only FAIL rows are a `Fix now` group's or a test-fix step's | Summary behaviour | No | Moves from FAIL to CONCERNS or PASS only on the evidence above; nothing that was PASS or CONCERNS becomes FAIL. |

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
- **Assumption:** #891 merges to `dev` before Groups 2 and 3 are built, and Step 3 (Branch Sync) brings it into this branch → if wrong, Task 2 (`decisions.ts`) and Task 4 (`bkit-build.md`) edit text #891 also changes, and the sync conflicts. Group 1 touches only `summary.ts` and `summary.test.ts`, which #891 does not change.
- **Assumption:** A `*-run-tests` `PASS` row with no `failures` field (the gate wrote no JUnit report) counts as 0 failures, as the existing `answer` lookup treats it → if wrong, a consumer with no JUnit reporters keeps the test-fix FAIL; it never clears a FAIL wrongly, because `steps finish` refuses a `PASS` with failures.
- **Assumption:** Two test runs ran "the same scope" when their rows' `scope` strings are equal (`--scope="{TEST_SCOPE}"` in build Step 12 and debug Step 3) → if wrong (a workflow wrote two names for one gate), the test-fix FAIL stays, which is the safe side.
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
| Part 4: let any later `*-run-tests` PASS clear the test-fix FAIL, whatever its scope | A narrower re-run (one file, or the unit tier only) would clear a FAIL the full gate never confirmed. The issue asks for the same scope. |

**Recommendations for a later phase:** decide whether the Part 4 rule applies to `debug-failure-soak` (Out of Scope row), and decide the headless `Stop` route with #913.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The Part 4 rule for `debug-failure-soak`: debug Step 8 can finish FAIL and routes to Step 3, so a debug run can reach its summary with a soak FAIL that `RESOLVED_BY` has no entry for | Part 4 names only `build-failure-remediate` and `debug-failure-remediate`; no matrix row, edge case or decision needs the soak step. A soak iteration hunts an intermittent failure, so whether one later pass proves it gone is an owner decision, not a mechanical copy of Part 4. | Deferral `903-debug-soak-fail-resolved-by-later-passing-run` (`needs-decision`, options A-C in its `description`). |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The headless `Stop` route: a headless pause that takes `Stop` re-runs the red gate by `From:` until its loop limit sends it to the Failure Path | #891's plan `docs/plans/202611/891-build-gate-stuck-plan.md` § Suggested Scope Expansion; Open Question Q1 B | Decision Pause step 6 routing; Task 4 | Needs a design decision; decide it with #913. |
| #913 — Owner Stop writes the full handover in debug, build and ship (OPEN) | #913 | Decision Pause step 6 and step 8 handover in `bkit-build.md`; Task 4 | Keep separate; build it after this plan so Task 4's step 5-6 text is settled. |
| #902 — Show every choice made without asking in each workflow's summary (OPEN) | #902 | `buildSummary` in `summary.ts`; Tasks 1 and 3 | Keep separate; it adds summary lines, this plan changes resolution rules. |
| #895 — One question format for every owner question in the workflows (OPEN) | #895 | The decision-file item layout this plan extends with `Fix task:`; `parseDecisionItems` (Task 2) | Keep separate; its format must keep the `Fix task:` line. |
| #904 — Question advisor: a fresh top-tier agent behind every owner question (OPEN) | #904 | The Decision Pause asks (steps 3-4); Task 4 | Keep separate. |
| `openDecision` in `workflows.ts` slices the decision file's header block inline instead of calling the new `decisionHeader` | This plan's investigation (`feat/891-build-gate-stuck`) | `decisions.ts` `decisionHeader` (Task 2) | Fold in only after #891 merges and only on owner decision; a one-call refactor with no behaviour change. |
| A Decision Pause composed before a step renumber posts its old step number | `docs/deferrals.jsonl` `705-build-plan-convert-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-279` | Decision file header lines (`Pause step`) that `decisionHeader` reads | Keep deferred; unrelated to the owner's answer. |
| `/bkit-debug` base-red label, `/bkit-ship` base-red notice, CI JUnit artifact for red base runs | `docs/deferrals.jsonl` `891-debug-base-red-label`, `891-ship-base-red-notice`, `891-ci-junit-artifact-settles-red-base-runs` | Part 3 (what #891 leaves undone) | Keep deferred: each was declared out of scope by #891's owner rescope and is not an ignored owner answer. |

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
- [ ] **User Context:** every file the runbook reads or updates exists in this worktree and was opened while planning; the only missing input is the owner's Narrative and Success Criteria (`Acceptance Scenario`) and the answers to Q1-Q3.
- [ ] **Project Context:** read `docs/decisions.jsonl` rows `682-summaries-written-by-bkit`, `build-fix-now-pause-writes-no-code-and-has-no-set-aside-path` (latest `SUPERSEDED` by `796-tests-subagent-separate-from-code`), every `891-*` row; `docs/failures.jsonl` row `846-summary-retains-resolved-findings` (the Resolution evidence design); `docs/deferrals.jsonl` rows `891-debug-base-red-label`, `891-ship-base-red-notice`, `891-ci-junit-artifact-settles-red-base-runs`. No `docs/knowledge.jsonl` row covers the summary or the Decision Pause.
- [ ] **Testing & Quality:** every behaviour row is Unit, per `docs/testing.md` § Which tier does a behaviour need? and § Tiers: `buildSummary` and `parseDecisionItems` are pure, the workflow text is the deliverable (§ A guard asserts the rule, the exception paragraph), and the `workflows summary` verb test drives the real temp-folder boundary in `workflows.test.ts`. No backing service, network or UI is involved, so no Integration, `@live` or E2E row applies.
- [ ] **Prerequisite Plans:** `docs/plans/202611/891-build-gate-stuck-plan.md` (#891) fully built, verified and merged to `dev` before Groups 2 and 3. Group 1 has no prerequisite.

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
| Clear a paused group's FAIL rows after its `Fix now` tasks are verified | `.bkit/core/engine/commands/workflow/summary.ts` | language server: references to `taskVerified` (summary.ts `buildSummary`, summary-findings.ts `challengeResolution`); read `buildSummary`, `RESOLVED_BY`, the `answer` lookup and the Decision Pause block | `buildSummary`'s same-group `answer` lookup — covers a re-verified group, missing the moved-fix case; `taskVerified` — exactly the per-task evidence needed | EXTEND | A pre-pass over `build-decision` rows builds a map from paused group to its resolving decision file; the per-group loop resolves `build-plan-tasks`, `build-plan-verify` and `build-plan-gaps-remediate` rows of that group before that row; `taskVerified` checks each `Fix now` task. |
| Clear a test-fix FAIL after a later passing test run on the same scope | `.bkit/core/engine/commands/workflow/summary.ts` | `grep -rn 'failure-remediate'` over `summary*.ts` (no hit); read `RESOLVED_BY` and the `answer` lookup; read build Step 14 and debug Step 7 `steps finish` (`--attempt-of=*-run-tests:current`) and the `--scope` flags of build Step 12 and debug Step 3 | `RESOLVED_BY` + the `answer` lookup — covers step-to-step resolution, missing these two entries and a scope match | EXTEND | Add `build/build-failure-remediate` → `build-run-tests` and `debug/debug-failure-remediate` → `debug-run-tests`; for these entries the lookup also requires the later run's `scope` to equal the scope of the run the fix step followed. |
| Document the two new resolution rules and the reshaped `Fix now` | `.bkit/core/.bkit/workflows.md` | `grep -n 'Resolution evidence\|Fix now'` over `.bkit/workflows.md` and `.bkit/core/.bkit/workflows.md` | § Summary / handover step **Resolution evidence** table; § Decision Pause **Fix now**, **Hard blockers**, **Record** and **Fixer reads the answer** bullets | EXTEND | Add two table rows and reword the four bullets; `.bkit/workflows.md` is re-rendered by `bkit upgrade`. |
| Test the new behaviour | `.bkit/core/engine/commands/workflow/summary.test.ts` | `grep -n 'it(\|describe('` over `summary.test.ts`, `decisions.test.ts`, `workflow-shape.test.ts`, `workflows.test.ts` | `summary.test.ts` (`buildSummary` cases, the `input` and `row` helpers), `decisions.test.ts` (`parseDecisionItems` describe), `workflow-shape.test.ts` (Decision Pause cases, `section` helper), `workflows.test.ts` (`bkit workflows summary` describe with a temp tree) | EXTEND | New cases go into the existing describes and reuse their helpers; no new test file. |

## Architecture & Component Changes

Every change edits an existing file; no file is created or deleted. Line numbers move once #891 merges, so each entry names its symbol or section.

**Ledger rows:** `903-fix-now-rewrites-challenge-task-in-place`, `903-hard-blocker-fix-now-needs-a-direction`, `903-fix-task-line-links-decision-to-task`, `903-fix-now-group-fail-resolved-by-verified-fix-tasks`, `903-test-fix-fail-resolved-by-same-scope-passing-run`, `903-debug-soak-fail-resolved-by-later-passing-run`

### Database Migrations

None — bkit has no database.

### Engine — summary and decisions

The summary learns two resolution rules; the decision parser learns one line and the header block.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`

- **Existence Check:** the file exists; `buildSummary`, `RESOLVED_BY` and the `answer` lookup read on HEAD.
- **Part 4:** add `"build/build-failure-remediate": ["build-run-tests"]` and `"debug/debug-failure-remediate": ["debug-run-tests"]` to `RESOLVED_BY`. For these two keys the `answer` lookup also requires the later run's `scope` to equal the `scope` of the `*-run-tests` row whose `attempt` equals the fix step's `attempt` (both rows are found in `input.rows`; a missing row or a missing `scope` on either leaves the FAIL). The existing conditions stay: later index, `PASS`, `failures` absent or 0, same task group (both undefined here).
- **Part 2:** before the per-group loop, build `pausedGroups: Map<number, {index, rel, tasks}>` from the run's `build-decision` rows. A row qualifies when its artifact's text (`read`) has `decisionHeader` `From` = `verify` and a numeric `Group`; `parseDecisionItems` gives at least one item; every item has a `decision`; at least one is `Fix now`; and every `Fix now` item has a `fixTask` that names a plan task for which `taskVerified(input, task, index)` is true. In the per-group loop, for `workflow === "build"` and `g.step` in `build-plan-tasks`, `build-plan-verify`, `build-plan-gaps-remediate` whose `taskGroupOf(row)` is a key of `pausedGroups` and whose last row's index is below that decision's index → `resolved.set(g.key, "the Decision Pause (`{rel}`), Fix now task(s) {N, …} verified")` and continue. Rows of the same group after the decision are left to the existing rules.
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
- **Step 5, Fix now, challenge task:** replace "keep that task open. It runs as it is." with: rewrite the task's `**DONE WHEN:**` and `**TEST FIRST:**` to the owner's direction in the TEST FIRST form step 5 already gives new tasks; replace the task's `Derived Test Matrix` rows with one per new test; keep its number, title, group and meta line; leave it open. **If** the owner gave no direction on a fixable item → the task runs as it is.
- **Step 6:** under each `Fix now` item, whoever answered it, add `Fix task: {N}` naming the task that carries its fix (the challenge task itself, or the new block step 5 wrote).
- **Contract, Owner decisions:** add that a `Fix now` direction reaches the build agents through the task block step 5 writes or rewrites, which is not a restatement in `Context`.
- **Gate — Decision Pause:** add `- [ ] Fix now tasks shaped to the owner's direction, each named on a Fix task line`.

### Docs and generated files

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; § Summary / handover step and § Decision Pause bullets read on HEAD.
- **Resolution evidence** table: add a row "Failed group execution, verification or gap remediation after a verify pause answered `Fix now`" → "The pause's decision file answers every item, and each `Fix now` item's `Fix task` is ticked and covered by its own group's later passing verification. Accepted items remain concerns." Add a row "Failed test-fix step (build Step 14, debug Step 7)" → "A later passing test run with 0 failures on the same scope as the run the fix followed", plus the flake wording Q2 settles.
- Decision Pause bullets: **Fix now** (a challenge task is rewritten to the owner's direction in place, keeping its meta line; each item gets a `Fix task:` line), **Hard blockers** (`Fix now` needs the owner's direction), **Record** (the item layout gains `Fix task: {N}`), **Fixer reads the answer** (Step 7's agents read the direction from the task block in their brief).

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists; § Counter derivation test coverage row for `commands/workflow/summary.test.ts` read.
- Extend the `summary.test.ts` row's scope with "a verify pause's `Fix now` group resolved by its verified fix tasks; a test-fix FAIL resolved by a later same-scope passing run".

#### [MODIFY] generated copies

- `dist/`, the host mirrors, `.bkit/workflows.md`, `.bkit/instructions.md`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt` and `docs/capabilities.md` are regenerated by `pnpm bkit:generate` (build, `cli:sync`, `instructions:sync`, `bkit upgrade`, render snapshots `-u`, graph refresh), never hand-edited.

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
| `.bkit/instructions.md` | Regenerated local-instruction lines for the edited `bkit-build.md` sentences (`pnpm bkit:generate` runs `instructions:sync`). |
| `docs/decisions.jsonl` | Five plan decisions, keys on the `**Ledger rows:**` line. |
| `docs/deferrals.jsonl` | One `Out of Scope` deferral, `903-debug-soak-fail-resolved-by-later-passing-run`. |
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

**Integration Shape (advice only):** one PR for all tasks is fine. Group 1 can also land on its own before #891 merges, because it touches only `summary.ts` and `summary.test.ts`.

<!-- bkit:group 1 start -->

### TASK GROUP 1: A test-fix FAIL is cleared by the next passing test run (Part 4)

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Resolve a failed test-fix step by a later passing test run on the same scope
  - **UPDATE:** `RESOLVED_BY` in `.bkit/core/engine/commands/workflow/summary.ts`: add `build/build-failure-remediate` → `build-run-tests` and `debug/debug-failure-remediate` → `debug-run-tests`.
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: for these two entries the `answer` lookup also requires the later run's `scope` to equal the `scope` of the `*-run-tests` row whose `attempt` equals the fix step's `attempt`; a missing row or `scope` leaves the FAIL.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.test.ts`: two new cases in `describe("buildSummary")`, built with the existing `input` helper.
  - **READ:** `.bkit/core/workflows/bkit-build.md`: Step 12 `--scope` and Step 14 `--attempt-of=build-run-tests:current`.
  - **READ:** `.bkit/core/workflows/bkit-debug.md`: Step 3 `--scope` and Step 7 `--attempt-of=debug-run-tests:current`.
  - **DONE WHEN:** both new cases pass; with rows `build-run-tests` attempt 1 FAIL, `build-failure-remediate` FAIL, `build-run-tests` attempt 2 PASS with 0 failures on the same scope, `s.reasons` holds no `build-failure-remediate FAIL` and `Resolved Findings` names `build-run-tests`; another scope, no later run, or a later FAIL keeps it in `s.reasons`; every existing case in `summary.test.ts` still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a test-fix FAIL resolved by a later passing test run on the same scope is historical` fails on "build-failure-remediate FAIL" staying in the reasons after the same-scope passing run
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug fix FAIL resolved by a later passing debug test run is historical` fails on "debug-failure-remediate FAIL" staying in the reasons after the same-scope passing run

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
  - **READ:** `lineOf` in `.bkit/core/engine/commands/workflow/decisions.ts`: the whole-text line reader `decisionHeader` must not reuse.
  - **DONE WHEN:** `parseDecisionItems` returns `fixTask: 42` for a `Fix now` item with `Fix task: 42`, and null with no line or a non-integer value; `decisionHeader` returns `From` and `Group` from the header and ignores a `Group: 3` line inside an item; both new cases and every existing `decisions.test.ts` case pass; `pnpm bkit:gate:static` passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `reads the task a Fix now item names on its Fix task line` fails on `fixTask` being undefined instead of 42
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `decisionHeader reads the header block only` fails on `decisionHeader` not being exported from `decisions.ts`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Resolve a verify pause's group FAIL rows once each `Fix now` task is verified
  - **UPDATE:** `buildSummary` in `.bkit/core/engine/commands/workflow/summary.ts`: build `pausedGroups` from the run's `build-decision` rows (header `From: verify` and a numeric `Group`, every item decided, at least one `Fix now`, every `Fix now` item's `fixTask` passing `taskVerified` after the decision row); resolve that group's `build-plan-tasks`, `build-plan-verify` and `build-plan-gaps-remediate` rows that come before the decision row, naming the decision file and the task numbers.
  - **READ:** `taskVerified` in `.bkit/core/engine/commands/workflow/summary-findings.ts`: the per-task evidence.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.test.ts`: four new cases in `describe("buildSummary")`.
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: one new case in `describe("bkit workflows summary")`, built with its `tree`, `done`, `task` and `planOf` helpers.
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** with a `From: verify`, `Group: 9` decision file (Q1 `Accept`, Q2 `Fix now`, `Fix task: 42`) and task 42 ticked and verified `PASS` in group 10 after the pause, `s.reasons` holds no group 9 FAIL row, `Resolved Findings` names the decision file, the accepted-items concern stays and the verdict is CONCERNS; an unanswered item, a missing `Fix task:` line, an unticked or unverified task, or another group named in `Group:` keeps the FAIL; the existing cases (`a group's failed execution stays unresolved when verification still has concerns`, `a build's last unanswered verify FAIL fails it`, the bare-decision guard) still pass; `bkit workflows summary` on the temp tree prints CONCERNS.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause's Fix now group is resolved once each fix task is verified` fails on "build-plan-verify (group 9) FAIL" staying in the reasons after task 42 was verified
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause clears its group's FAIL only when every item is answered` fails on the group's FAIL rows staying when every item is answered
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause` fails on the group's FAIL rows staying when the fix task is ticked and verified after the pause
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a verify pause clears only the group its Group header names` fails on the named group's FAIL rows staying
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved` fails on the verb printing a FAIL verdict for the temp tree

<!-- bkit:task 3 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: The Decision Pause carries the owner's Fix now direction (Part 1)

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Rewrite a `Fix now` challenge task in place, ask again for a hard blocker's direction, and record `Fix task: {N}`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: § Decision Pause step 4 route (a hard blocker answered `Fix now` with no direction still lacks a decision), step 5 **Fix now** challenge branch (rewrite `**DONE WHEN:**`, `**TEST FIRST:**` and the task's `Derived Test Matrix` rows to the owner's direction; keep number, title, group and meta line; with no direction on a fixable item it runs as it is), step 6 (`Fix task: {N}` under each `Fix now` item), the Contract **Owner decisions** bullet, and `### 🔒 Gate — Decision Pause`.
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: three new cases in `describe("build")`, using the `section(build, /Decision Pause/)` helper.
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: re-rendered with `vitest run .bkit/core/engine/render -u`, which `.bkit/core/engine/render/trackers.test.ts` checks.
  - **READ:** `.bkit/instructions.md`: run `pnpm instructions:show --file bkit-build.md` before editing.
  - **READ:** `.bkit/core/engine/commands/workflow/context.ts`: the `## The work` brief section that carries the rewritten block to Step 7's agents.
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the Decision Pause section holds no "It runs as it is" for a challenge task with a direction; step 4's route names a hard blocker's `Fix now` with no direction; step 6 names `Fix task: {N}`; the three new cases, the existing `a Fix now edit is checked with plan-check before the loop goes on` case and `.bkit/core/engine/render/trackers.test.ts` pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a Fix now challenge task is rewritten to the owner's direction in place` fails on step 5 still saying "It runs as it is" for a challenge task
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a hard blocker answered Fix now with no direction is asked again` fails on step 4's route having no branch for a hard blocker's missing direction
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `each Fix now item records its Fix task line before the decision row is finished` fails on step 6 writing no `Fix task:` line

<!-- bkit:task 4 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Docs and generated copies

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Document the two resolution rules and the reshaped Decision Pause
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Summary / handover step **Resolution evidence** table gains the `Fix now` group row and the failed test-fix row (with the Q2 answer on the flake); § Decision Pause **Fix now**, **Hard blockers**, **Record** and **Fixer reads the answer** bullets match Task 4.
  - **UPDATE:** `docs/testing.md`: the `commands/workflow/summary.test.ts` row's scope names the two new resolution cases.
  - **DEPENDS ON:** 3, 4
  - **DONE WHEN:** both table rows and the four bullets are in `.bkit/core/.bkit/workflows.md`; the `docs/testing.md` row names both cases; `pnpm prettier --check .bkit/core/.bkit/workflows.md docs/testing.md` passes.
  - **TEST FIRST:** n/a — docs only, no behaviour change.

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Regenerate the built and mirrored copies
  - **UPDATE:** `.bkit/instructions.md`: run the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts` first, then `pnpm bkit:generate` (its `instructions:sync`).
  - **UPDATE:** `.bkit/workflows.md`: re-rendered by `pnpm bkit:generate` (its `bkit upgrade`).
  - **UPDATE:** `dist/commands/workflow/summary.js`: rebuilt by `pnpm bkit:generate` (its `pnpm build`), with the rest of `dist/`.
  - **UPDATE:** `docs/capabilities.md`: refreshed by `pnpm bkit:generate` when graphify is installed.
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `pnpm bkit:generate` exits 0; `pnpm bkit check` passes with no drift; `.bkit/workflows.md` holds Task 5's rows; `dist/commands/workflow/summary.js` contains `build/build-failure-remediate`.
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
- [ ] **Unit (`.bkit/core/engine/commands/workflow/summary.test.ts`):** the two Part 4 cases and the four Part 2 cases; pure rows, no temp files.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/decisions.test.ts`):** the `Fix task:` parse and `decisionHeader` cases.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/workflows.test.ts`):** the `bkit workflows summary` case on a temp tree with a real `status.jsonl`, decision file and plan; the tree is removed after the case, as the describe's other cases do.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/workflow-shape.test.ts`):** the three Decision Pause cases.
- [ ] **Apply local migrations:** n/a — bkit has no database.
- [ ] **Run all tests:** `pnpm vitest run .bkit/core/engine/commands/workflow .bkit/core/engine/audits/workflows .bkit/core/engine/render` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** After `pnpm build`, copy a past run's `status.jsonl`, decision file and plan where a verify pause answered `Fix now` into a scratch folder, add the `Fix task:` line, and run `node dist/cli.js workflows summary` on it: the paused group's FAIL rows show under `Resolved Findings` and the verdict is CONCERNS.
- [ ] **Step 2:** Run the same command on a scratch copy of `docs/plans/202611/logs/864-move-project-docs/status.jsonl` (Step 14 FAIL, then a passing `build-run-tests`) with its plan: `build-failure-remediate FAIL` shows under `Resolved Findings`.
- [ ] **Step 3:** In a session build, answer a `**Fixable:** false` challenge item `Fix now` with a direction, and check that the plan's task block and Step 7's `build-brief-*` file both show the direction.
