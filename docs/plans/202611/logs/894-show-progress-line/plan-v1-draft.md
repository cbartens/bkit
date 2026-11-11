# Show a Progress Line When Each Step Starts Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

Every `/bkit-*` workflow shows the engine's `progressLine` only when a numbered step **finishes** (`.bkit/workflows.md` § Progress Lines). The long steps (`plan-generate`, `build-plan-tasks`, `ship-deferred-sweep`, `build-run-tests`, `build-challenge`) therefore start in silence: the owner cannot see which step runs, which group it serves or which retry it is until it ends. The orchestrator cannot print while a subagent runs, so the line has to come before the step's work begins.

Goals:

- Add a read-only engine verb, `bkit steps start`, that works out a step's **start** line from `status.jsonl` and the plan, reusing the done-line code (`runProgress`, `stepProgress`), and writes no step row.
- Run it at the head of every numbered step's work in design, plan, build, debug and ship, with the group and attempt each looped step already passes to its finish; `/bkit-auto` forwards the lines through the shared `workflow-narrate` clause.
- Show the build group's Step 7 start line on every group entry, including a resumed one.
- Mark a passing `build-group-gate` line as the end of its group.
- Keep the docs that describe progress lines current in the same change (`.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/cli.md`, `.bkit/instructions.md`, `CHANGELOG.md`).

Constraints: the engine stays stack-agnostic; workflow edits go to `.bkit/core/workflows/*.md` and reach the host mirrors only through `pnpm tsx .bkit/core/engine/cli.ts upgrade`; `dist/` is rebuilt in the same change as the engine edits.

**Related Issues:**

- #825 — Show a progress bar line after every workflow step (CLOSED)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

Since #825, every `/bkit-*` workflow shows a progress line when a numbered step **finishes**. Long steps therefore start in silence: the owner doesn't see which step is running or why the wait is long until it's over.

### Success Criteria

- In all five step-listed workflows (design, plan, build, debug, ship), each numbered step that does work shows the engine's start line word for word before its work begins. `/bkit-auto` forwards those lines.
- The start line's % equals the % of the done line before it, and is never above the done line after it.
- In build, every task group shows a start line with `Group {g} of {G}` before Step 7 runs, and a passing group gate shows `Group {g} of {G} done`.
- A step re-entered by a retry loop, in any workflow, shows `Attempt {a} of {max}` in its start line.
- Start lines are worked out from `status.jsonl` and the plan alone and never write a status row, so a resumed run shows the same line it would have shown without the stop.

### Process Sketch

- **WHEN** a numbered step's work is about to begin **→ THEN** the orchestrator runs that step's `Start:` block and shows `Progress: {bar} {pct}% · Starting Step {n}/{steps} {title}` word for word, with the % of the done line shown just before it.
- **WHEN** a build task group begins Step 7, fresh or resumed **→ THEN** the start line carries `Group {g} of {G}` before the long `build-plan-tasks` wait; **WHEN** that group's gate passes **→ THEN** its done line ends `Group {g} of {G} done`.
- **WHEN** a retry loop re-enters a step (build verify / challenge / tests, debug fix / soak, ship merge) **→ THEN** its start line shows the lower % of that earlier step and `Attempt {a} of {max}`.
- **IF** a step is skipped, is a Decision Pause, an owner pause or unnumbered bookkeeping **→ THEN** no start line shows; a skipped step still prints its done line as today.
- **IF** the run stops and resumes **→ THEN** the resumed step shows its start line once, worked out again from `status.jsonl`, identical to the line an unstopped run shows.
- **IF** the run is headless or in the cloud, or the screen is 375px wide **→ THEN** the line prints without waiting, and its `Progress: {bar} {pct}%` part stays within 25 characters so it never wraps.

### Concrete Example

**Setup:** The owner runs `/bkit-build #894` on a plan with three task groups. Group 1 is done and its group gate passed, so the last line shown was `Progress: ████░░░░░░ 36% · Step 8/16 Plan Verify · Group 1 of 3 done`. Build's total is `6 + 3·3 + 7 = 22` units.

**Steps:**

1. The orchestrator briefs group 2 at Step 7 sub-step 1 → it runs `"{BKIT}" steps start --file="{STATUS}" --workflow=build --number=7 --group=2` → the engine prints `progressLine: Progress: ████░░░░░░ 36% · Starting Step 7/16 Plan Execute · Group 2 of 3` and appends no step row.
2. The orchestrator shows that line word for word → the `@bkit-build-plan-tests` and `@bkit-build-plan-tasks` subagents run for 20 minutes while the owner already sees which group is in flight.
3. Step 8's verify returns FAIL, Step 9 fixes the gaps (`Progress: ██████░░░░ 55% · Step 9/16 Plan Gaps Remediate · Group 2 of 3`), and the run goes back to Step 8 → the Step 8 start line reads `Progress: █████░░░░░ 45% · Starting Step 8/16 Plan Verify · Group 2 of 3 · Attempt 2 of 3`, lower than the Step 9 done line before it.
4. The second verify passes and the group gate passes → the gate's done line reads `Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Attempt 2 of 3 · Group 2 of 3 done`. Group 3 starts → `Progress: █████░░░░░ 50% · Starting Step 7/16 Plan Execute · Group 3 of 3`.
5. The session stops while group 3's tasks run, and the owner resumes → `status resume` names Step 7, group 3; the orchestrator runs Step 7's start block before the sub-step it enters, and the engine, passing over group 3's own Step 7 rows, prints `Progress: █████░░░░░ 50% · Starting Step 7/16 Plan Execute · Group 3 of 3` again.

