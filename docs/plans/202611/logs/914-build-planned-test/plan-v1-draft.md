# Planned-Test Lock: Cross-Group Changes, Superseded Tests and a Working BLOCKED Escape Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

`bkit steps finish` locks every planned test case after its red: a code step (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) whose diff changes a planned test's own lines is refused with exit 11 (`touchedTests`, `.bkit/core/engine/commands/workflow/tests.ts:351`, called at `.bkit/core/engine/commands/workflow/steps.ts:1262`). Issue #914 found three faults in that lock during #891's build:

<!-- prettier-ignore -->
| # | Fault | Cause in the code | Owner decision (issue comment, 2026-11-10T06:56:35Z) |
| --- | --- | --- | --- |
| 1 | A change to another group's planned test is caught only by a later holistic round that never touched the file. | `steps.ts:1255-1262` passes `group` to `touchedTests` for `build-plan-tasks` and `build-plan-gaps-remediate`, so only the step's own group is checked; the holistic step passes `undefined` and checks every group. | Both code steps check the planned tests of every group that already has a red row. |
| 2 | A planned test the owner superseded stays locked. | `touchedTests` walks every `build-tests-red` entry. A `missing` entry has `blob: null` and no block, so `git hash-object` never equals `null` and the test is always reported changed. The plan is never read. | A red row's test that the current plan no longer names is not checked. |
| 3 | The refusal offers a `BLOCKED` escape the engine never reads. | The exit 11 problem text (`steps.ts:1266`) and the exit-code help (`steps.ts:1809`) say "log the task BLOCKED", but nothing reads the agent's log. | Make the escape real: a `BLOCKED` line naming the test lets the step through, the change reaches the owner at the build Decision Pause, and a headless or `ask: false` run records an assumed accept that ship asks the owner to confirm. A changed test with no `BLOCKED` line naming it is still refused. |

**Goals:**

- Keep the lock's guarantee: no code agent can quietly weaken a planned test, because every change it keeps reaches the owner.
- Refuse a cross-group change in the step that made it, so a later step that did not touch the file is never refused for it.
- Stop failing runs whose code change is correct but forces a planned test's setup to change.

**Approach in one paragraph:** the three code-step finishes pass `--plan`, and the lock checks only the tests the plan's `TEST FIRST` fields name, across every group with a red row. The engine reads the step's own log for `` BLOCKED — {TASK N|Gap N}: test `{file}` `{name}` — {why} `` lines; a changed test that such a line names is let through and recorded on the step's `step-done` row (`changedTests`), which becomes the test's new baseline for later steps. `tests green` lists those tests as `changed`, and build Step 15 asks the owner about them once, at a `CHANGED_TESTS` Decision Pause, before the existing `UNPROVEN` pause.

**Related Issues:**

- #891 — Build: gate stuck on tests already red on dev, owner accept ignored (OPEN)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Success Criteria

⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds

### Process Sketch

- **WHEN** a code step changes a planned test of an earlier group and its log names that test on no `BLOCKED` line **→ THEN** that step's `steps finish` exits 11, naming the test, and nothing is committed.
- **WHEN** a code step keeps a needed change to a planned test and its log holds `` BLOCKED — TASK {N}: test `{file}` `{name}` — {why} `` for it **→ THEN** the step finishes, and its `step-done` row records the test, its new lines' hash and the reason.
- **WHEN** a later code step leaves that recorded change as it is **→ THEN** it finishes without a `BLOCKED` line of its own.
- **WHEN** build Step 15 runs and `tests green` lists one or more `changed` tests **→ THEN** the owner answers each at a `CHANGED_TESTS` Decision Pause; a headless or `ask: false` run takes `Accept (assumed)`, and ship asks the owner to confirm it.
- **IF** a red row names a test that the plan's `TEST FIRST` fields no longer name **→ THEN** the lock skips it, and no step is refused for it.
- **IF** a code step's finish has no `--plan` **→ THEN** it exits 2 (usage) and writes nothing.

### Concrete Example

**Setup:** The owner runs `/bkit-build` headless on a plan of 7 task groups. Group 3's Task 8 planned test `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` in `.bkit/core/engine/commands/workflow/decisions.test.ts` is recorded red, then green. Group 6's first red row still names `bkit tests base > a gate red on a non-test stage as well never reads all`, state `missing`, a test the owner replaced in the plan after a decision.

**Steps:**

1. Group 7's code agent (Task 20) makes `decisions apply --by=rerun` refuse a `Gate: FAIL` file with no loop question. It changes the setup lines of group 3's planned test, keeps its assertions and appends `` BLOCKED — TASK 20: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` — the file the test composes now needs a loop question; assertions unchanged `` to its log, then `DONE — TASK 20`. → `steps finish --step=build-plan-tasks --group=7 --plan=…` exits 0, and the row's `changedTests` names the test and the reason. Group 6's superseded test is not checked.
2. The holistic fix round edits help text only. → Its `steps finish` exits 0: group 3's test still matches the recorded change.
3. Step 15 runs `tests green` over the whole plan. → `changed` lists group 3's test with Task 20's reason. The run is headless, so the `CHANGED_TESTS` pause records `Decision: Accept (assumed)`.
4. The owner runs `/bkit-ship`. → Confirm Assumed Items asks the owner to confirm or reject the changed test.

**Outcome:** The build reaches its summary instead of the Failure Path, the owner sees the one planned-test change at ship, and no step was refused for a test it did not change.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A code step changes two planned tests, and its log's `BLOCKED` lines name only one | Exit 11 names only the unnamed test; nothing is written, so neither change is recorded. |
| A code step changes a test that a `BLOCKED` line recorded earlier in the run | Exit 11, unless this step's log names it on a new `BLOCKED` line, which records the newer lines. |
| The tests step records a new red for a test after a code step recorded a change to it | The newer red row is the baseline, because the latest record in `status.jsonl` order wins. |
| A `BLOCKED` line names a planned test that the step did not change | Nothing is recorded for it; it stays an ordinary blocked-task line for verify to read. |
| A `BLOCKED` line names the test by the last ` > ` segment of its suite path | It matches, the same way the lock finds a test by its last segment. |
| A `BLOCKED` line has no `— {why}` reason after the test | It names no test, so the change is refused as an unlogged one. |
| A gaps-remediate log names the test on a `` BLOCKED — Gap {N}: test `{file}` `{name}` — {why} `` line | It lets the step through, the same as the `TASK` form. |
| The code step finishes with no `--plan` | Exit 2 (usage), nothing written. |
| A red row's test is still named by the plan but under a different task number | It is not plan-named under the recorded task, so it is skipped; the new task's own red row locks it. |
| `tests green` runs on a plan with no recorded change | `changed` is `[]`, the report has no `Changed by a code step` section, and Step 15 goes straight to the `UNPROVEN` check. |
| The owner answers `Stop` at the `CHANGED_TESTS` pause | The run is handed over and stays `IN_PROGRESS`, as for any Decision Pause stop. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. Every Unit row in `steps.test.ts` and `tests.test.ts` is `Unit (boundary: real temp git repo)`; every row in `workflow-shape.test.ts` reads shipped workflow or prompt text, where the wording is the deliverable.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `refuses the execute step when it changes another group's planned test, exit 11` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `refuses the gaps-remediate step when it changes another group's planned test, exit 11` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `passes a code step whose red row names a test the plan no longer names` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `refuses a code step finish with no --plan, naming the flag` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `a red row's test the plan dropped never blocks a code step` | Integration | `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` | 1 |
| `blockedTests > reads the file, name and reason from a TASK or Gap BLOCKED test line` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `blockedTests > ignores a BLOCKED line that names no test` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 2 |
| `lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `refuses only the changed planned tests no BLOCKED line of the log names` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `passes a later code step that leaves a BLOCKED change as it is` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `refuses a later code step that changes a BLOCKED change again` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `the refusal names the BLOCKED line the engine reads` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `the exit 11 help names the BLOCKED line that lets a change through` | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| `green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| `green leaves a changed test the plan no longer names out of changed` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 3 |
| `a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed` | Integration | `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` | 3 |
| `the code steps' finishes pass the plan` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| `an exit 11 re-ask offers the BLOCKED test line the engine reads` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| `Step 15 asks once about planned tests a code step changed, before the unproven ones` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| `a changed-test item offers Accept or Stop, recommended Accept` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| `the execute prompt's BLOCKED test line is one the engine reads` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| `the remediate prompt's BLOCKED test line is one the engine reads` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| `the verify prompt notes a planned test a code step changed and raises no gap` | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| Shipped workflow, prompt and doc text passes typecheck, lint, prose lint and the drift check after the mirror re-render | Static | `pnpm bkit:gate:static` | 6 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

