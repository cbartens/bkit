# Skip pointless re-runs after an answer Implementation Plan

## Context & Goals

After an owner's answer or an automatic answer (`ask: false`, headless), a check or test runs again only when the answer changes code (`Fix now`), asks for another round (`Try again`), or a red gate is still unsettled. Build breaks this today: an all-Accept `From: holistic` or `From: verify` pause re-runs Step 10 or Step 8 and returns the result the answers already fixed. This plan adds a `continue` route for those pauses, a `tasks tick --decision` flag, resume and summary support, and the rule in the workflow docs with an audit guard. Debug and ship already comply.

**Related Issues:**

- #957 — Workflows skip re-runs after an answer (this issue)
- #951 — Build: repeat whole-feature checks re-check everything, costing hours (blocks this issue; same Decision Pause lines)
- #814 — Local test limits only catch hangs (the case seen)

---

## 👤 ⚠️ Acceptance Scenario

### Narrative

When an owner accepts every gap in a build's verify or holistic pause, the build goes on to the next step instead of running the same check again.

### Success Criteria

- An all-Accept `From: holistic` pause goes to Step 11 with no new `build-plan-verify-holistic` row.
- An all-Accept `From: verify` pause with no `Gate: FAIL` ticks the accepted gaps' tasks and goes to Step 7 with no new `build-plan-verify` or `build-group-gate` row for that group.
- Any `Fix now` or `Try again` answer, or a `Gate: FAIL` pause, routes as today.
- A run stopped after a `continue` decision resumes at Build Challenge (holistic) or Plan Execute (verify).
- The Step 15 summary lists the skipped round's `FAIL` under Resolved Findings as settled by that Decision Pause, and the run's verdict is no worse than a passing re-run would give.

### Process Sketch

- **WHEN** every item of a holistic pause is `Accept` **→ THEN** `DECISION_ROUTE` = `continue` and the build goes to Step 11.
- **WHEN** every item of a verify pause is `Accept` and the file has no `Gate: FAIL` **→ THEN** the accepted tasks are ticked and the build goes to Step 7.
- **IF** any item is `Fix now`, the loop question is `Try again`, or `Gate: FAIL` is set **→ THEN** the route is as today.

### Concrete Example

**Setup:** Step 10 attempt 1 failed only on two flaky cleanup failures in files the feature does not touch.

**Steps:**

1. Owner answers `A, A` (Accept, Accept) → the workflow records `route=continue`.
2. The build starts Step 11, with no second full check and test run.

**Outcome:** No new `build-plan-verify-holistic` row; the summary lists the FAIL as resolved by the Decision Pause.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Holistic pause, every item Accept | `continue` → Step 11, no new holistic round |
| Verify pause, every item Accept, no `Gate: FAIL` | Accepted gaps' tasks ticked, `continue` → Step 7 (next open group, or Step 10) |
| Verify pause, every item Accept, `Gate: FAIL` | `verify` → re-run Step 8 as today: the red gate is not an item and stays unsettled |
| Any item `Fix now` | `fix` → Step 7 as today |
| Loop question `Try again` | `retry` as today |
| Headless or `ask: false`, every recommendation Accept | Each becomes `Accept (assumed)`, `continue`; summary stays CONCERNS and ship asks the owner to confirm, as today |
| Headless, a recommendation is `Fix now` | `fix` as today |
| Limit used up, owner accepts every item | `counters grant` writes its row; no round runs now, and the allowance serves later rounds in the same run |
| Run stops after the `continue` decision row | Resume at `build-challenge` (holistic) or `build-plan-tasks` (verify) |
| Holistic round after challenge fix groups | The verifier still reads the decision file, so the accepted gaps stay no gap |
| Challenge pause, every item Accept | `tests` → Step 12's first run, unchanged |
| Tests pause | Options stay `Try again` / `Stop`, unchanged |
| Debug Loop Question, ship Merge Question, ship Confirm Assumed Items | Unchanged |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| tick --decision ticks the tasks of accepted verify-gap items | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |
| tick --decision leaves a Fix now item's task open | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 1 |
| a continue decision after a holistic round resumes at Build Challenge | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 2 |
| a continue decision after a group verify resumes at Plan Execute | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 2 |
| an all-Accept holistic pause settles the holistic FAIL before it | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| a holistic pause with a Fix now item settles nothing | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 3 |
| an Accept-only verify or holistic pause routes continue before the verify and holistic re-runs | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| continue sends holistic to Step 11 and verify to the decision tick then Step 7 | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| a Gate FAIL pause never routes continue | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| debug and ship questions offer no answer that re-runs a check without a change | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| an all-Accept holistic pause with a Decide loop question settles the holistic FAIL | Unit | `.bkit/core/engine/commands/workflow/summary.test.ts` | 6 |
| continue is never set after a fix round that changed source files | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 7 |
| the continue decision tick runs before the build-decision row is recorded | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 8 |
| tick --decision ticks a task whose item title reads TASK {N} | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 9 |
| the continue decision tick routes a non-zero exit to the Failure Path | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 9 |
| a verify or holistic decision file records Source changed and a resume holds it | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 10 |
| openDecision carries the Source changed header | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 10 |
| the continue rule reads the source change from the decision file header | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 11 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