**Outcome:** Every wait starts with a line naming the step, the group and the attempt, and no start line ever shows a higher % than the done line that follows it.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| First step of a workflow | Start line shows 0% and an empty bar |
| Step skipped (e.g. Plan Convert when the plan is already in task-block form, ship Step 4 on Path A) | No start line; the done line still prints as today |
| Decision Pause, owner pause, unnumbered bookkeeping | No start line |
| Build before Step 4, so no plan yet | G counts as 1, as for done lines |
| Group gate that fails or goes to gaps remediation | No `done` suffix; the done suffix appears only on the passing gate |
| Retry loop that goes back to an earlier step | That step's start line shows the lower % and the attempt |
| Resume after a stop | The resumed step shows its start line once, worked out again from `status.jsonl` |
| Headless / cloud run | Start lines print; nothing waits on them |
| Start line on a 375px-wide phone | The `Progress: {bar} {pct}%` part never wraps, as for done lines |
| Step that follows a conditional step which did not run (build Step 10 after the last group, build Step 15 after passing tests, ship Step 5 on Path A) | The start % is the last finished position's %, not the skipped position's; the following done line takes the jump |
| Step re-entered mid-way after a resume or a handover, with some of its own rows already written (build Step 7 after `build-plan-tests`) | The engine passes over the step's own trailing rows (same number and group), so the line equals the one the step showed when it first began |
| Gate-only positions that write no row (Step 1 in every workflow, ship Steps 3 and 9) | Counted as finished once the run is past them, so the next start line equals their gate done line |
| Step 2 starts before `{STATUS}` is held | The verb reads the run from `--fid` and `--month`, as the Step 1 gate does, so its % equals the Step 1 done line |
| Step 1 starts before `repo info` has run | The block runs through the `{BKIT}` lookup expression and prints 0% with no `--file` |
| `--number` outside the workflow's step table, `--step` the table places at another number, an unknown workflow, or a non-integer `--group` / `--attempt` | Exit 2, no `progressLine`, nothing written |
| `--step` naming a row outside the step table (`build-decision`, `build-tests-red`) | Exit 0 with no `progressLine`, the rule `steps finish` follows for those rows |
| Unreadable `status.jsonl` or an invalid plan | The same exit codes the done line uses (`EXIT_NO_STATUS`, usage for an invalid plan); no line |
| `/bkit-auto` delegating to a workflow | Auto shows the delegated workflow's start lines as it shows its done lines |
| Last build group (no group gate runs) | No `done` suffix; Step 10's start line marks the end of the loop |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Start line for a flat workflow uses the units finished before the step, with `Starting Step` wording | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Start line for the first step is 0% with an empty bar | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Build start line inside group 2 of 3 shows `Group 2 of 3` and the % before Step 7 of that group | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Start line on attempt 2 of a looped point shows `Attempt 2 of {max}` for each of build, debug and ship | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Start line's `Progress: {bar} {pct}%` part stays within 25 characters at every position of every workflow | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Passing group gate line ends `Group {g} of {G} done`; a failing one does not | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 2 |
| Start command prints `progressLine` and writes no status row | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| Start command rejects an unknown step and prints no line for skipped or unnumbered steps | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| Start line's attempt equals the attempt the step's following done line records | Unit | `.bkit/core/engine/commands/workflow/steps.test.ts` | 3 |
| A resumed build run shows the same start line for the resumed step as the same run before the stop, and a group start line equals the passing gate line before it, in a real git worktree | Integration | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` | 3 |
| The start-line narration survives every host render (Claude, Cursor, Codex, Antigravity, OpenCode) | Unit | `.bkit/core/engine/render/hosts.test.ts` | 4 |
| Each design and plan numbered step section runs `steps start` with its own `--workflow` and `--number`, after any skip line and before its first subagent or completion | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| Each debug and ship numbered step section runs `steps start`, and each looped step passes the attempt source its finish uses | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 5 |
| Every numbered step section in the five workflow files shows the start line before its work, and build's group-start blocks no longer discard their output | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 6 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

<!-- prettier-ignore -->
| Item | Kind | Detail |
| --- | --- | --- |
| `bkit steps start` | New verb (name) | Read-only; flags `--workflow --number --step --group --attempt --attempt-of --file --fid --month`; output key `progressLine`. Listed in `.bkit/cli.md` as `by hand`. |
| `Starting Step {n}/{steps} {title}` | New output wording | The start line's text after the bar and %; the `Progress: {bar} {pct}%` prefix is unchanged. |
| `· Group {g} of {G} done` | Changed output | Replaces `· Group {g} of {G}` on a passing `build-group-gate` done line and moves after any `· Attempt` suffix. Not breaking for scripts: `progressLine` is display text, and no reader parses it (`grep -rn "progressLine"` over `.bkit/core/engine` finds only writers and tests). |
| `Start:` | New workflow step label | Unnumbered lead in each numbered step, beside `Route:` and `Finish:`. |
| `workflow-narrate` clause | Changed shared text | Old wording moves to `retired`; `pnpm instructions:sync` rewrites all six workflow carriers. |

No status row, flag or exit code of an existing verb changes. No migration: consumers receive the new workflow text and engine through `bkit upgrade`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question:** What should the new read-only command be called, and what identifies the step? → the owner, at plan review.
  - **Options:** A) `bkit steps start` keyed on `--number` (plus optional `--step`, `--group`, `--attempt` / `--attempt-of`, `--file` or `--fid` + `--month`) — one verb beside `finish` / `gate`, works for row-less positions (ship 3 and 9), reuses `stepProgress` · B) a `--start` flag on `steps gate` — no new verb, but `gate` runs mechanical checks and needs a step key, so a start call would either run checks it does not need or need a second mode inside one verb · C) a `progressLine` key on `status resume` / `status route` — no new verb, but those verbs answer other questions and run at fixed points, not at every step's start
  - **Recommended:** A) `bkit steps start` — it is the narrowest contract, and it shares the done line's code path instead of adding a parallel one.
  - **Default if unanswered:** A.
- **Open Question:** How is the start % worked out when the step before it did not run (a conditional step skipped, or a gate-only position)? The Success Criteria require the start % to equal the done line before it. → the owner, at plan review.
  - **Options:** A) **finished-before, capped by position:** the smaller of the step's positional start (units before its position) and the % of the last finished position (the active run's last `DONE` numbered row, passing over the step's own trailing rows, with Step 1 and row-less positions counted as finished once passed) — the start % equals the done line before it in every flow, including a passing group gate followed by the next group, and a loop back shows the lower position · B) **positional only:** units before the step's position — simplest, but after a skipped conditional step (build Step 9 when verify passes, build Steps 13-14, ship Step 4 on Path A) the start line jumps above the last shown line, so the "equals" criterion fails exactly at the group boundary the issue cares about · C) positional start, and a passing group gate reports the group's end % — fixes the group boundary only, and changes the % of an existing done line
  - **Recommended:** A) finished-before, capped by position — it meets both halves of the confirmed criterion without changing any existing done line.
  - **Default if unanswered:** A.
- **Open Question:** Should the passing group gate's suffix say `done` or `passed`, and where does it sit? → the owner, at plan review.
  - **Options:** A) `· Group {g} of {G} done`, replacing the line's `· Group {g} of {G}` suffix and placed last, after any `· Attempt {a} of {max}` — the line ends with it and never repeats the group · B) `· Group {g} of {G} passed` in the same place — names the gate result, but "passed" reads as a verdict while the line marks a boundary · C) append `· Group {g} of {G} done` after the existing suffixes — matches the issue text literally, but repeats `Group {g} of {G}` twice on one line
  - **Recommended:** A) `done`, replacing the group suffix — it pairs with `Starting` and keeps the line short on a phone.
  - **Default if unanswered:** A.
- **Open Question:** How does build's group-start block stop losing its line? The issue's test row reads "build's group-start blocks no longer discard their output". → the owner, at plan review.
  - **Options:** A) run `steps start --number=7 --group={GROUP}` on every group entry, before the once-per-group `steps done --step=build-group-start` bookkeeping write, which keeps its `>/dev/null` because its own output is a Step 7 **done** line written at the group's start · B) remove `>/dev/null` and make the `build-group-start` completion return the start line, with `steps start` only on resume — two paths for one line, and a completion verb that returns a non-completion line
  - **Recommended:** A) — one path shows the group's line on fresh and resumed entries alike; the matrix row is met because the group's start line is no longer lost.
  - **Default if unanswered:** A.
- **Assumption:** "Never write a status row" means no `step-done` (or any other step) row; the CLI's ordinary `engine-call` journal row for each `steps start` call still lands in `status.jsonl`, as it does for `steps gate` → if the owner means no row of any kind, the verb must opt out of the journal, and the Tier-3 status-holes sweep (`.bkit/core/engine/checks/status-holes.ts`) would then report every start call as missing evidence.
- **Assumption:** Each looped step's start call passes the attempt its own done line records: build Step 8 `--attempt-of=build-plan-verify:next`, Step 9 `build-plan-verify:current`, Step 11 `--attempt={CHALLENGE_ROUND}`, Step 12 `build-run-tests:next`, Steps 13-14 `build-run-tests:current`; debug Step 3 `debug-run-tests:next`, Step 6 `debug-run-tests:current`, Step 7 `debug-failure-remediate:next:all`, Step 8 `debug-failure-soak:next:all`; ship Step 10 `ship-merge-pr:next`, Steps 11-12 `ship-merge-pr:current` → if a finish changes its attempt source later, its start line shows a different attempt from its done line until the start call is updated.
- **Assumption:** In start mode an explicit `--attempt` / `--attempt-of` wins over the completion-time overrides in `stepProgress` (debug remediation count across runs, saved soak count, saved challenge round), because at a step's start the saved fields still hold the previous round → if the overrides were applied, the start line of debug soak and build challenge would show the previous attempt.
- **Assumption:** A step that decides to skip itself through a route (build Steps 4 and 5) places its `Start:` block at the head of the work sub-step the route enters; a step behind a `**Skip if**` / `**Run only if**` line places it after that line → if a step skips in a way the plan did not list, it shows a start line on its skip route until the shape test's skip rule is widened.
- **Assumption:** Renumbering sub-steps is avoided: the `Start:` block is an unnumbered lead before sub-step 1 (or a lead inside the work sub-step), so no `sub-step N` route reference changes → if a step's first sub-step must hold the call, its route references move and the matching `.bkit/instructions.md` local entries need rewriting (knowledge row `renumbering-a-workflow-leaves-instructions-md-local-entries-stale`).
- **Assumption:** The `CHANGELOG.md` entry goes in a new top block for the next version, because `## [6.1.1]` is released → if the owner keeps an open block elsewhere, the entry moves there.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Approach | Why rejected or chosen |
| --- | --- |
| **Chosen:** a read-only `bkit steps start` verb, one `Start:` block per numbered step | Deterministic output from the same code as the done line; every call is journaled, so the status-holes sweep can see a skipped start call; the shape test can hold every step to it. |
| Header-only instruction ("before each step, run `steps start`") with no per-step block | Fewer edits, but the orchestrator must compute `--number`, `--group` and the attempt itself, the shape test has nothing to check per step, and the sweep has no required call to miss. |
| Return the next step's start line from the previous step's `steps finish` | The engine does not know the route: the next step depends on verdicts and loop budgets decided after the finish (build Step 8 → 7, 9 or 10). |
| Let the orchestrator write the line in prose | Loses the exact bar, rounding and attempt budget; the #825 decision keeps progress engine-derived. |
| Positional-only start % (`(n - 1)` units) | Simpler, but jumps above the last shown line after a skipped conditional step, breaking the confirmed "equals the done line before it" criterion (Open Questions). |
| Persist a progress high-water mark | Rejected by #825: goes stale when groups are added and hides retries. |