**Breaking changes:**

<!-- prettier-ignore -->
| Change | Who it affects | Handling |
| --- | --- | --- |
| `bkit steps finish --workflow=build` for `build-plan-tasks`, `build-plan-gaps-remediate` and `build-plan-gaps-remediate-holistic` requires `--plan` (exit 2 without it). | Only `bkit-build.md`, which this plan updates (the verb is `use: workflow`). A consumer gets both through `bkit upgrade`, which re-renders the workflow the orchestrator reads on resume. | No migration: no file on disk changes shape. |
| `build-plan-tasks` and `build-plan-gaps-remediate` refuse a change to any group's planned test, not only their own group's. | A run in progress whose earlier code step changed another group's test without a `BLOCKED` line is refused at its next code step instead of at its holistic round. | Intended (owner decision); the re-ask offers the `BLOCKED` line. |
| `touchedTests` takes the plan-named key set in place of `group`. | Internal export; its only caller is `steps.ts`. | Updated in the same task. |

**New names:**

<!-- prettier-ignore -->
| Name | Kind | Where |
| --- | --- | --- |
| `changedTests` | `step-done` row field: `[{task, test, testName, block, reason}]` | code steps' rows in `status.jsonl` |
| `changed` | `tests green` JSON key: `[{task, test, name, reason}]` | `bkit tests green` output |
| `## Changed by a code step` | report section | `build-tests-green-*.md` |
| `CHANGED_TESTS` | Decision Pause question (`Question: CHANGED_TESTS`) and workflow variable | `bkit-build.md` Step 15 and § Decision Pause |
| `blockedTests` | exported function | `tests.ts` |
| `planned-test-lock.integration.test.ts` | test file | `.bkit/core/engine/commands/workflow/` |
| `` BLOCKED — Gap {N}: test `{file}` `{name}` — {why} `` | log line form | gaps-remediate logs |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question Q1:** The Narrative and Success Criteria have no source: there is no design doc, the issue is not in the change shape (`.bkit/trackers.md` § Issue shapes) and there is no audit report. → The owner resolves it by answering here.
  - **Options:** A) Adopt the issue's `Expected` bullets and the owner's three decisions word for word as the Success Criteria, and write a Narrative from the owner comment's `Why` paragraph — the criteria then come only from text the owner already wrote, and the owner confirms the wording · B) The owner writes both sections — the exact words the owner wants, at the cost of a round trip before build.
  - **Recommended:** A) — every criterion the plan tests already sits in the issue's `Expected` list and the owner's decisions, so adopting them adds nothing new.
  - **Default if unanswered:** Both sections keep the `⚠️ MISSING` marker, and the plan does not proceed to build.
- **Open Question Q2:** Where a planned test that a code step changed under a `BLOCKED` line reaches the owner. → The owner resolves it; the plan is written for the recommendation.
  - **Options:** A) A separate `CHANGED_TESTS` Decision Pause at Step 15, asked once, before the `UNPROVEN` pause — clear item semantics and the same ask-once shape as `UNPROVEN`, but a run with both kinds stops twice at the end · B) Items inside the `UNPROVEN` pause — one stop, but an `UNPROVEN` Accept writes a `TEST EXCEPTION`, which is the wrong record for a changed test, and the ask-once rule then covers two kinds · C) A gap in the group's verify report (Step 8) — the owner hears sooner, but verify pauses only when a limit is used up or a gap is unfixable, and an unfixable gap is a hard blocker that sends a headless run to the Failure Path, against the owner's decision.
  - **Recommended:** A) — it is the only option that keeps a headless run going with an assumed accept and records an owner Accept as a `docs/decisions.jsonl` row.
  - **Default if unanswered:** A).
- **Open Question Q3:** What "reject" means for a changed-test item. → The owner resolves it; the plan is written for the recommendation.
  - **Options:** A) Options `Accept` / `Stop`: `Stop` hands the run over, and the owner restores the test or reworks the code before resuming — it mirrors the `UNPROVEN` item and adds no new routing · B) Options `Accept` / `Fix now` / `Stop`: `Fix now` adds a new last-group task that restores the test's intent — the reject stays inside the run, but `From: summary` needs a task-placement rule, and a change that the fix group itself makes needs asking again.
  - **Recommended:** A) — a rejected change means the code step's premise was wrong, which is a judgement the owner makes, not a task an agent can be briefed on from the pause.
  - **Default if unanswered:** A).