- New `route` value `continue` on `build-decision` rows. Older rows keep their values, and `status resume` reads both. No migration.
- New flag `bkit tasks tick --decision=<file>`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

- **Assumption:** A `Gate: FAIL` verify pause keeps re-running Step 8 even when every item is accepted → no item covers a red group gate, so skipping would change how red gates are handled.
- **Assumption:** Ticking an accepted gap's task is correct → it matches what the re-run verifier does today (an accepted gap is no gap); if wrong, the build re-enters the same group.
- **Assumption:** `counters grant` still runs on `continue` → it writes a row only when the limit is used up, and the allowance serves later holistic fix rounds in the same run (#951 counts `build.holistic` within the run).
- **Assumption:** A `continue` leaves the holistic test base where it was → the next holistic check after challenge fix groups tests from the older clean commit (wider, same result). Recording the skip as a clean check would claim a check that never ran.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

Skipping the re-run for a `Gate: FAIL` verify pause was considered and left out (see Assumptions).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| What tests a repeat holistic check, the group gate or the debug soak runs | Test selection does not change the skip | #951 |
| How a red group gate is re-run on resume (`decisions apply --by=rerun`) | Unchanged by the skip | Keep as is |
| The flaky `ENOTEMPTY` cleanup race in `branches-lock.integration.test.ts` and `tests-lock.integration.test.ts` | A separate test bug | Follow-up issue |

## Suggested Scope Expansion

None.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no new packages.
- [ ] **Dependency Versions:** not applicable, no dependency change.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** access confirmed.
- [ ] **Project Context:** `docs/decisions.jsonl` read.
- [ ] **Project Documents:** assessed in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** #951 (same Decision Pause lines).

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row.
- [ ] **Reuse reasons:** no `NEW` rows.
- [ ] **Gate 1 — Verified:** every item above is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| index | `.agents/docs.md` | yes | `.agents/docs.md` Document Index | covered | None |
| workflows | `.bkit/workflows.md` | yes | `.bkit/core/.bkit/workflows.md` § Cross-step invariants, § Decision Pause, § `status.jsonl` | covered | Updated in task 5 |
| architecture | `docs/architecture.md` | no — engine commands and workflow prose only, no topology change | none | none | None |
| technology | `docs/technology.md` | no — no new framework or library | none | none | None |
| security | `docs/security.md` | no — no credentials, routes or input | none | none | None |
| testing | `docs/testing.md` | yes | `.agents/rules.md` § Naming Conventions (Vitest `*.test.ts`) | partial | Tests follow the existing unit files |

## Documentation Warnings

None

## Data Schema Integration

None — no database use.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Tick tasks named by a decision file | `.bkit/core/engine/commands/workflow/tasks.ts` | `grep -n tick`, references to `parseDecisionItems` | `tasks tick` with `--tasks` / `--green` — covers ticking, missing the decision-file source | EXTEND | Add `--decision` beside `--tasks` |
| Resume after a continue decision | `.bkit/core/engine/commands/workflow/step-table.ts` | `grep -n DECISION_ROUTES` | `DECISION_ROUTES` — covers `fix` / `verify` / `tests`, missing `continue` | EXTEND | Add the `continue` key |
| Settle holistic FAIL by an all-Accept pause | `.bkit/core/engine/commands/workflow/summary.ts` | `grep -n "Decision Pause"` | The verify FAIL settling (`every item accepted`) | EXTEND | Same rule for `From: holistic` |
| Continue route in build | `.bkit/core/workflows/bkit-build.md` | `grep -n DECISION_ROUTE` | Decision Pause steps 2, 6, 7 and gate | EXTEND | Add the route and its rules |
| Rule for every workflow and guard | `.bkit/core/.bkit/workflows.md`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `docs/decisions.jsonl` | `grep -n "Cross-step invariants"` | Invariants table; existing shape audit | EXTEND | Add a row, audit tests and a ledger row |

## Architecture & Component Changes

**Ledger rows:** one new `docs/decisions.jsonl` row (key set in task 5).

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/tasks.ts`

- **Existence Check:** the file exists. `tasks tick --decision=<file>`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.ts`

- **Existence Check:** the file exists. `DECISION_ROUTES` gains `continue`.

#### [MODIFY] `.bkit/core/engine/commands/workflow/summary.ts`

- **Existence Check:** the file exists. Settle the holistic FAIL.

### Workflows and docs

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** the file exists. Decision Pause steps 2, 6, 7 and the gate.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists. Rule and route names.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

None

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/decisions.jsonl` | one row for the rule, naming #957 |
| `.bkit/core/.bkit/workflows.md` | the rule, `continue` in Decision Pause, `route` values and Step 15 row |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Engine support for the skip

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Tick the tasks of accepted verify gaps
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tasks.ts`: `tasks tick --decision=<file>` ticks, in `--group`, the task each item answered `Accept` or `Accept (assumed)` names in its `Task {N}` title; `Fix now` and undecided items tick nothing
  - **READ:** `parseDecisionItems` in `.bkit/core/engine/commands/workflow/decisions.ts`: item title and decision
  - **DONE WHEN:** `tasks tick --decision` on a decision file with one Accept and one Fix now item ticks only the accepted item's task
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick --decision ticks the tasks of accepted verify-gap items` fails on the unknown flag
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick --decision leaves a Fix now item's task open` fails on the unknown flag

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Resume after a continue decision
  - **UPDATE:** `DECISION_ROUTES` in `.bkit/core/engine/commands/workflow/step-table.ts`: add `continue` keyed on the step before the pause: `build-plan-verify`, `build-group-gate`, `build-plan-gaps-remediate` → `build-plan-tasks`; `build-plan-verify-holistic`, `build-plan-gaps-remediate-holistic` → `build-challenge`
  - **DONE WHEN:** `status resume` after a `route=continue` decision row names Build Challenge or Plan Execute by the prior step
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `a continue decision after a holistic round resumes at Build Challenge` fails on no resume point
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `a continue decision after a group verify resumes at Plan Execute` fails on no resume point

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Summary settles an all-Accept holistic pause
  - **UPDATE:** `.bkit/core/engine/commands/workflow/summary.ts`: a `From: holistic` decision file whose every item is `Accept` or `Accept (assumed)` settles the last `build-plan-verify-holistic` and `build-plan-gaps-remediate-holistic` FAIL rows before it, listed as `resolved by the Decision Pause (...), every item accepted`
  - **DONE WHEN:** a run whose last holistic row is FAIL, followed by an all-Accept holistic pause, has no unresolved holistic FAIL in its summary
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `an all-Accept holistic pause settles the holistic FAIL before it` fails on the FAIL left unresolved
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a holistic pause with a Fix now item settles nothing` fails on a wrongly settled FAIL

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Workflow route and the rule for every workflow

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Build routes Accept-only pauses to continue
  - **UPDATE:** `Decision Pause` in `.bkit/core/workflows/bkit-build.md`: step 2 titles each verify-gap item `Task {N}` from its `TASK {N}` gap line
  - **UPDATE:** `Decision Pause` in `.bkit/core/workflows/bkit-build.md`: step 6, after the `Fix now` and `Try again` rules and before `From: holistic` / `From: verify`, a `From: verify` or `From: holistic` pause with every item `Accept` or `Accept (assumed)`, the loop question (when asked) `Decide`, and no `Gate: FAIL` header → `DECISION_ROUTE` = `continue`
  - **UPDATE:** `Decision Pause` in `.bkit/core/workflows/bkit-build.md`: step 7 routes `continue` from holistic → Step 11, and `continue` from verify → `"{BKIT}" tasks tick --plan=... --group={GROUP} --decision=...`, then Step 7
  - **UPDATE:** `Gate — Decision Pause` in `.bkit/core/workflows/bkit-build.md`: one checklist line for the `continue` route
  - **DEPENDS ON:** 1, 2, 3
  - **DONE WHEN:** an all-Accept verify or holistic pause records `route=continue` and starts no new verify round
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `an Accept-only verify or holistic pause routes continue before the verify and holistic re-runs` fails on no continue route
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `continue sends holistic to Step 11 and verify to the decision tick then Step 7` fails on no continue route
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a Gate FAIL pause never routes continue` fails on no Gate FAIL condition in the continue rule

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** State the rule for every workflow and guard it
  - **UPDATE:** `Cross-step invariants` in `.bkit/core/.bkit/workflows.md`: a **Re-runs follow answers** row, for all workflows, stating the three conditions and naming build's `continue`, debug's Loop Question, ship's Merge Question and Confirm Assumed Items
  - **UPDATE:** `Decision Pause` in `.bkit/core/.bkit/workflows.md`: the `Then:` bullet names `continue` and where it goes
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `route` field values in § `status.jsonl` — workflow state SoT and the Step 15 row of § `/bkit-build` name `continue`
  - **UPDATE:** `docs/decisions.jsonl`: one row for the rule, naming this issue
  - **DEPENDS ON:** 4
  - **DONE WHEN:** the docs name `continue` wherever they list decision routes, and the audit test passes on today's debug and ship questions
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug and ship questions offer no answer that re-runs a check without a change` fails on the missing test

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 6 start -->

- [x] **TASK 6:** An at-limit holistic pause (loop question answered Decide, every gap Accept) routes continue, but the summary still lists build-plan-verify-holistic FAIL and the build ends FAIL
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:430` · **Round:** 1
  - **DONE WHEN:** The holistic settling in buildSummary leaves the loop item (title `Holistic verify`, as `decisions compose` writes it) out of the all-Accept check, as the verify settling drops title `Verify` at line 383, and settles only when that loop item, when present, is answered `Decide`; a `Try again` loop answer still settles nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `an all-Accept holistic pause with a Decide loop question settles the holistic FAIL` fails on `build-plan-verify-holistic FAIL` left in `reasons`, because the `Q1 — Holistic verify` item's `Decision: Decide` fails `/^Accept\b/`

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** A fix round that edits source but reports Fixed: 0 pauses, the owner accepts the old gaps, and continue sends unverified edits on with no verify re-run
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:268` · **Round:** 1
  - **DONE WHEN:** The continue rule also requires that no source changed since the paused verify: the pause came from Step 8 or Step 10 sub-steps 5-6, or the Step 9 / Step 10 sub-step 10 `branches scan-diff --base=HEAD~1 --code` exited 1; a pause reached with exit 0 and VERIFY_FIXED / HOLISTIC_FIXED = 0 keeps the verify / holistic re-run
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `continue is never set after a fix round that changed source files` fails on the continue rule line naming no source-change condition

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [x] **TASK 8:** A run stopped between the build-decision row (route=continue) and the decision tick resumes at Plan Execute with the accepted tasks never ticked
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-build.md:307` · **Round:** 1
  - **DONE WHEN:** The verify continue tick (`tasks tick --decision`) runs in step 6 before the `steps finish --step=build-decision` block, so a resume either reopens the unrecorded decision (step 5 keeps a tick already made) or finds the tasks ticked; today DECISION_ROUTES.continue resumes at build-plan-tasks and nothing replays the tick, so a BLOCKED task re-opens the same group (Step 8 re-runs) and a DONE task stays unticked into Step 15's `Task N not done` FAIL
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the continue decision tick runs before the build-decision row is recorded` fails on the `tasks tick ... --decision=` line sitting after the `steps finish --workflow=build --step=build-decision` block

<!-- bkit:task 8 end -->
<!-- bkit:task 9 start -->

- [x] **TASK 9:** An accepted gap titled `TASK 3` (copied from its TASK {N} gap line) ticks nothing, tasks tick --decision exits 0 and the route goes on to Step 7 unchecked
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tasks.ts:219` · **Round:** 1
  - **DONE WHEN:** The title match is case-insensitive (`/\btask\s+(\d+)\b/i`), and the build route checks the tick's exit (non-zero → Failure Path) instead of a bare `run ..., then Step 7`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick --decision ticks a task whose item title reads TASK {N}` fails on `ticked` = `[]`, because `/\bTask (\d+)\b/` is case-sensitive
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the continue decision tick routes a non-zero exit to the Failure Path` fails on the continue / From: verify route line naming no exit handling

<!-- bkit:task 9 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 2 findings

<!-- bkit:task 10 start -->

- [x] **TASK 10:** An owner stops at an all-Accept verify or holistic pause and resumes later; the resumed Decision Pause has no SOURCE_CHANGED value, so step 6 either routes continue past fix-round edits no verify saw or re-runs the check the answers settled
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:167` · **Round:** 2
  - **DONE WHEN:** A verify or holistic decision file records `--header="Source changed={SOURCE_CHANGED}"` in `{HEADER_FLAGS}`; `openDecision` in `.bkit/core/engine/commands/workflow/workflows.ts` prints it (as it prints `gate`); the build Resume line holds it as `SOURCE_CHANGED`; and the step 6 continue rule treats a missing header as `true`, so a resumed or reopened pause (Stop then resume, or the `DECIDED` file the pre-record tick leaves unrecorded) routes the same as the original session. Today `PAUSE_STEP` = 10 for both the Step 10 sub-step 6 pause and the sub-step 10 fix-round pause, so the value cannot be derived on resume
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a verify or holistic decision file records Source changed and a resume holds it` fails on `{HEADER_FLAGS}` naming no `Source changed` header and the Resume line holding no `SOURCE_CHANGED`
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `openDecision carries the Source changed header` fails on `openDecision` having no `sourceChanged` field

<!-- bkit:task 10 end -->
<!-- bkit:task 11 start -->

- [x] **TASK 11:** A fix round edits source and reports Fixed: 0, the owner picks Stop at the holistic pause, and the resumed run answers Accept and routes continue, because `SOURCE_CHANGED` lives only in session memory and the resume rebuilds every other pause variable but not this one, so the unverified edits skip the verify re-run
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:268` · **Round:** 2
  - **DONE WHEN:** The verify and holistic pauses write the source-change fact into the decision file header (`--header="Source changed={SOURCE_CHANGED}"` in `{HEADER_FLAGS}`), step 6's continue rule reads it from that header, and a decision file with no `Source changed: false` header line keeps the verify / holistic re-run, so a resumed pause (Stop, or a session that died mid-pause) never routes continue on a guess
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the continue rule reads the source change from the decision file header` fails on `{HEADER_FLAGS}` carrying no `Source changed` header and the continue rule naming only the held `SOURCE_CHANGED`, which the `openDecision` resume never sets

<!-- bkit:task 11 end -->
<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** no `[NEW]` files.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** every planned test recorded red before its code step.
- [ ] **Tests unchanged:** every planned test case matches its red row.
- [ ] **Unproven tests:** none without a proven red.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every named test exists and passes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Run all tests:** the engine unit suites pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof.

### Manual Verification

- [ ] **Step 1:** run a build whose holistic pause is answered `Accept` and confirm it goes to Step 11 with no new holistic row.