**Future phase:** a per-task line inside Plan Execute (`Task {t} of {T}`), duration weighting and a live status bar stay out of scope (`Out of Scope`).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| A line per plan task inside Plan Execute (`Task {t} of {T}`) | No Success Criterion, scenario or matrix row needs it; it needs the build subagents to report task boundaries, which changes subagent output | Issue § Out of Scope; follow-up issue (`docs/deferrals.jsonl` `894-per-task-progress-line`) |
| Weighting the % by how long steps take | Changes accuracy, not how often lines appear; the criteria fix the % to the existing unit count | Issue § Out of Scope; timing design (`825-duration-weighted-progress`) |
| A live bar in a status line or app UI | The criteria ask for chat lines only | Issue § Out of Scope; separate surface design (`825-live-status-bar-ui`) |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| One question format for every owner question in the workflows | #895 (open), `docs/plans/202611/895-one-question-format-plan.md` | Edits the same five workflow files and `.bkit/instructions.md` local entries as Tasks 4-7 | Keep separate; land one first and rebase the other, re-running `pnpm instructions:sync` after the rebase. |
| Owner Stop writes the full handover in debug, build and ship | #913 (open) | Touches the Failure Path / handover sections of build, debug and ship; those sections carry no `Start:` block | Keep separate; no shared lines expected. |
| Show every choice made without asking in each workflow's summary | #902 (open) | Summary steps (design 10, plan 7, build 15, debug 10, ship 6) gain a `Start:` block here | Keep separate; re-check the Summary step leads if #902 lands first. |