- **Open Question Q4:** How the code-step finish learns which tests the plan names. → The owner resolves it; the plan is written for the recommendation.
  - **Options:** A) A required `--plan` flag on the three code-step finishes, as `build-plan-tests` already has — explicit and tested, three workflow lines change · B) Derive the plan path from the status file's folder (`docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` → `docs/plans/{YYYYMM}/{FID}-plan.md`) — no flag, but a hidden coupling to the folder layout · C) An optional `--plan` — no usage break, but a call without it silently keeps fault 2.
  - **Recommended:** A) — the superseded-test skip is then always on, and a missing flag fails loudly.
  - **Default if unanswered:** A).
- **Assumption:** A code agent copies the `BLOCKED` line form from the refusal or its prompt, with an em dash, en dash or hyphen as `doneTasks` accepts. → If agents write another shape, the engine reads no line and refuses the step as it does today; the lock is never weaker.
- **Assumption:** A task whose log holds a `BLOCKED` test line followed by its `DONE — TASK {N}` line keeps `Verdict: PASS`, because the prompts' `FAIL` rule counts only a `BLOCKED` with no later `DONE`. → If wrong, the step's verdict reads `FAIL` and the group goes through verify and remediate for a task that is done.
- **Assumption:** The first `--artifact` of each code-step finish is the agent's own log (`reask.artifact` already relies on this). → If a step passes another file first, the engine reads `BLOCKED` lines from the wrong file.
- **Assumption:** Rows written by the current engine carry no `changedTests` field, and a row without it records no change. → Nothing breaks for runs in progress: their reds stay the baseline.
- **Assumption:** No caller outside `.bkit/core/workflows/bkit-build.md` runs `steps finish` for the three code steps (the verb is `use: workflow`, and `grep -l` over workflows, prompts and templates finds only that file). → If a consumer script does, it exits 2 until it passes `--plan`.
- **Assumption:** #891 (`docs/plans/202611/891-build-gate-stuck-plan.md`) merges to `dev` before this build starts; its branch changes `tests.ts`, `decisions.ts`, `bkit-build.md` and `bkit-build-plan-verify.md`. → If this plan is built first, the two branches conflict in the same Decision Pause and test-first lines, and #891's build keeps hitting fault 1.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Alternative | Why rejected |
| --- | --- |
| Stop offering the `BLOCKED` escape: drop it from the refusal text and the exit-code help | The owner chose the working escape (issue comment 2026-11-10T06:56:35Z): a correct code change that forces a planned test's setup to change would still fail the run. |
| Read `BLOCKED` lines from every log of the run, not only the finishing step's own log | A line one step wrote would let a later step's fresh change through unseen. The recorded `changedTests` baseline already carries an accepted change forward. |
| Keep the let-through in the step's log only, and re-read the logs on every later finish | A later step's finish would need every earlier log to agree with the rows. The `step-done` row is committed with the step and replays in `status.jsonl` order, the same as red rows. |
| Re-baseline the test silently, with no reason recorded | The owner must see why the change was needed at the Decision Pause; a hash alone gives the owner nothing to judge. |
| Let verify judge the change as a `test-loosened`-style gap | Verify raises an unfixable gap as a hard blocker, which sends a headless run to the Failure Path; the owner asked for an assumed accept instead. |
| Check only the planned tests in files the step's diff touched | It gives the same answer as comparing every plan-named test with its baseline, and adds a diff dependency the lock does not need. |

**Recommendations for a future phase:**

- A `bkit tests restore --test --name` command that puts one planned test back at its recorded lines, so a re-asked code agent restores by command instead of by hand-editing.

## Out of Scope

None — every item the issue and the owner's decisions name is in the runbook.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| The owner's `Fix now` direction never reaches the build agents, and the summary keeps a FAIL after `Fix now` or a later passing test run | #903 — Build: owner's Fix now answer is lost after the Decision Pause (agents, summary) (OPEN; blocked by #891) | `bkit-build.md` § Decision Pause, which Task 4 also edits | Keep separate: a different defect in the same section. Build it after this plan to avoid a merge conflict. |
| A pre-push timeout of the steps test `passes the execute step when every planned test file matches the row, and checks nothing without a row` | `docs/failures.jsonl` key `.bkit/core/engine/commands/workflow/steps.test.ts bkit steps finish — the tests step touches only tests, the code steps never touch a test > passes the execute step when every planned test file matches the row, and checks nothing without a row` (OPEN) | The suite Tasks 1 and 2 extend in `steps.test.ts` | Keep deferred: unrelated to the lock's logic; new tests in that suite reuse its fixtures, so watch their runtime. |
| A `bkit tests restore` command that puts a planned test back at its recorded lines | `Alternative Approaches & Recommendations` | The exit 11 re-ask | Needs a design decision; file it as an idea issue if wanted. |

## Security & Privacy

- [ ] **New API Route** — not applicable: no route.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable.
- [ ] **User Input** — not applicable as a handler input; the agent-written `BLOCKED` reason is treated as data (below).
- [ ] **PII** — not applicable: the reason holds test names and code reasons only.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

None — no new routes, DB writes, secrets, or user input. Two points follow `docs/security.md` § Untrusted Content & Prompt Injection:

- **Agent text stays data.** The engine stores the `BLOCKED` reason as a JSON string in `status.jsonl` and passes it to `decisions compose` as item text; it never reaches a shell command (`docs/security.md` § Shell Injection) or a commit message.
- **The escape cannot weaken a test unseen.** Each let-through is recorded and reaches the owner at the `CHANGED_TESTS` pause; a headless assumed accept keeps the build summary at `CONCERNS` and is asked again at ship's Confirm Assumed Items.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added; `package.json` and `pnpm-lock.yaml` stay unchanged.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-11) lists dev-only minor or patch updates (`vitest` 5.0.5 → 5.1.0, `@vitest/coverage-v8` 5.0.5 → 5.1.0, `oxlint` 1.89.0 → 1.91.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5); none blocks this build. Toolchain: Node v24.16.0 (`engines.node` `>=24`), pnpm 10.34.7 (matches `packageManager`).
- [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
- [ ] **User Context:** every file the runbook names was opened this session; Q1 (Narrative and Success Criteria) needs the owner's answer before build.
- [ ] **Project Context:** read `docs/knowledge.jsonl` key `steps-finish-refuses-a-code-step-whose-planned-test-file-changed` (its remediation still says "log the task `BLOCKED`"), `docs/decisions.jsonl` key `796-red-proven-per-group-blob-identity`, and `docs/failures.jsonl` key `.bkit/core/engine/commands/workflow/steps.test.ts bkit steps finish — the tests step touches only tests, the code steps never touch a test > passes the execute step when every planned test file matches the row, and checks nothing without a row` (an open pre-push timeout on a test this plan edits).
- [ ] **Testing & Quality:** Unit tests use real temp git repos and no mocks at the git boundary; the Integration test spawns `bkit` through `requireTsx()` (`docs/testing.md` § Spawning `bkit` from tests); no E2E or `@live` tier applies (`docs/testing.md` § Tiers: none for bkit).
- [ ] **Prerequisite Plans:** `docs/plans/202611/891-build-gate-stuck-plan.md` (#891), built, verified and merged to `dev` first, because its branch `feat/891-build-gate-stuck` edits `tests.ts`, `decisions.ts`, `bkit-build.md` and `bkit-build-plan-verify.md`.

### Conditional

- [ ] **Secrets & Env Vars:** not applicable — no credential or env var is added.
- [ ] **Schema State:** not applicable — no database; the one row change is a `step-done` field in a run's `status.jsonl`, documented in `.bkit/workflows.md` § Test-first.
- [ ] **Architecture & UI:** the new Integration test file sits next to the module it tests, as `docs/testing.md` § Stack places test files; no UI.
- [ ] **Observability:** no new log names; the existing `agent-rework` friction row on refusal stays, and a let-through writes the `changedTests` row field instead of a log line.
- [ ] **Notifications:** not applicable — no alert or toast.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

bkit has no database (`docs/data-schema.md` holds no table). The feature reads and writes rows of a run's `status.jsonl`, which `.bkit/core/.bkit/workflows.md` § Test-first documents.

### Data Schema Usage

- **Input (Read):** `build-tests-red` `step-done` rows: `group`, `tests[].task`, `tests[].test`, `tests[].testName`, `tests[].state`, `tests[].blob`, `tests[].block`.
- **Input (Read):** the plan's `**TEST FIRST:**` fields, through `readTestFirst` (`.bkit/core/engine/commands/workflow/tests.ts:745`).
- **Input (Read):** the finishing code step's own log (its first `--artifact`), for `BLOCKED` test lines.
- **Output (Write):** `step-done` rows of `build-plan-tasks`, `build-plan-gaps-remediate` and `build-plan-gaps-remediate-holistic` gain `changedTests: [{task, test, testName, block, reason}]` when a `BLOCKED` line lets a change through.

### Data Schema Changes

None — no `docs/data-schema.md` table changes. The `changedTests` row field is documented in `.bkit/core/.bkit/workflows.md` § Test-first (Task 6).

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Lock only plan-named tests, across every group with a red row | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -rn -e 'touchedTests' -e 'redEntries(' .bkit/core/engine --include='*.ts'`; `grep -n 'readTestFirst' .bkit/core/engine/commands/workflow/*.ts`; read `tests green` at `tests.ts:2276-2420` | `touchedTests` (`tests.ts:351`) — covers the hash compare, scopes by `group`, never reads the plan; `readTestFirst` (`tests.ts:745`) and `redKey` (`tests.ts:296`) — give the plan-named keys, as `tests green` already uses them | EXTEND | Replace the `group` parameter with the plan-named key set built from `readTestFirst` + `redKey`; walk every group's entries. |
| Code-step finish takes the plan | `.bkit/core/engine/commands/workflow/steps.ts` | `grep -n 'name: "plan"' steps.ts`; `grep -n 'str(f.plan)' steps.ts` | the `--plan` flag (`steps.ts:1713`), required today only for `build-plan-tests` | EXTEND | Require it for the three code steps too, and rewrite its help. |
| Read `BLOCKED` test lines from a step's log | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -rln 'BLOCKED' .bkit/core/engine --include='*.ts'`; read `doneTasks` (`tests.ts:1215`), `passesLines` (`tests.ts:1463`), `summary.ts:510` | `doneTasks` — task numbers only; `passesLines` — the same backticked file-and-name shape for `PASSES` lines, with `: reason`; `summary.ts:510` — last disposition per task, no test | EXTEND | Add an exported `blockedTests` next to `passesLines`, in its style. Widening `passesLines` would change its contract: a different verb, a `TASK\|Gap` prefix and a `— why` separator. |
| Let a named change through and record it | `.bkit/core/engine/commands/workflow/steps.ts` | read `finish` (`steps.ts:1065-1280`); `grep -n 'extras\b' steps.ts` | the `extras` object written onto the `step-done` row (`steps.ts:1065`, `1239`) | EXTEND | Put `changedTests` on `extras`; refuse only the unnamed tests, with the rewritten problem text. |
| Use a recorded change as the next baseline | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -n -e 'readStatusRows' -e 'function redRows' tests.ts`; read `redEntries` (`tests.ts:321`) | `redEntries` — latest red per key, used by `tests red`, `tests green` and `context brief`; `readStatusRows` — the ordered rows | EXTEND | `touchedTests` walks the rows in order, so a later `changedTests` record replaces a red entry's block and a later red replaces both. `redEntries` stays as it is for its three other callers. |
| List changed tests for verify and Step 15 | `.bkit/core/engine/commands/workflow/tests.ts` | read `tests green` (`tests.ts:2276-2420`) and `writeAuditReport` (`tests.ts:1540-1620`) | `unproven` and `updated` lists — the same per-test JSON plus report-section shape | EXTEND | Add a `changed` list and a `## Changed by a code step` section, built the same way. |
| Ask the owner once at the end | `.bkit/core/workflows/bkit-build.md` | `grep -n 'UNPROVEN' .bkit/core/workflows/bkit-build.md`; `grep -rn -e 'UNPROVEN' -e 'VERIFY_GAPS' .bkit/core/engine --include='*.ts'` (no hit: `decisions compose` / `apply` take any `Question` header) | Step 15 sub-step 1 and § Decision Pause `UNPROVEN` items | EXTEND | Add a `CHANGED_TESTS` question with the same ask-once rule; an owner Accept takes the existing `docs/decisions.jsonl` branch. |
| Ship confirms an assumed accept | `.bkit/core/workflows/bkit-ship.md` | read § Confirm Assumed Items (`bkit-ship.md:360-405`) | `decisions pending` lists every assumed accept of any question kind | EXTEND | No edit: the existing step already covers a `CHANGED_TESTS` item, so this row records the reuse. |
| Tell code agents how to keep a needed change | `.bkit/core/prompts/bkit-build-plan-tasks.md`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` | `grep -n -e 'BLOCKED' -e 'planned test' bkit-build-plan-tasks.md bkit-build-plan-gaps-remediate.md`; `grep -n -e 'planned test' -e 'BLOCKED' .bkit/instructions.md` | `bkit-build-plan-tasks.md:109` — the `` BLOCKED — TASK {N}: test `{file}` `{name}` — {why} `` form, for a wrong test left unedited; the remediate prompt has no test form | EXTEND | Add the keep-and-log case to both prompts, and the `Gap` form to the remediate prompt's log format. |
| Verify notes the change and raises no gap | `.bkit/core/prompts/bkit-build-plan-verify.md` | `grep -n -e 'Unproven' -e 'Updated tests' bkit-build-plan-verify.md` | step 8's `Unproven` rule (noted, no gap) | EXTEND | Add a `Changed by a code step` rule beside it. |
| Prove the finish-to-green wiring through the CLI | `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` | `ls .bkit/core/engine/commands/workflow/*.integration.test.ts` (six files); `grep -ln -e 'tests green' -e 'steps finish' .bkit/core/engine/commands/workflow/*.integration.test.ts` | None — no integration test drives `steps finish` and `tests green` together; `tests-lock.integration.test.ts` covers the machine-wide `tests` run lock, a different subject | NEW | Reason (a): the searches find no integration test of the build's test-first commands. |

## Architecture & Component Changes

The change sits in the build's test-first lock: two engine modules, the build workflow, three build prompts and the docs that describe them. No new command, verb or exit code.
**Ledger rows:** `914-lock-checks-every-group-with-a-red`, `914-lock-skips-tests-the-plan-no-longer-names`, `914-blocked-line-lets-a-planned-test-change-through`, `914-changed-tests-asked-once-at-step-15`, `914-code-step-finish-requires-plan`

### Database Migrations

None — bkit has no database, and no install or upgrade migration is needed: old `status.jsonl` rows read as "no recorded change".

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** the file exists; `touchedTests` at line 351, `redEntries` at 321, `redKey` at 296, `readTestFirst` at 745, `doneTasks` at 1215, `passesLines` at 1463, `writeAuditReport` at 1540, `tests green` at 2276.
- `touchedTests(top, file, workflow, planned)`: replace the `group` parameter with `planned: ReadonlySet<string>`, the `redKey` of every test the plan's `TEST FIRST` fields name. Walk every group's `build-tests-red` entries and the `changedTests` records of the three code steps' `step-done` rows in `status.jsonl` order: the latest record per key is the baseline, so a later red replaces a recorded change and a later change replaces a red. Skip any key not in `planned`. Return `{task, test, name, block}` per changed test, where `block` is the current lines' hash.
- Add an exported helper that builds `planned` from plan text with `readTestFirst` and `redKey`.
- Add an exported `blockedTests(log)`, a sibling of `passesLines`: every `` BLOCKED — {TASK N|Gap N}: test `{file}` `{name}` — {why} `` line (em dash, en dash or hyphen, as `doneTasks` reads) as `{test, name, reason}`. A line with no `— {why}` names no test.
- `tests green`: add `changed: [{task, test, name, reason}]` to its JSON, one entry per plan-named test whose latest lock record is a code step's `changedTests` entry, and a `## Changed by a code step` report section that says the owner answers each at the end of the build. `changed` is never a gap and never changes the verdict.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** the file exists; the lock block at lines 1252-1279, the `--plan` flag at 1713, the exit 11 help at 1808-1809, `recordTestLockFriction` at 93.
- For `build-plan-tasks`, `build-plan-gaps-remediate` and `build-plan-gaps-remediate-holistic`, require `--plan` (exit 2, `--plan is required to finish {step}`), and run the lock with `group` ignored.
- Read `blockedTests` from the first `--artifact`. A changed test that a line names (by its recorded name, or the last ` > ` segment of it) is let through and added to `extras.changedTests` as `{task, test, testName, block, reason}`. Every other changed test is refused as today: exit 11, `tests`, `touched`, `reask`, the friction row, nothing written.
- Rewrite the problem text: put the test back as the tests step left it (other edits to the file stay), or, when a correct code change needs the edit, keep it and append `` BLOCKED — TASK {N}: test `{file}` `{name}` — {why} `` (`Gap {N}` in a gaps fix) to `{artifact}`; the owner answers each kept change at the end of the build.
- Rewrite the `--plan` help (the plan whose `TEST FIRST` lines bound the tests step's commit and name the tests the code steps' lock checks) and the exit 11 help (any group's planned test changed with no `BLOCKED` line naming it).

#### [DELETE] `group` parameter of `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts`

- Superseded by the plan-named key set across every group (`Supersession Inventory` row 1); removed by Task 1.

#### [DELETE] own-group lock condition in `.bkit/core/engine/commands/workflow/steps.ts`

- `(step === PLAN_TASKS_STEP || step === PLAN_REMEDIATE_STEP) && group !== undefined` is superseded by one condition for the three code steps (`Supersession Inventory` row 2); removed by Task 1.

#### [DELETE] unread-escape problem and help text in `.bkit/core/engine/commands/workflow/steps.ts`

- The exit 11 problem text (`steps.ts:1266`) and help (`steps.ts:1809`) are replaced by text naming the line form the engine reads (`Supersession Inventory` row 3); replaced by Task 2.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.test.ts`

- **Existence Check:** the file exists; suite `bkit steps finish — the tests step touches only tests, the code steps never touch a test` at line 1700.
- Add `--plan=plan.md` to the `codeStep` argument builder, so the existing lock tests keep passing; add the Task 1 and Task 2 tests.

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.test.ts`

- **Existence Check:** the file exists; suite `bkit tests red / green` at line 1903.
- Add the `blockedTests` tests and the `tests green` `changed` tests.

#### [NEW] `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row "Prove the finish-to-green wiring through the CLI", reason (a).
- Spawns `bkit` through `requireTsx()` in a temp git repo holding a two-group plan; drives `steps finish` for the code steps and `tests green`, asserting exit codes, the `changedTests` row field and the `changed` list.

#### [MODIFY] `dist/`

- **Existence Check:** `dist/cli.js` exists.
- Rebuilt by `pnpm build` after the engine edits (`.agents/rules.md` § Engine builds); never hand-edited.

### Workflow and Prompts

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** the file exists; Step 7 sub-step 8 at line 640-645, Step 9 finish at 810-812, Step 10 sub-step 7 finish at 895-897, § Decision Pause item rules at 134-148, Step 15 sub-step 1 at 1112-1119, Gate 15 at 1149.
- Add `--plan="docs/plans/{YYYYMM}/{FID}-plan.md"` to the three code-step finishes.
- Rewrite the three exit 11 re-asks to offer the line form the engine reads: `` BLOCKED — TASK {N}: test `{file}` `{name}` — {why} `` for execute, `` BLOCKED — Gap {N}: test `{file}` `{name}` — {why} `` for both gaps fixes.
- Step 15 sub-step 1: hold `changed` as `CHANGED_TESTS`. **If** `CHANGED_TESTS` is not empty and no decision file of the run holds `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**; then the existing `UNPROVEN` check.
- § Decision Pause step 2: a `CHANGED_TESTS` item per entry, titled with its task number and test name, stating that a code step changed this planned test after its red and why; options `["Accept", "Stop"]`, recommended `Accept`. Step 5's existing `Else` branch writes an owner Accept as a `docs/decisions.jsonl` row.
- Gate 15: add `Changed planned tests asked once, or none left`.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-tasks.md`

- **Existence Check:** the file exists; step 8's planned-test bullets at lines 107-109, the log format at 141-146.
- Add the case: **If** a correct code change forces an edit to a planned test (for example new setup lines while its assertions stay the same) → keep the edit, append `` BLOCKED — TASK {N}: test `{file}` `{name}` — {why the change is needed} ``, finish the task and log its `DONE` line; a changed planned test with no such line is refused with exit 11.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`

- **Existence Check:** the file exists; the strategy rule at line 95, the log format at 136.
- Add the same case with the `` BLOCKED — Gap {N}: test `{file}` `{name}` — {why} `` form, and add that form to the log format.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-verify.md`

- **Existence Check:** the file exists; step 8's audit-report rules at lines 85-104.
- Add: `Changed by a code step` section → list each test and its reason in `Notes`; no gap, because the owner answers it at the end of the build.

### Docs and Catalogs

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** the file exists; § Decision Pause `Record` line 984 and `Unproven tests` line 988, Step 7 row 967, § Test-first table rows 1612-1616 and the lock bullet 1619.
- Add `CHANGED_TESTS` to the `Question` list, a `Changed tests (Step 15)` line and table row, the `changed` list in the Green row, the `Changed by a code step` rule in the Judgement row, and the every-group, plan-named and `BLOCKED` rules plus the `changedTests` row field in the lock bullet and the Step 7 row.

#### [MODIFY] `.bkit/core/.bkit/prompts.md`

- **Existence Check:** the file exists; rows `bkit-build-plan-tasks` (line 336) and `bkit-build-plan-gaps-remediate` (338).
- State the keep-and-log escape in both rows, and the `Changed by a code step` rule in the `bkit-build-plan-verify` row.

#### [MODIFY] `.bkit/shared/docs/testing.md`

- **Existence Check:** the file exists; § Test first at line 302 (source of `docs/testing.md`'s managed block).
- Add to `The red test stays`: a code step that must change a planned test logs a `BLOCKED` line naming it, and the owner answers the change at the end of the build.

#### [MODIFY] `.bkit/core/docs/templates/bkit-plan.md`

- **Existence Check:** the file exists; Gate 2 `Tests unchanged` at line 318.
- Reword the box: every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names its change for the owner.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** the file exists; `## Local Instructions` holds the exit 11 re-ask lines (line 9936, 9981).
- Bring the carried lines in line with the workflow and prompt edits: run the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts` first, and run `pnpm instructions:sync` (`--write`) only once the check lists just this change's lines.

#### Rendered mirrors

- `pnpm tsx .bkit/core/engine/cli.ts upgrade`, once at the end, re-renders `.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/`, `.bkit/workflows.md`, `.bkit/prompts.md`, `docs/testing.md` and `docs/templates/bkit-plan.md`; no mirror is hand-edited.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| The `group` parameter of `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts` | The plan-named key set across every group | DELETE | The owner decided the code steps check every group; no caller needs a group-scoped lock. Task 1 removes it in place, as an `UPDATE` line, because the function stays and a `DELETE` line naming `touchedTests` would raise a false `delete-still-referenced` gap. |
| The own-group condition in `finish` (`steps.ts:1252`): `PLAN_TASKS_STEP` or `PLAN_REMEDIATE_STEP` with `group !== undefined`, or `PLAN_REMEDIATE_HOLISTIC_STEP` | One condition covering the three code steps | DELETE | Task 1 removes it; the holistic and per-group steps then run the same check. |
| The exit 11 problem text and help that offer an unread `BLOCKED` escape (`steps.ts:1266`, `steps.ts:1809`) | Text naming the line form the engine reads | DELETE | Task 2 replaces both strings. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` (rendered to `.bkit/workflows.md`) | § Decision Pause: `CHANGED_TESTS` in the `Question` list and a `Changed tests (Step 15)` line. § Test-first: the Green, Judgement and new `Changed tests (Step 15)` rows; the lock bullet (every group, plan-named tests, the `BLOCKED` line, the `changedTests` field); the Step 7 row's exit 11 text. Task 6. |
| `.bkit/core/.bkit/prompts.md` (rendered to `.bkit/prompts.md`) | Rows `bkit-build-plan-tasks`, `bkit-build-plan-gaps-remediate` and `bkit-build-plan-verify`. Task 6. |
| `.bkit/shared/docs/testing.md` (rendered to `docs/testing.md`) | § Test first, `The red test stays`. Task 6. |
| `.bkit/core/docs/templates/bkit-plan.md` (rendered to `docs/templates/bkit-plan.md`) | Gate 2 `Tests unchanged`. Task 6. |
| `.bkit/instructions.md` | `## Local Instructions` lines carrying the edited workflow and prompt sentences. Task 6. |
| `docs/testing.md` § Key test files | A row for `planned-test-lock.integration.test.ts`. Task 6 (below `bkit:end`, hand-edited). |
| `docs/decisions.jsonl` | The five `914-*` rows on the `**Ledger rows:**` line, written by this plan. |
| `docs/knowledge.jsonl` | Key `steps-finish-refuses-a-code-step-whose-planned-test-file-changed`: its summary still names only `build-plan-execute` / `build-plan-gaps-remediate` and the group's blob, and its remediation's "log the task `BLOCKED`" now needs the line form. A same-`key` correction by `@bkit-utility-update-knowledge` at ship's doc update, not a runbook task. |
| `docs/architecture.md`, `docs/technology.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` | No change: no topology, library, table, UI or log name changes. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None — no database. | — |
| **Code** | `git revert {COMMIT}` of the squash merge, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-render `dist/` and the mirrors. | A `status.jsonl` row that carries `changedTests` reads as an ordinary row after the revert: the old lock ignores the field and compares against the red again. |
| **Risk window** | A build run in progress across the revert. | Its next code step falls back to the old own-group lock and may refuse a test a `BLOCKED` line let through; re-run the step after putting the test back. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: the engine lock first (Group 1), then the workflow, prompts and docs that call and describe it (Group 2). One PR for every task is fine; the groups are a suggested commit order only.

<!-- bkit:group 1 start -->

### TASK GROUP 1: The planned-test lock in the engine

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Lock only plan-named tests, across every group with a red row, and require `--plan` on the code-step finishes
  - **UPDATE:** `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts`: remove its `group` parameter; take the plan-named key set and check every group's red entries whose key it holds
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: add an exported helper that builds the plan-named key set from plan text with `readTestFirst` and `redKey`
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: replace the own-group condition with one for `build-plan-tasks`, `build-plan-gaps-remediate` and `build-plan-gaps-remediate-holistic`; require `--plan` for them (exit 2, `--plan is required to finish {step}`); pass the plan-named key set
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: add `--plan=plan.md` to the `codeStep` argument builder, so the existing lock tests keep passing
  - **CREATE:** `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`: spawns `bkit` through `requireTsx()` in a temp git repo; the superseded-test scenario
  - **READ:** `readTestFirst` in `.bkit/core/engine/commands/workflow/tests.ts`: the plan's `TEST FIRST` specs
  - **READ:** `redKey` in `.bkit/core/engine/commands/workflow/tests.ts`: the `[task, test, name]` key
  - **READ:** `docs/testing.md`: § Spawning `bkit` from tests
  - **DONE WHEN:** `touchedTests` takes `(top, file, workflow, planned)`; the three code-step finishes exit 2 without `--plan`; the five tests below pass, and the rest of the `bkit steps finish — the tests step touches only tests, the code steps never touch a test` suite still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses the execute step when it changes another group's planned test, exit 11` fails on a group 2 execute step finishing with exit 0 while it changed group 1's planned test
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses the gaps-remediate step when it changes another group's planned test, exit 11` fails on a group 2 gaps fix finishing with exit 0 while it changed group 1's planned test
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `passes a code step whose red row names a test the plan no longer names` fails on exit 11 naming a `missing` test that no `TEST FIRST` line names
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a code step finish with no --plan, naming the flag` fails on the finish running without `--plan` instead of a usage refusal "--plan is required"
    - `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` `a red row's test the plan dropped never blocks a code step` fails on the spawned `bkit steps finish` exiting 11 for a test the plan no longer names

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Make the `BLOCKED` escape real: read the step's log, let named changes through, record them, and use them as the next baseline
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: add an exported `blockedTests(log)` beside `passesLines`, reading `` BLOCKED — {TASK N|Gap N}: test `{file}` `{name}` — {why} `` lines (em dash, en dash or hyphen) as `{test, name, reason}`
  - **UPDATE:** `touchedTests` in `.bkit/core/engine/commands/workflow/tests.ts`: walk red entries and the code steps' `changedTests` records in `status.jsonl` order, the latest per key as the baseline; return each changed test's `task` and current `block`
  - **UPDATE:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts`: read `blockedTests` from the first `--artifact`; let a changed test through when a line names it (its recorded name or the last ` > ` segment) and add `{task, test, testName, block, reason}` to `extras.changedTests`; refuse the rest with exit 11 and the rewritten problem text that names the line form
  - **UPDATE:** `stepsCommand` in `.bkit/core/engine/commands/workflow/steps.ts`: rewrite the `--plan` flag help and the exit 11 help to name the `BLOCKED` line the lock reads
  - **READ:** `passesLines` in `.bkit/core/engine/commands/workflow/tests.ts`: the sibling line-reader style
  - **READ:** `recordTestLockFriction` in `.bkit/core/engine/commands/workflow/steps.ts`: stays on the refusal path only
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `blockedTests` is exported from `tests.ts`; a code step whose log names its changed planned test exits 0 and its `step-done` row carries `changedTests`; an unnamed change still exits 11; the eight tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `blockedTests > reads the file, name and reason from a TASK or Gap BLOCKED test line` fails on no entry, or a wrong file, name or reason, read from a `TASK` or a `Gap` line
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `blockedTests > ignores a BLOCKED line that names no test` fails on an entry read from a plain `BLOCKED — TASK {N}: {title} — {reason}` line or a test line with no reason
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row` fails on exit 11, or on a row with no `changedTests` entry holding the test, its new block and the reason
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses only the changed planned tests no BLOCKED line of the log names` fails on exit 0, or on `tests` naming the test the log's line named
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `passes a later code step that leaves a BLOCKED change as it is` fails on the later step's exit 11 for a test the earlier step's row recorded
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a later code step that changes a BLOCKED change again` fails on the later step finishing with exit 0 after changing the recorded lines again
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the refusal names the BLOCKED line the engine reads` fails on a `problem` text that does not hold the `` BLOCKED — TASK {N}: test `` form with the test's file and name
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `the exit 11 help names the BLOCKED line that lets a change through` fails on exit 11 help that still says only "log the task BLOCKED"

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** List the changed tests in `tests green`, for verify and for Step 15
  - **UPDATE:** `testsCommand` in `.bkit/core/engine/commands/workflow/tests.ts`: `tests green` adds `changed: [{task, test, name, reason}]`, one entry per plan-named test whose latest lock record is a code step's `changedTests` entry; never a gap, never a verdict change
  - **UPDATE:** `writeAuditReport` in `.bkit/core/engine/commands/workflow/tests.ts`: a `## Changed by a code step` section, one line per entry with its reason, saying the owner answers it at the end of the build
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `tests green` prints `changed` (`[]` when nothing changed) and the report holds the section only when it is non-empty; the three tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap` fails on `changed` being absent or empty, a gap raised for the test, or a report with no `Changed by a code step` section
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green leaves a changed test the plan no longer names out of changed` fails on `changed` listing a test that no `TEST FIRST` line names
    - `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` `a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed` fails on the group 2 step or the later holistic step exiting 11, or on `tests green` not listing the test as changed

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: The build workflow, prompts and docs

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Pass the plan, offer the working `BLOCKED` line, and ask about changed tests once at Step 15
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: add `--plan="docs/plans/{YYYYMM}/{FID}-plan.md"` to the Step 7 sub-step 8, Step 9 and Step 10 sub-step 7 finishes; rewrite their three exit 11 re-asks with the `` BLOCKED — TASK {N}: test `{file}` `{name}` — {why} `` (execute) and `` BLOCKED — Gap {N}: test `{file}` `{name}` — {why} `` (gaps fixes) forms
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 15 sub-step 1 holds `changed` as `CHANGED_TESTS` and pauses with `PAUSE_QUESTION` = `CHANGED_TESTS` once per run (skip when a decision file holds `Question: CHANGED_TESTS`), before the `UNPROVEN` check; § Decision Pause step 2 writes one `CHANGED_TESTS` item per entry, options `["Accept", "Stop"]`, recommended `Accept`; Gate 15 gains `Changed planned tests asked once, or none left`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Decision Pause `Record` line adds `CHANGED_TESTS` to the `Question` list, a `Changed tests (Step 15)` line beside `Unproven tests (Step 15)`, and the Step 7 row's exit 11 text
  - **UPDATE:** `.bkit/instructions.md`: the `## Local Instructions` lines carrying the edited workflow sentences, after the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts`
  - **READ:** `.bkit/core/workflows/bkit-ship.md`: § Confirm Assumed Items already covers an assumed `CHANGED_TESTS` accept
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** the three code-step finishes in `bkit-build.md` carry `--plan`; Step 15 routes to a `CHANGED_TESTS` pause before `UNPROVEN`; the instructions check exits 0; the four tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the code steps' finishes pass the plan` fails on a `build-plan-tasks`, `build-plan-gaps-remediate` or `build-plan-gaps-remediate-holistic` finish line with no `--plan="docs/plans/{YYYYMM}/{FID}-plan.md"`
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `an exit 11 re-ask offers the BLOCKED test line the engine reads` fails on an exit 11 re-ask whose line form, filled in, gives `blockedTests` no entry
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Step 15 asks once about planned tests a code step changed, before the unproven ones` fails on Step 15 with no `CHANGED_TESTS` route, no `Question: CHANGED_TESTS` skip, or that route after the `UNPROVEN` one
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a changed-test item offers Accept or Stop, recommended Accept` fails on a § Decision Pause with no `CHANGED_TESTS` item rule, or one with other options or no `Accept` recommendation

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Tell the code and verify agents how a needed planned-test change is kept and reported
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: step 8 adds the case where a correct code change forces an edit to a planned test: keep it, append `` BLOCKED — TASK {N}: test `{file}` `{name}` — {why the change is needed} ``, finish the task and log its `DONE` line
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: step 6's strategy rule adds the same case with `` BLOCKED — Gap {N}: test `{file}` `{name}` — {why} ``; the Remediation Log format adds that form
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: step 8 adds the `Changed by a code step` section rule: list each test and its reason in `Notes`, no gap
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: rows `bkit-build-plan-tasks`, `bkit-build-plan-gaps-remediate` and `bkit-build-plan-verify`
  - **UPDATE:** `.bkit/instructions.md`: the `## Local Instructions` lines carrying the edited prompt sentences, after the no-flag check `pnpm tsx .bkit/core/engine/tools/instructions.ts`
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** both code prompts show their `BLOCKED` test line form; the verify prompt holds the `Changed by a code step` rule; the instructions check exits 0; the three tests below pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the execute prompt's BLOCKED test line is one the engine reads` fails on the execute prompt's keep-and-log line form, filled in, giving `blockedTests` no entry
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the remediate prompt's BLOCKED test line is one the engine reads` fails on the remediate prompt having no `Gap` test line form, or one `blockedTests` does not read
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the verify prompt notes a planned test a code step changed and raises no gap` fails on a verify prompt with no `Changed by a code step` rule, or one that logs a gap for it

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Document the lock's contract, rebuild `dist/` and re-render the mirrors
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Test-first lock bullet (every group with a red row, plan-named tests only, the `BLOCKED` line, the `changedTests` row field as the next baseline), the Green row's `changed` list, the Judgement row's `Changed by a code step` rule, and a `Changed tests (Step 15)` row
  - **UPDATE:** `.bkit/shared/docs/testing.md`: § Test first, `The red test stays`: a code step that must change a planned test logs a `BLOCKED` line naming it, and the owner answers the change at the end of the build
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: Gate 2 `Tests unchanged` box covers a change a code step's `BLOCKED` line names for the owner
  - **UPDATE:** `docs/testing.md`: a § Key test files row for `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` (below `bkit:end`)
  - **DEPENDS ON:** 1, 2, 3, 4, 5
  - **DONE WHEN:** `pnpm build` exits 0; `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders `.bkit/workflows.md`, `.bkit/prompts.md`, `docs/testing.md`, `docs/templates/bkit-plan.md` and the host mirrors; `pnpm bkit:gate:static` and `node dist/cli.js check` exit 0 with no drift.
  - **TEST FIRST:** n/a — docs, a rebuilt `dist/` and re-rendered mirrors, covered by the Static tier

<!-- bkit:task 6 end -->

<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
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
- [ ] **Verify observability:** the refusal still appends its `agent-rework` friction row, and a let-through writes `changedTests` on the row.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `node dist/cli.js check` pass.
- [ ] **Test Synchronization:** the existing lock tests in `.bkit/core/engine/commands/workflow/steps.test.ts` pass with `--plan=plan.md` added to `codeStep`; the Step 7 audit in `workflow-shape.test.ts` (`Step 7 writes a group's tests with their own subagent, records them red and only then invokes execute`) still passes.
- [ ] **Build Configuration:** the new `*.integration.test.ts` file stays out of `dist/` through the existing build config; `pnpm build` output holds no test file.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/steps.test.ts`, `tests.test.ts`):** the Task 1, 2 and 3 rows, each in its own temp git repo removed in `afterEach`.
- [ ] **Integration (`.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts`):** the superseded and cross-group scenarios through `requireTsx()`, each asserting a positive signal (exit code plus the row field or the `changed` entry), never only an exit code.
- [ ] **Unit (`.bkit/core/engine/audits/workflows/workflow-shape.test.ts`):** the Task 4 and 5 rows, with the line-form tests run through `blockedTests`.
- [ ] **Apply local migrations:** not applicable — no migration.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch git repo with a two-group plan, run `pnpm build`, then `node dist/cli.js steps finish --workflow=build --step=build-plan-tasks --group=2 --plan=plan.md …` after changing group 1's planned test: it exits 11. Append `` BLOCKED — TASK 2: test `{file}` `{name}` — setup changed `` to the log and re-run: it exits 0, and the new `status.jsonl` row carries `changedTests`.
- [ ] **Step 2:** In the same repo, run `node dist/cli.js tests green --workflow=build --plan=plan.md --file=… --log=…`: the JSON lists the test under `changed`, and the report holds `## Changed by a code step`.
- [ ] **Step 3:** On the next headless build, confirm that the `CHANGED_TESTS` decision file reads `Decision: Accept (assumed)` and that `/bkit-ship` asks about it under Confirm Assumed Items.