## Security & Privacy

- [ ] **New API Route** — not applicable: no route.
- [ ] **New DB Table/Column** — not applicable: no database.
- [ ] **Role-Gated Mutation** — not applicable: the verb mutates nothing.
- [x] **User Input** — the verb's flags are validated in its own handler (`positiveInt`, the `WORKFLOW_STEPS` lookup, `derivedCounter`'s spec check), never only by the workflow text.
- [ ] **PII** — not applicable: the line holds step numbers, titles, group and attempt counts only.
- [ ] **Redirect URL** — not applicable.
- [ ] **Webhook** — not applicable.
- [ ] **New Secret/Env Var** — not applicable.

None — no new routes, DB writes, secrets, or user input beyond the validated CLI flags above (`docs/security.md`: the untrusted-content model is unchanged, since the line is built from first-party `status.jsonl` and plan files).

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package is added or removed; `package.json` and `pnpm-lock.yaml` stay as they are.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-10) lists dev-only lag: `vitest` / `@vitest/coverage-v8` 5.0.5 → 5.1.0, `oxlint` 1.89.0 → 1.90.0, `oxlint-tsgolint` 7.0.2004 → 7.0.2005, `@types/node` 24.19.2 → 26.6.6, `vite` 6.4.5 → 8.3.5. None blocks this plan: it adds no dependency and uses no API newer than the installed versions. Toolchain: Node v24.16.0, pnpm 10.34.7; `gh` authenticated (issue reads succeeded).
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`; every capability extends `runProgress`, `stepProgress`, `stepsCommand`, the shared `workflow-narrate` clause or `workflow-shape.test.ts`.
- [ ] **User Context:** every file the runbook names exists and was read this session; no information is missing from the owner beyond the Open Questions.
- [ ] **Project Context:** read `docs/decisions.jsonl` `825-progress-derived-from-current-step-and-plan`, `docs/deferrals.jsonl` `825-duration-weighted-progress` and `825-live-status-bar-ui`, and `docs/knowledge.jsonl` `renumbering-a-workflow-leaves-instructions-md-local-entries-stale` and `instructions-store-clause-text-and-local-entries-need-hand-edits`.
- [ ] **Testing & Quality:** tiers follow `docs/testing.md` § Which tier does a behaviour need? and § Tiers: pure line arithmetic is Unit (`step-table.test.ts`); in-process command runs against a real temp git repo are Unit (boundary: real temp git repo) in `steps.test.ts`; the multi-module resume flow in a real worktree is Integration (`progress.integration.test.ts`); shipped workflow text is checked by Unit tests in `.bkit/core/engine/audits/workflows/`. No mocks at the `status.jsonl` boundary.
- [ ] **Prerequisite Plans:** None. #825 shipped in 6.1.0. `docs/plans/202611/895-one-question-format-plan.md` edits the same workflow files, so whichever lands second rebases (see `Suggested Scope Expansion`).

### Conditional

- [ ] **Secrets & Env Vars:** not applicable — no new credential or env var.
- [ ] **Schema State:** not applicable — no database; `status.jsonl` rows are read only (`.bkit/jsonl.md`), and no row shape changes.
- [ ] **Architecture & UI:** no new file and no UI; the new verb sits in `.bkit/core/engine/commands/workflow/steps.ts` beside `finish` / `gate`, as `docs/architecture.md` places engine verbs.
- [ ] **Observability:** the start verb logs only through `ctx.log` with the `[bkit-steps]` tag on a usage error, like `steps gate`; its `engine-call` journal row follows `.bkit/core/engine/ledgers/journal.ts`. No new log names.
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

No database. The feature reads the workflow run log (`status.jsonl`, contract in `.bkit/core/engine/ledgers/status.ts` and `.bkit/jsonl.md`) and the plan's task-group markers; it writes no step row and changes no row shape.

### Data Schema Usage

- **Input (Read):** `status.jsonl` `step-done` rows of the active run (`step`, `status`, `group`, `attempt`, `verdict`, saved limit and grant fields read by `savedPointLimit`); `docs/plans/{YYYYMM}/{FID}-plan.md` `<!-- bkit:group N start -->` markers (through `planFiles` and `parsePlanBlocks`).
- **Output (Write):** none for the start verb beyond the CLI's ordinary `engine-call` journal row; the group-gate suffix changes only the printed `progressLine`, never a row.

### Data Schema Changes

None.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Start-line arithmetic (finished-before %, `Starting Step` wording, group and attempt suffixes) | `.bkit/core/engine/commands/workflow/step-table.ts` | Serena `find_symbol runProgress` (body read); `grep -rn "Starting Step\|steps start"` over `.bkit/core`, `.bkit/*.md`, `docs/*.md` (no hit); `docs/capabilities.md` has no progress row | `runProgress` — renders done lines from position, groups, attempt and max; missing a start mode and a finished-before input | EXTEND | Add `start` and `after` inputs; the bar, rounding, group and attempt suffixes stay shared. |
| Passing group-gate end marker | `.bkit/core/engine/commands/workflow/step-table.ts`, `.bkit/core/engine/commands/workflow/steps.ts` | `grep -n "build-group-gate"` over `steps.ts`, `step-table.ts`, `bkit-build.md`; read `stepProgress` | `runProgress` group suffix; `stepProgress` builds its input from the row | EXTEND | `runProgress` gains a `groupDone` input; `stepProgress` sets it for a `DONE` `build-group-gate` row with verdict `PASS`. |
| Gather start inputs from the run (last finished position, groups, attempt, limit) | `.bkit/core/engine/commands/workflow/steps.ts` | Read `stepProgress`, `progressPoint`, `derivedCounter`, `steps gate --progress-number` handling; `grep -n "derivedCounter\|savedPointLimit\|allRunsDoneSteps"` | `stepProgress` — reads runs, plan groups, saved limits, attempts; used by `finish`, `done`, `gate` | EXTEND | Add a start mode to `stepProgress` that finds the last finished position and lets an explicit attempt win; no second reader. |
| Read-only start command | `.bkit/core/engine/commands/workflow/steps.ts` | Read `stepsCommand.verbs` (`done`, `finish`, `verdict`, `gate`, `stub`); `grep -n "verb:\|verbs:"` in `commands/workflow/status.ts` (`route`, `resume`) | `steps gate --progress-number` — renders a line, but only after gate checks and only for a completion; `status route` / `status resume` — read-only, answer other questions | EXTEND | Add a `start` verb to `stepsCommand`, reusing `FILE_FLAG`, `WORKFLOW_FLAG`, `GROUP_FLAG`, `positiveInt`, `derivedCounter` and the gate's `--fid` / `--month` file resolution. |
| Narration rule for start lines on every host | `.bkit/instructions.md` | `pnpm instructions:show`-equivalent read of § `workflow-narrate`; `grep -n "Narrate"` over `.bkit/core/workflows/*.md` | `workflow-narrate` clause, carried verbatim by all six workflows | EXTEND | Edit the clause's `text` block, move the old wording to `retired`, run `pnpm instructions:sync`. |
| Per-step start call in each workflow | `.bkit/core/workflows/bkit-{design,plan,build,debug,ship}.md` | `grep -n "^## \|^### "` per workflow; read build Steps 4-8, plan Steps 1-4, ship Steps 3-4 | Each step's existing `Finish:` block pattern | EXTEND | Add a `Start:` block mirroring `Finish:`. |
| Workflow text check | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | Read its imports and `resume` / `promoted parsers` describes; `grep -rn "stepSections"` | `stepSections` from `.bkit/core/engine/checks/status-holes.ts`, `WORKFLOW_STEPS`, `commandLines` | EXTEND | New `describe` block over the same parsers. |
| Host-parity check | `.bkit/core/engine/render/hosts.test.ts` | `grep -rln "progressLine\|Narrate"` over engine tests; read `workflow progress narration` describe | `preserves the progress contract across hosts` | EXTEND | Add start-line assertions to the same rendered-host loop. |

No `NEW` rows: every capability extends an existing file.

## Architecture & Component Changes

Engine first (line arithmetic, then the verb), then the shipped workflow text, then the docs. No new file.

**Ledger rows:** `894-steps-start-read-only-verb`, `894-start-percent-finished-before`, `894-group-gate-done-suffix`, `894-start-block-per-numbered-step`, `894-per-task-progress-line`, `825-duration-weighted-progress`, `825-live-status-bar-ui`

### Database Migrations

None — no database.

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.ts`

- **Existence Check:** exists; `runProgress` at lines 250-282.
- `runProgress` gains three optional inputs:
  - `start?: true` — render the start line: `Progress: {bar} {pct}% · Starting Step {n}/{steps} {title}`, then `· Group {g} of {G}` for build Steps 7-9, then `· Attempt {a}[ of {max}]` when `attempt > 1`.
  - `after?: { number: number; group?: number }` — the last finished position; in start mode the % is the smaller of `round(100 · (position − 1) / total)` and that position's done %, with the same 99% cap and ten-cell rounding. With no `after` the start % is positional (so Step 1 is 0%).
  - `groupDone?: true` — in done mode, replace `· Group {g} of {G}` with a final `· Group {g} of {G} done` after any attempt suffix.
- The done-mode output for every existing input stays byte-identical.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** exists; `progressPoint` at line 426, `stepProgress` at line 448, `stepsCommand` at line 1517, `gate` verb at about line 1853.
- `stepProgress(cwd, r, number?, mode?)`:
  - Done mode (today's callers): sets `groupDone` when `r.step === "build-group-gate"`, `r.status !== "FAILED"` and `r.verdict === "PASS"`.
  - Start mode: reads the active run; finds the last `DONE` row whose step the table numbers, passing over trailing rows of the same number and group; counts Step 1 and table positions with no `step` key as finished once the starting number is above them; passes the result as `after`; takes the attempt from the explicit value only; resolves the loop point from `--step` or the number's first table key; reads `max` with `savedPointLimit` as today.
- New `start` verb on `stepsCommand` (`use: "by-hand"`, since it writes no run state):
  - Flags: `--workflow` (required), `--number`, `--step`, `--group`, `--attempt` (`n` or `next`, `next` needs `--step`), `--attempt-of` (`<step>:<next|current|count>[:all]`, through `derivedCounter`), `--file` (optional), `--fid` and `--month` (status path when `--file` is absent, as the gate's Step 1 progress resolves it).
  - Validation, in the handler: `--number` or `--step` required; unknown workflow, a `--number` outside `WORKFLOW_STEPS`, a `--step` the table places at another number, both `--attempt` and `--attempt-of`, a non-integer `--group` / `--attempt` → exit 2 with no line. A `--step` outside the table → exit 0 and no `progressLine`.
  - Output: `progressLine` (absent when no line applies). Exit codes: `EXIT_NO_STATUS` for an unreadable `status.jsonl`, usage for an invalid plan, as `stepProgress` throws them.
  - Writes no row and makes no commit.
- `dist/` rebuilt with `pnpm build` in the same change.

### Workflows

#### [MODIFY] `.bkit/core/workflows/bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`

- **Existence Check:** all exist; numbered step sections match `WORKFLOW_STEPS` (pinned by `workflow-shape.test.ts` § resume).
- Each numbered step gains an unnumbered `Start:` lead with one block, e.g. plan Step 3:
  ```bash
  "{BKIT}" steps start --file="{STATUS}" --workflow=plan --number=3
  ```
  - Step 1: before `repo info`, with no `--file` (the `{BKIT}` lookup expression applies until `repo info` runs).
  - Step 2: `--fid={FID} --month={YYYYMM}` instead of `--file` (`{STATUS}` is held mid-step).
  - After a `**Skip if**` / `**Run only if**` line; inside the work sub-step for route-decided skips (build Step 4 sub-step 2, build Step 5 sub-step 3).
  - Looped steps pass the attempt sources listed in Open Questions & Assumptions; build Steps 7-9 pass `--group={GROUP}`.
  - Ship Steps 3 and 9 pass `--number` only.
- Build Step 7 sub-step 2 runs `steps start --number=7 --group={GROUP}` on every group entry, before the `status route` read and the once-per-group `steps done --step=build-group-start … >/dev/null` write, which stays.
- Each workflow's `**Resume:**` header line: the resumed step's `Start:` block runs once before the sub-step the resume enters.
- The header **Narrate** line takes the new `workflow-narrate` clause text through `pnpm instructions:sync`.

#### [MODIFY] `.bkit/core/workflows/bkit-auto.md`

- **Existence Check:** exists; line 15 carries `workflow-narrate`.
- Only the synced **Narrate** line changes: auto shows its delegated workflow's start lines as it shows the done lines.

### Instruction store and docs

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** exists; `### workflow-narrate` at line 2607; `## Local Instructions` at line 9698.
- `workflow-narrate`: new `text` wording that keeps every current phrase (`progressLine`, `word for word`, `plain text outside code blocks`, `Headless`) and adds the start-line rule; the current text moves into its `retired` block.
- `## Local Instructions`: a `Start:` entry under `### Shared lines` (one-word step label, like `Finish:`), and the changed lines of each workflow (`**Resume:**` lines, build Step 7 sub-step 2, the build Step 4 / 5 work sub-steps).

#### [MODIFY] `.bkit/core/.bkit/cli.md`

- **Existence Check:** exists; **Progress output** paragraph at line 43; generated region at lines 53-407.
- **Progress output** names `steps start` and its read-only contract; the `steps start` verb row comes from `pnpm cli:sync`.

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- **Existence Check:** exists; **Narrate** row at line 231; § Progress Lines at line 694; § Authoring Checklist near line 1719.
- § Progress Lines: start lines (wording, finished-before %, group, attempt, skipped and unnumbered steps, resume), and the group-done suffix; **Narrate** row; one checklist item: each numbered step that does work carries a `Start:` block.

#### [MODIFY] `CHANGELOG.md`

- **Existence Check:** exists; newest block `## [6.1.1] — 2026-11-04` is released.
- One `### Added` entry in a new top block for the next version.

### Tests

#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.test.ts`, `steps.test.ts`, `progress.integration.test.ts`, `.bkit/core/engine/render/hosts.test.ts`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

- **Existence Check:** all exist.
- New cases per the `Derived Test Matrix`; `workflow-shape.test.ts` gains a `describe("start lines")` block using `stepSections` and `WORKFLOW_STEPS`.

### Mirrors

- `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders `.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/` (including `.agents/skills/*/SKILL.md` and `.agents/plugins/bkit/skills/*/SKILL.md`), `.bkit/cli.md` and `.bkit/workflows.md` once, at the end.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. The start verb adds a line and replaces no artifact; the group-start bookkeeping write keeps its role (it records `GROUP_BASE` for Step 8), and the done lines stay.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` (installed as `.bkit/workflows.md`) | § Progress Lines: start lines, finished-before %, group start on every entry, resume, skipped and unnumbered steps, group-done suffix; **Narrate** row; § Authoring Checklist item for the `Start:` block. Index rule: same change as the workflow edits. |
| `.bkit/core/.bkit/cli.md` (installed as `.bkit/cli.md`) | **Progress output** paragraph names `steps start`; generated verb row via `pnpm cli:sync`. |
| `.bkit/instructions.md` | `workflow-narrate` text and `retired`; `## Local Instructions` entries for `Start:` and every changed workflow line. |
| `CHANGELOG.md` | `### Added` entry for start lines and the group-done suffix. |
| `docs/testing.md` | None — no new test file or pattern; the new cases sit in existing files the § Key test files list already covers. |
| `docs/decisions.jsonl` | Four rows written at plan time (see **Ledger rows**). |
| `docs/knowledge.jsonl` | None at plan time; build agents add a row only for a gotcha they meet. |
| `docs/architecture.md` | None — no new component or file. |
| `docs/technology.md` | None. |
| `docs/data-schema.md` | None — no database. |
| `docs/design.md` | None — no UI. |
| `docs/observability.md` | None — no new log name; the journal row is existing behaviour. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database change. |
| **Code** | `git revert {COMMIT}` of the feature merge, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` | The revert restores the workflow text, the clause and `dist/` together; consumers get it with their next `bkit upgrade`. |
| **Risk window** | A consumer whose installed workflows call `steps start` while its engine predates the verb | Workflows and engine ship in one package version, so `bkit upgrade` installs both together; the window exists only for a hand-mixed install. |

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Build order: line arithmetic, then the read-only verb, then the workflow text, then the docs and mirrors. The issue's six tasks are renumbered: issue Task 4 is split by workflow into Tasks 4-6, and issue Task 6 becomes Task 7. Integration shape (advice only): one PR for all tasks is fine.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Engine works out start lines and group-end lines

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Work out a start line for any numbered step, including its group and attempt
  - **UPDATE:** `runProgress` in `.bkit/core/engine/commands/workflow/step-table.ts`: add a start mode (`start`, `after` inputs) that counts the units finished before the step, takes the smaller of that and the `after` position's done %, and words the line `Starting Step {n}/{steps} {title}` with the existing group and attempt suffixes
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.test.ts`: new cases in `describe("workflow progress")`
  - **READ:** `.bkit/workflows.md`: § Progress Lines for the done-line formulas the start line mirrors
  - **DONE WHEN:** the five step-table tests in the matrix pass, and every existing `workflow progress` case still passes unchanged (done-mode output byte-identical)
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start flat` fails on a missing start mode, the line lacking "Starting Step"
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start first step` fails on a missing start mode, the first step not showing "░░░░░░░░░░ 0%"
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start build group` fails on a missing start mode, the group 2 line showing the done % instead of the % before Step 7
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start attempt` fails on a missing start mode, no start line carrying "Attempt 2 of" for build, debug and ship
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress start bar width` fails on a missing start mode, some position's line lacking "Starting Step" or its `Progress: {bar} {pct}%` part exceeding 25 characters

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Mark a passing group gate's line as the end of its group
  - **UPDATE:** `runProgress` in `.bkit/core/engine/commands/workflow/step-table.ts`: a `groupDone` input that replaces `· Group {g} of {G}` with a last `· Group {g} of {G} done`, after any attempt suffix
  - **UPDATE:** `stepProgress` in `.bkit/core/engine/commands/workflow/steps.ts`: set `groupDone` when the row is a `DONE` `build-group-gate` with verdict `PASS`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: new case in `describe("progress command output")`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a passing gate line ends with the done suffix and a failing one does not, both asserted in the one test below
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `group gate pass prints group done` fails on a missing suffix "Group 1 of 2 done" on the passing gate line

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Add a read-only engine command that prints a step's start line without writing a row
  - **UPDATE:** `stepsCommand` in `.bkit/core/engine/commands/workflow/steps.ts`: new `start` verb (`use: "by-hand"`) taking `--workflow` `--number` `--step` `--group` `--attempt` `--attempt-of` `--file` `--fid` `--month`, validated in its handler, writing no row
  - **UPDATE:** `stepProgress` in `.bkit/core/engine/commands/workflow/steps.ts`: start mode that finds the last finished position (passing over the step's own trailing rows, counting Step 1 and row-less positions as finished once passed), lets an explicit attempt win, and reuses plan groups, `progressPoint` and `savedPointLimit`
  - **READ:** `derivedCounter` in `.bkit/core/engine/commands/workflow/steps.ts`: the `<step>:<next|current|count>[:all]` spec `--attempt-of` resolves through
  - **READ:** `.bkit/core/engine/ledgers/journal.ts`: the `engine-call` row each CLI call already writes
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: **Progress output** paragraph names `steps start` and its read-only contract; the verb row through `pnpm cli:sync`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: new cases in `describe("progress command output")`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/progress.integration.test.ts`: new case in `describe("workflow progress command wiring")`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the command prints `progressLine`, leaves `status.jsonl` unchanged apart from its `engine-call` journal row, and refuses unknown steps with exit 2; the four tests below pass; `pnpm exec tsx .bkit/core/engine/tools/cli-doc.ts` exits 0; `pnpm build` succeeds with `dist/` in the same change
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `start prints progressLine without writing a row` fails on a missing verb, no line containing "Starting Step" being printed
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `start rejects unknown and skips unnumbered steps` fails on a missing verb, a `--step` outside the step table not exiting 0 with no `progressLine`
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `start attempt matches the following done line` fails on a missing verb, the start line's attempt differing from the attempt the following `steps finish` line records
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `start line is the same after a resume` fails on a missing verb, the resumed Step 7 start line differing from the line before the stop or from the passing gate's % before it

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Every workflow shows the start lines

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Show the start line in every host and at every numbered step of design and plan
  - **UPDATE:** `.bkit/instructions.md`: § `workflow-narrate` clause, adding the start-line rule without removing any current phrase, the old wording moved to `retired`; a `Start:` entry under `## Local Instructions` § Shared lines; local entries for the changed design and plan lines
  - **UPDATE:** `.bkit/core/workflows/bkit-design.md`: a `Start:` block in each numbered step (Step 1 with no `--file`, Step 2 with `--fid` and `--month`, Steps 7, 11 and 12 after their **Run only if** / **Skip if** lines) and the **Resume:** line naming it
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: a `Start:` block in each numbered step, after any skip line, and the **Resume:** line naming it
  - **UPDATE:** `.bkit/core/workflows/bkit-auto.md`: the **Narrate** line, through `pnpm instructions:sync`, so auto forwards start lines as it forwards done lines
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: new `describe("start lines")` block that walks each workflow's numbered step sections with `stepSections` and `WORKFLOW_STEPS`
  - **UPDATE:** `.bkit/core/engine/render/hosts.test.ts`: start-line case in `describe("workflow progress narration")`
  - **READ:** `stepSections` in `.bkit/core/engine/checks/status-holes.ts`: how a workflow file is split into step sections
  - **DEPENDS ON:** 3
  - **DONE WHEN:** the three tests below pass; the instructions sync check (`pnpm exec tsx .bkit/core/engine/tools/instructions.ts`) reports no drift; `instructions-coverage.test.ts` and `status-holes.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `start lines > design: every numbered step shows a start line` fails on steps with no start call
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `start lines > plan: every numbered step shows a start line` fails on steps with no start call
    - `.bkit/core/engine/render/hosts.test.ts` `preserves the start-line contract across hosts` fails on a rendered Narrate line with no start-line rule

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Show the start line at every numbered step of debug and ship, with their loop attempts
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: a `Start:` block in each numbered step after its **Run only if** line, Steps 3, 6, 7 and 8 passing the attempt sources listed in Open Questions & Assumptions, and the **Resume:** line naming it
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: a `Start:` block in each numbered step, Steps 3 and 9 with `--number` only, Steps 10-12 passing the `ship-merge-pr` attempt sources, and the **Resume:** line naming it
  - **UPDATE:** `.bkit/instructions.md`: `## Local Instructions` entries for the changed debug and ship lines
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: debug and ship cases in `describe("start lines")`
  - **DEPENDS ON:** 4
  - **DONE WHEN:** the workflow-shape test passes and the instructions sync check reports no drift; `instructions-coverage.test.ts` and `status-holes.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `start lines > debug: every numbered step shows a start line` fails on steps with no start call, or a looped step's start call with no attempt source
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `start lines > ship: every numbered step shows a start line` fails on steps with no start call, or a looped step's start call with no attempt source

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Show a start line at every numbered build step and each time a build task group starts
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: a `Start:` block in each numbered step (Steps 4 and 5 inside their work sub-steps, Steps 7-9 with `--group={GROUP}`, Steps 8, 9, 11-14 with the attempt sources listed in Open Questions & Assumptions); Step 7 sub-step 2 runs `steps start --number=7 --group={GROUP}` on every group entry, before the `status route` read and the once-per-group `build-group-start` write, so the group's line is shown instead of lost; the **Resume:** line naming the `Start:` block
  - **UPDATE:** `.bkit/instructions.md`: `## Local Instructions` entries for the changed build lines (Step 4 and 5 work sub-steps, Step 7 sub-step 2, **Resume:**)
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: build cases in `describe("start lines")`
  - **DEPENDS ON:** 4
  - **DONE WHEN:** a build with 2+ groups shows `Group {g} of {G}` before each group's Step 7 work (Step 7 sub-step 2 runs the group start call ahead of the `build-group-start` write, asserted by the test below, and the Task 3 integration test passes); the workflow-shape test passes and the instructions sync check reports no drift; `instructions-coverage.test.ts` and `status-holes.test.ts` pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `start lines > build: every numbered step shows a start line` fails on steps with no start call, or a Step 7-9 start call with no `--group`
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `start lines > build group start shows its start line` fails while Step 7 sub-step 2 runs no `steps start --number=7 --group={GROUP}` before the `build-group-start` write, so the group-start output is lost

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Update the docs that describe progress lines and refresh the mirrors
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § Progress Lines (start lines, finished-before %, group start on every entry, resume, skipped and unnumbered steps, group-done suffix), the **Narrate** row in the Protocol table, and an Authoring Checklist item for the `Start:` block
  - **UPDATE:** `CHANGELOG.md`: `### Added` entry in a new top block for the next version
  - **DEPENDS ON:** 5, 6
  - **DONE WHEN:** the docs describe start lines, group-end lines and attempt start lines, and match the engine output; `pnpm tsx .bkit/core/engine/cli.ts upgrade` has refreshed the host mirrors, `.bkit/workflows.md` and `.bkit/cli.md`, and `pnpm tsx .bkit/core/engine/cli.ts check` reports no drift
  - **TEST FIRST:** n/a — docs and mirror regeneration, no behaviour change

<!-- bkit:task 7 end -->

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
- [ ] **Verify observability:** errors are logged and traced as `docs/observability.md` describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` and `pnpm tsx .bkit/core/engine/cli.ts check` pass.
- [ ] **Test Synchronization:** no E2E suite exists for workflow text; the existing `workflow progress` (`step-table.test.ts`), `progress command output` (`steps.test.ts`), `workflow progress command wiring` (`progress.integration.test.ts`) and `workflow progress narration` (`hosts.test.ts`) cases still pass, proving done lines are unchanged.
- [ ] **Build Configuration:** `tsconfig.json` `exclude` keeps `**/*.test.ts` out of `dist/`; `pnpm build` output holds no test file.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/step-table.test.ts`, `steps.test.ts`):** start-mode arithmetic, the group-done suffix and the `steps start` verb (Tasks 1-3); command cases run against a real temp git repo, no `status.jsonl` mock.
- [ ] **Integration (`.bkit/core/engine/commands/workflow/progress.integration.test.ts`):** the resume flow in a real git worktree (Task 3).
- [ ] **Unit (`.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/render/hosts.test.ts`):** `Start:` blocks in all five workflows and the narration rule across hosts (Tasks 4-6).
- [ ] **Instruction store:** `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` and `pnpm exec tsx .bkit/core/engine/tools/cli-doc.ts` exit 0; `instructions-coverage.test.ts` and `status-holes.test.ts` pass.
- [ ] **Apply local migrations:** not applicable — no database.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** Run `/bkit-plan` on a small issue and check that every numbered step shows a `Starting Step {n}/{steps}` line before its work, with the % of the done line before it.
- [ ] **Step 2:** Run `/bkit-build` on a plan with 2+ task groups and check that each group's Step 7 start line shows `Group {g} of {G}` before the `build-plan-tasks` wait, and that each passing group gate's line ends `Group {g} of {G} done`.
- [ ] **Step 3:** Stop a build during Step 7 of group 2, resume it, and check that the resumed start line matches the one shown before the stop.
- [ ] **Step 4:** Against a run whose Step 8 verify failed once, run `bkit steps start --file={STATUS} --workflow=build --number=8 --group=2 --attempt-of=build-plan-verify:next` and check that the line shows `Attempt 2 of {max}`, and that `status.jsonl` gained only an `engine-call` row.
- [ ] **Step 5:** Run `/bkit-auto` on an issue and check that it shows the delegated workflow's start lines word for word.
