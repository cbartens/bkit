# Ship: remove the unreachable Failure Diagnose / Remediate steps Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

**Workstream dependencies:** None — the plan covers the whole issue (`Workstreams: []`), and no parent design exists.

`/bkit-ship` (`.bkit/core/workflows/bkit-ship.md`) carries two steps for a failed merge, Step 11 — Failure Diagnose and Step 12 — Failure Remediate, that no route reaches. Every route out of Step 10 goes to Step 13, Step 9, Step 3, the Merge Question or the Failure Path, and Step 10 sub-step 4 says "Recoverable merge refusals never enter Steps 11–12". Only a resumed run whose last row is `ship-failure-diagnose` or `ship-failure-remediate` enters them, and such a run holds none of the `MERGE_ASK` / `MERGE_ROUNDS` / `MERGE_MAX` values Step 11 reads. Step 11 also starts `bkit-debug-failure-diagnose` with no `Strategy`, which that prompt answers with `Verdict: FAIL` and an unfilled report.

The owner decided (issue comment, 2026-11-10T06:50:12Z) that a failed merge gets no diagnose-and-fix round inside ship:

- The cases a code fix could help with already have their own routes since #896: a moved head goes to Step 9, and a conflict with `dev` goes to Step 3.
- A red CI run already goes to the Failure Path from the Step 10 merge gate (`runs gate` exit 12), unless every failed CI step is a generated file.
- `/bkit-debug` is the tool for a red CI run at ship time, because it reads the CI run's evidence, reproduces the failure as a failing test and soaks unknown causes, which Steps 11-12 never did.

**Goals:**

- Remove Steps 11-12, every route and sentence that names them, and their step keys from the engine, the workflow checks and the docs.
- Renumber Steps 13-14 to 11-12, so the step numbers stay contiguous.
- Keep status files written before the change readable: `bkit status resume` and `bkit workflows summary` still handle their `ship-failure-*` rows.
- Name `/bkit-debug {FID}` as the next step when ship stops on a red CI run at the merge gate. Today neither the failure comment nor the final message names a next step.
- Keep the shared agents `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate`, which build and debug still use.

The two `docs/failures.jsonl` rows the issue cites (`ship-failure-diagnose-remediate-steps-reachable-only-on-resume`, `ship-failure-diagnose-invoked-without-strategy`) exist on local `dev` only and are not in this branch's base (`f6914f3c9`).

**Related Issues:**

- #911 — Ship: a failed merge never reaches the diagnose and fix steps (OPEN)
- #750 — Workflow optimisation (OPEN)
- #907 — Fix loops: drop the STANDARD / PIVOT / FINAL strategy labels (OPEN)
- #904 — Question advisor: a fresh top-tier agent behind every owner question (OPEN)
- #896 — feat(842-ship-fails-local): ship no longer fails when the local branch differs from GitHub's (MERGED)
- #902 — Show every choice made without asking in each workflow's summary (OPEN)

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

- **WHEN** a ship run's merge gate finds the CI run red and regenerating cannot fix it **→ THEN** the run takes the Failure Path, and the failure comment and the final message name `/bkit-debug {FID}` as the next step.
- **WHEN** the merge attempts are used up with `ship.merge.ask` on, in a session **→ THEN** the Merge Question asks Stop or Try again, and asks no diagnosis question.
- **WHEN** the post-merge squash capstone is red at Close Workflow **→ THEN** the Failure Path names `/bkit-debug {FID}` the same way.
- **WHEN** GitHub refuses the merge for a reason no code fix can address **→ THEN** the run stops at the Failure Path naming the reason, and no diagnose or fix step runs.
- **IF** a run started before the change is resumed after a `ship-failure-diagnose` or `ship-failure-remediate` row **→ THEN** `bkit status resume` ignores those rows and resumes after the run's last `ship-merge-pr` row, which ship turns into a return to Step 3.
- **IF** `bkit workflows fail` gets a `--next-step` value that is not one line starting `/bkit-` **→ THEN** it exits 2 and writes nothing.

### Concrete Example

**Setup:** The owner runs `/bkit-ship 911-ship-failed-merge` in a session. The PR is open against `dev`, and CI at the validated head is red in a unit test (not a generated file).

**Steps:**

1. The run reaches Step 10 → `bkit runs gate` exits 12 with `regenerable` = false.
2. Step 10 holds `/bkit-debug 911-ship-failed-merge` as `NEXT_STEP` → the run takes the Failure Path.
3. The Failure Path runs `bkit workflows fail --post ... --next-step="/bkit-debug 911-ship-failed-merge"` → the issue gets a `### Workflow Failure` comment ending `Next step: `/bkit-debug 911-ship-failed-merge``.
4. The Failure Path flushes the book and stops → the final message ends with the same `Next step:` line.

**Outcome:** The owner sees, on the issue and in the session, that the PR's CI is red at Step 10 and that `/bkit-debug 911-ship-failed-merge` is the next command. No Failure Diagnose or Failure Remediate step ran, and `bkit-ship.md` has no such step.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A run started before the change is resumed after a `ship-failure-remediate` row with verdict `PASS` | `bkit status resume` ignores the row and prints `step` = `ship-merge-pr`, `number` = 10, `after` = `ship-merge-pr`; ship returns to Step 3, as for any merge-step resume |
| A run started before the change is resumed after a `ship-failure-diagnose` row | Same as above: the row places no resume point |
| `bkit workflows summary` reads a ship run holding `ship-failure-*` rows | The rows appear in the step table as any other row; the command exits 0 |
| The advisory hole detector (`bkit:audit:status`) reads a run holding `ship-failure-*` rows | The rows are listed under `unexpected`, no step is `missing` on their account, and the CLI still exits 0 |
| A regenerable red run (exit 12, `regenerable` = true) is fixed by `bkit branches regenerate` | The run re-validates at Step 9 as today; no `NEXT_STEP` is held |
| A regenerable red run is not fixed (`outcome` = `unchanged` or `undeclared`), or the merge attempts run out on it | The run takes the Failure Path with `NEXT_STEP` = `/bkit-debug {FID}` |
| The merge gate refuses for a reason other than a red run (13, 15, 16, 18, 20) | The Failure Path names the gate's reason and no next-step line |
| `--next-step` holds a line break, or does not start with `/bkit-` | `bkit workflows fail` exits 2 (usage) before any write: no row, no lock release, no comment |
| `bkit workflows fail` runs without `--next-step`, or with an empty one (a value not held yet, as for `--fid` and `--token`) | `nextStep` prints null and the failure comment has no `Next step:` line, as today |
| The post-merge squash capstone is red at Step 12 (Close Workflow after the renumber) | The run takes the Failure Path with `NEXT_STEP` = `/bkit-debug {FID}` (Open Question 3, default A) |
| The post-merge capstone check exits non-zero for any other reason | The Failure Path names the reason and no next-step line, as today |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `bkit-ship.md` has no Failure Diagnose or Failure Remediate step, names no `ship-failure-*` key, and its steps run 1-12 ending at Close Workflow | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 1 |
| The Merge Question asks only when the merge attempts are used up, and `Try again` always grants a fresh allowance | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 1 |
| The ship step-key set is the canonical 12 keys, with no `ship-failure-*` key written or named | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 1 |
| `status route --require=strategy` is used at exactly four sites, none in ship | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 1 |
| A run resumed after old `ship-failure-*` rows resumes at the merge step (Step 10), after `ship-merge-pr` | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| Ship's progress line counts 12 steps (`Step 3/12 Base Check`) | Unit | `.bkit/core/engine/commands/workflow/step-table.test.ts` | 1 |
| A pre-change run holding `ship-failure-*` rows reports them as `unexpected` and no step as `missing` | Unit | `.bkit/core/engine/checks/status-holes.test.ts` | 1 |
| `bkit workflows summary` on a ship run holding `ship-failure-*` rows lists them and exits 0 | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 1 |
| `workflows fail --next-step` adds a `Next step:` line to the failure comment and prints `nextStep` | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| `workflows fail` refuses a multi-line or non-`/bkit-` `--next-step` before any write, and treats an empty one as absent | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| Every route that takes a red CI run to the Failure Path (Step 10 merge gate, Step 12 squash capstone) holds `/bkit-debug {FID}` as `NEXT_STEP`, and no other route does | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 3 |
| The Failure Path passes `--next-step` to `workflows fail` only when `NEXT_STEP` is held, and ends the final message with it | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 3 |
| The rendered `none`-tracker ship workflow matches its baseline | Unit | `.bkit/core/engine/render/trackers.test.ts` (`bkit-ship.none.txt`) | 3 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

<!-- prettier-ignore -->
| Change | Kind | Who it affects | Handling |
| --- | --- | --- | --- |
| Ship Step 13 — Update Local Dev becomes Step 11, and Step 14 — Close Workflow becomes Step 12 (`--number=11` / `--number=12`, Gate 11 / Gate 12) | Renumber | Progress lines, tracker step comments, docs and tests that cite the numbers | Every in-repo citation is rewritten in the runbook; old tracker comments keep the old numbers as history (Assumption 4) |
| Step keys `ship-failure-diagnose` and `ship-failure-remediate` are removed from `WORKFLOW_STEPS.ship`, `ROW_FIELDS`, `SHIP_STEP_ORDER` and the canonical key set | Removed name | Status files written before the change | Resume ignores the rows; summary lists them; the hole detector lists them as `unexpected` (Open Question 2) |
| Decision `467-ship-step-names-frozen` changes from 14 names to 12 | Frozen-contract change | Anything that counts ship's keys | Same-key decision row; `CANONICAL_SHIP_STEP_KEYS` drops the two keys, and its comment drops "Keys are added, never renamed" in favour of the current rule |
| The `/bkit-ship` catalog heading `### \`/bkit-ship\` — 14 steps` becomes `— 12 steps` | Anchor change | Links to the heading's anchor | `docs/setup.md` and `.bkit/core/.bkit/templates.md` links are rewritten in Task 5 and Task 4 |
| `bkit workflows fail` gains the optional flag `--next-step` and the output key `nextStep` | New name (additive) | Callers of `workflows fail` | Optional: without it, the output carries `nextStep: null` and the comment is unchanged |
| The Merge Question loses its "diagnosis found no clear cause" variant; it is asked only when the merge attempts are used up | Behaviour removal | Owners who read the question | The removed variant was reachable only from the removed Step 11 |
| The Failure Path's abort-handover subagent no longer reads `ship-failure-diagnose-*.md` / `ship-failure-remediate-*-log.md` | Removed input | The `bkit-debug-abort-handover` agent in ship | No new run writes these files; the agent's prompt is shared and unchanged |

**Naming review:** `--next-step` and `nextStep` follow `workflows summary`'s existing `nextStep` key; `NEXT_STEP` follows the workflow's held-name style (`LIMIT_NEXT`, `MERGE_ASK`).

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Open Question 1:** The issue is a bug-shape issue, so it has no `Narrative` or `Success Criteria`, and the Acceptance Scenario carries the `⚠️ MISSING` marker. → The owner resolves it by choosing wording below, or writing their own, before ticking the Acceptance Scenario box.
  - **Options:** A) Adopt this wording — Narrative: "The owner runs `/bkit-ship` on a PR whose CI is red; ship stops at the merge gate and names `/bkit-debug {FID}` as the next step, and the workflow holds no diagnose or fix step that no route reaches." Success Criteria: (1) `bkit-ship.md` has no Failure Diagnose or Failure Remediate step and names no `ship-failure-*` key; (2) ship's steps are numbered 1-12 in the workflow, the step table and the docs; (3) a red CI run at the merge gate or the post-merge capstone ends with `Next step: /bkit-debug {FID}` in the failure comment and the final message; (4) `bkit status resume` and `bkit workflows summary` exit 0 on a status file holding `ship-failure-*` rows, and resume lands at the merge step; (5) `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate` keep serving build and debug unchanged. — matches the owner's scope comment one to one · B) The owner writes the Narrative and Success Criteria — exact wording, but one more round before build.
  - **Recommended:** A) — every criterion is the owner's own scope bullet, restated as an outcome.
  - **Default if unanswered:** The plan stays as written, and `/bkit-build` treats option A's wording as the contract once the owner ticks the Acceptance Scenario box.
- **Open Question 2:** The advisory hole detector (`checks/status-holes.ts`) lists any recorded step the current workflow lacks as `unexpected (invented names)`, so a pre-change run holding `ship-failure-*` rows gets two `unexpected` entries. → The owner decides.
  - **Options:** A) Accept the `unexpected` entries — the build workflow's retired `build-challenge-*` rows already show the same way, `unexpected` never changes a verdict, and the CLI exits 0 · B) Teach the detector the retired names (read `RETIRED_STEPS` or a new list) so old rows are not reported — a quieter sweep, but it changes how build's retired rows report too and adds a list to keep in step.
  - **Recommended:** A) — it follows the existing precedent and keeps the detector a pure comparison against the current workflow.
  - **Default if unanswered:** A).
- **Open Question 3:** The owner's scope says that when ship stops on a red CI run, the stop message names `/bkit-debug {FID}`. Two places stop on a red run: the Step 10 merge gate (`runs gate` exit 12), and the post-merge squash capstone in Close Workflow (Step 12 after the renumber, `runs gate --capstone-only` exit 12). → The owner decides whether the second one is covered.
  - **Options:** A) Both — one rule for every red CI stop; `/bkit-debug` runs on `dev` as well as on a feature branch · B) The merge gate only — the post-merge case keeps today's message, recorded as a `needs-decision` deferral · C) The post-merge case names a different next step — needs a command nobody has specified.
  - **Recommended:** A) — the owner's sentence names every red CI stop, and debug already supports a run on `dev`.
  - **Default if unanswered:** A).
- **Assumption:** Every `ship-failure-*` row in an old status file follows a `ship-merge-pr` row, because Step 11's finish used `--attempt-of=ship-merge-pr:current`. → If wrong, a resumed old run lands after its last earlier step instead of the merge step; ship still returns to Step 3 for any number from 3 to 10.
- **Assumption:** A run stopped between a `ship-failure-remediate` `PASS` row and its fix commit is too rare to need its own route, because Steps 11-12 have been reachable only on resume since #896. → If wrong, the uncommitted fix sits in the worktree when the resumed run returns to Step 3, and the owner commits or discards it by hand.
- **Assumption:** `bkit workflows summary` keeps its generic row handling, so a `FAIL` `ship-failure-diagnose` row in a resumed old run still makes a refreshed Step 6 summary `FAIL`, exactly as it does today. → If wrong (the owner wants old rows ignored), such a run stops at Step 6; a fresh `/bkit-ship` run starts a new run without the old rows and proceeds.
- **Assumption:** No external contract parses ship's step numbers: resume keys on step names, and old tracker comments that say "Step 13" or "Step 14" are history. → If wrong, a consumer script that matches `Step 13 — Update Local Dev` breaks after the renumber.
- **Assumption:** The two `docs/failures.jsonl` rows that describe these defects reach `origin/dev` through the owner's own push of local `dev`, and are closed by the ship of this change. → If wrong, the rows stay `OPEN` after the defect is gone, until a `/bkit-utility-update-failures` pass closes them.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

<!-- prettier-ignore -->
| Alternative | Why rejected |
| --- | --- |
| Wire a failed merge into Steps 11-12 (the issue's first option): route Step 10 to Step 11, hold the counters there, pass `Strategy` | The owner rejected it: no Step 10 refusal left after #896 is one a code fix can address, and a red CI run needs debug's CI evidence, reproduction and soak, which would have to be copied into ship and kept in step |
| Keep Steps 13-14 at their numbers and leave a gap | `runProgress` (`step-table.ts`) counts distinct step numbers and shows 100% only when a step's number equals that count, so Close Workflow would print `Step 14/12` and never reach 100%; `workflow-shape.test.ts` also holds the table to the headings |
| Map the old `ship-failure-*` rows in `RETIRED_STEPS` to `ship-merge-pr` | The resume point is the same without an entry: the existing rule ignores rows of steps a workflow no longer has, and the `ship-merge-pr` row before them already resumes at the merge step. An entry would only change `after`, which no ship text reads any more |
| Put the next step in the error text the Failure Path writes to `error.md` | It mixes the next command into `Error:` and depends on the orchestrator writing it every time; a flag puts the wording in one engine function with a test |
| A generic `--line` flag on `workflows fail` (as on `issues comment`) | It would work, but leaves the `Next step:` wording to each workflow; `--next-step` gives one format, a validated value and a printed `nextStep` the final message can reuse |
| Teach the hole detector the retired step names | Open Question 2, option B |

**Recommendations for a future phase:**

- #907 removes the `Strategy` field from the fix loops; nothing here depends on it.
- #902's per-workflow table of choices made without asking loses its ship Step 11 row.
- Build Steps 13-14 keep their own diagnose-and-fix loop, because the failing tests there come from code the same run just wrote.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Removing the `Strategy` field (`STANDARD` / `PIVOT` / `FINAL`) from the build and debug fix loops | No Success Criterion, test row or scope bullet needs it: ship's missing-`Strategy` defect ends with Step 11, and the owner's scope says "Nothing else is needed for it"; the issue's References say #911 "does not wait for" #907 | #907 (deferral `911-ship-strategy-field-removal-via-907`) |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Close the two failure rows this change fixes (`ship-failure-diagnose-remediate-steps-reachable-only-on-resume`, `ship-failure-diagnose-invoked-without-strategy`) | `docs/failures.jsonl` on local `dev`, not in this branch's base | The defects Tasks 1-2 remove | Keep for `/bkit-utility-update-failures` after the rows reach `origin/dev` (Assumption 5) |
| Tell the owner at `/bkit-ship` when a red PR CI check also fails on the base commit | `docs/deferrals.jsonl` `891-ship-base-red-notice` (`OPEN`, `LOW`) | The Step 10 red-run route Task 3 edits | Keep deferred; it adds advice beside `NEXT_STEP` and needs its own issue |
| The `none`-tracker render baselines miss the read-only helper recovery text | `docs/failures.jsonl` `workflow-none-render-baselines-miss-read-only-helper-recovery` (`OPEN`) | Tasks 1 and 3 regenerate `bkit-ship.none.txt` only, and leaves that drift in the other four baselines | Keep separate; fold in only if the owner wants the full `pnpm bkit:generate` in this change |
| `.bkit/core/.bkit/prompts.md` says "Build Steps 12-13" for the steps build numbers 13-14 | Found while planning | The sentence Task 4 edits for ship | Needs a human decision: fixing it is outside #911's scope, but it sits in the same sentence |
| Promote the status-hole detector from advisory to gate | `docs/deferrals.jsonl` `384-promote-status-hole-detector-from-advisory-to-gate` | `checks/status-holes.ts`, which Task 1 edits; a gate would turn old `unexpected` rows into failures | Keep deferred; if promoted, Open Question 2 option B becomes required |
| Whether the question advisor covers the Merge Question | #904 (open question 6) | The Merge Question Task 1 trims | Keep in #904; the trimmed question is still the one #904 asks about |
| #902's table of choices made without asking | #902 | Ship's old Step 11 row in that table | Note on #902; no file in this branch holds the table |

## Security & Privacy

- [ ] **User Input** — `bkit workflows fail --next-step` is validated in `failVerb`, the handler that receives it, before any write: one line starting `/bkit-`, else exit 2. The value goes into a tracker comment inside backticks.

None of the other rows apply — no new API route, DB table, role-gated mutation, PII, redirect URL, webhook, or secret.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** No package is added or removed; `package.json` and `pnpm-lock.yaml` stay unchanged.
- [ ] **Dependency Versions:** `pnpm bkit:deps:outdated` (2026-11-10) lists dev-only minor and major bumps (`oxlint` 1.89.0 → 1.90.0, `oxlint-tsgolint`, `vitest` and `@vitest/coverage-v8` 5.0.5 → 5.1.0, `@types/node` 24 → 26, `vite` 6 → 8); none blocks this change. Toolchain: Node v24.16.0 (`engines.node` `>=24`), pnpm 10.34.7 (matches `packageManager`), `gh` 2.102.0.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** Every file the runbook names was opened in this session. No user information is missing, apart from Open Questions 1-3.
- [ ] **Project Context:** Read `docs/decisions.jsonl` (`467-ship-step-names-frozen`, `842-ship-revalidates-moving-base-before-merge`, `715-lite-workflows-retired`) and `docs/knowledge.jsonl` (`renumbering-a-workflow-leaves-instructions-md-local-entries-stale`: a renumbered workflow's `- source:` block in `.bkit/instructions.md` must be rewritten by hand before `pnpm instructions:sync` passes).
- [ ] **Testing & Quality:** Every behaviour is a Unit row (engine commands in process, markdown invariants, the render baseline), per `docs/testing.md` § Which tier does a behaviour need?. No row crosses a database, network or model boundary. The planning run could not execute tests: the machine `tests` lock was held by another checkout's `bkit:gate:changed` run.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Secrets & Env Vars:** Not applicable — no credential or env var is added.
- [ ] **Schema State:** Not applicable — no database. The `status.jsonl` row shapes in `.bkit/workflows.md` § `status.jsonl` — workflow state SoT are unchanged; only two step names stop being written.
- [ ] **Architecture & UI:** No new file kind, so `docs/architecture.md` needs no change; no UI.
- [ ] **Observability:** No log, audit table or trace is added. The failure comment gains one optional `Next step:` line; `[bkit-*]` stderr prefixes are unchanged.
- [ ] **Notifications:** Not applicable — `.agents/docs.md` lists no notifications doc, and the tracker comment kind (`failure`) is unchanged.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

No database. The plan reads and writes `status.jsonl` only through existing commands, and changes no row shape.

### Data Schema Usage

- **Input (Read):** `status.jsonl` `step-done` rows (`step`, `verdict`, `attempt`) through `bkit status resume`, `bkit workflows summary` and `checks/status-holes.ts`.
- **Output (Write):** the `status.jsonl` `workflow-failed` row through `bkit workflows fail`, unchanged; the tracker failure comment body gains an optional `Next step:` line.

### Data Schema Changes

None — `ship-failure-diagnose` and `ship-failure-remediate` rows stop being written, and old rows stay valid input.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Name the next command on a workflow's failure comment | `.bkit/core/engine/commands/workflow/workflows.ts` | `grep -rln '/bkit-debug' .bkit/core/engine` (no hit in the fail or comment code); `grep -n 'lines?:' commands/workflow/issues.ts`; `grep -n 'nextStep' commands/workflow/summary.ts commands/workflow/workflows.ts`; `grep -n '"line"' commands/workflow/*.ts` | `workflows fail` (`workflows.ts`) builds the comment through `buildComment` (`issues.ts`), whose `CommentInput.lines` already appends raw lines after the links; `issues comment --line` feeds it; `workflows summary` prints a `nextStep` | EXTEND | Add `--next-step` to `fail`: validate it, pass `Next step: \`{value}\`` through `CommentInput.lines`, print `nextStep` |
| Hold the next command on every red-CI stop in ship | `.bkit/core/workflows/bkit-ship.md` | `grep -n 'exit 12\|regenerable\|Failure Path' .bkit/core/workflows/bkit-ship.md`; read Step 10 sub-step 1, Step 14 sub-step 1 and the Failure Path | Step 10 sub-step 1 already splits exit 12 by `regenerable`; the Failure Path already holds optional flags (`--max-exceeded`, `--pr`) | EXTEND | Hold `NEXT_STEP` on the exit-12 Failure Path arms and on a red squash capstone; pass it to `workflows fail`; end the final message with it |
| Resume a pre-change run past its `ship-failure-*` rows | `.bkit/core/engine/commands/workflow/step-table.ts` | `grep -rn 'RETIRED_STEPS\|WORKFLOW_STEPS' .bkit/core/engine`; read `resumePoint`; read `step-table.test.ts` "ignores plan rows for steps the plan workflow no longer has" | `resumePoint` ignores rows of steps the table lacks; `RETIRED_STEPS` maps rows that still place a resume point | EXTEND | Delete the two rows from `WORKFLOW_STEPS.ship` and renumber; the existing ignore rule covers old rows, so no `RETIRED_STEPS` entry |
| Ship's step-key set without the failure steps | `.bkit/core/engine/checks/status-holes.ts` | `grep -n 'RETRY_LOOP_STEPS\|SHIP_STEP_ORDER\|MERGED_ON_ENTRY_SKIP' checks/status-holes.ts` | `SHIP_STEP_ORDER`, `RETRY_LOOP_STEPS` and their uses in `computeMandatoryForPath` / `detectHoles` | EXTEND | Drop the two keys from `SHIP_STEP_ORDER`, delete `RETRY_LOOP_STEPS` and its filters, fix the header comment's step numbers |
| Row fields and loop budget without the failure steps | `.bkit/core/engine/commands/workflow/steps.ts` | `grep -n 'ship-failure' commands/workflow/steps.ts` | `ROW_FIELDS` (two entries) and `progressPoint` (one list) | EXTEND | Delete the two `ROW_FIELDS` entries and drop the two names from the `ship.merge` list |
| One Merge Question variant | `.bkit/core/workflows/bkit-ship.md` | `grep -n 'LIMIT_NEXT\|calling step\|diagnosis' .bkit/core/workflows/bkit-ship.md` | The Merge Question's `LIMIT_NEXT` branch already covers the used-up limit | EXTEND | Keep the used-up-limit question as the only one; fold the two `Try again` arms into the grant arm |

## Architecture & Component Changes

Sources only: `.bkit/core/workflows/`, `.bkit/core/.bkit/` and the engine. The mirrors (`.bkit/workflows.md`, `.bkit/prompts.md`, `.bkit/README.md`, `.bkit/templates.md`, `.bkit/cli.md`, `.claude/commands/bkit-ship.md`, `.cursor/`, `.opencode/`, `.agents/skills/bkit-ship/SKILL.md`, `.agents/plugins/bkit/skills/bkit-ship/SKILL.md`) and `dist/` are regenerated in Task 7, never hand-edited.

**Ledger rows:** `911-ship-failed-merge-steps-removed`, `911-ship-steps-renumbered`, `467-ship-step-names-frozen`, `911-ship-red-ci-next-step-flag`, `911-ship-strategy-field-removal-via-907`

### Database Migrations

None — no database.

### Workflow

The ship workflow loses Steps 11-12, renumbers 13-14 to 11-12, and holds `NEXT_STEP` on every red-CI stop.

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **Existence Check:** the file exists (984 lines).
- **Header:**
  - **Resume:** delete the sentence "`after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS."; the shared clause and the Step 3 return stay.
  - **Limits:** replace "Within the limit, `ask` applies only before a failure fix round, never to a refusal that just needs CI again or to the regenerate round, which no model decides." with "Within the limit, ship never asks."
  - **Locks** and **Worktrees:** "Step 14" → "Step 12".
- **Failure Path:**
  - Step 1: add `--next-step="{NEXT_STEP}"` to the `workflows fail` fence, with "drop `--next-step` when `NEXT_STEP` is not held" in the flag list.
  - Step 4: drop the two `ship-failure-*` globs from the abort-handover `Read:` line.
  - Step 6: "**If** `NEXT_STEP` is held → end the final message with the line `Next step: {NEXT_STEP}`."
- **Step 2:** the MERGED route "→ Step 13" → "→ Step 11".
- **Step 10 sub-step 1:**
  - Regenerable arm (exit 12, `regenerable` = true): the regenerate `Else` arm holds `NEXT_STEP` = `/bkit-debug {FID}` when `REGEN_OUTCOME` = `unchanged` or `undeclared`, then → **Failure Path**; the used-up `Else` arm (exit 1) holds it too.
  - New arm before the final `Else`: "**If** exit 12 → the CI run is red; hold `NEXT_STEP` = `/bkit-debug {FID}` → **Failure Path**."
  - The final `Else` lists 13, 15, 16, 18 or 20.
- **Step 10 sub-step 4:** "→ Step 13" → "→ Step 11"; delete "Recoverable merge refusals never enter Steps 11–12."
- **Merge Question:**
  - Lead line: "Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)."
  - Q1 keeps only the used-up-limit wording; the `**Else**` variant is deleted.
  - The two `Try again` arms become one: grant, clear `LIMIT_NEXT`, go to the step it named.
- **Delete** `## 🧠 Step 11 — Failure Diagnose` and `## 🧠 Step 12 — Failure Remediate`, with their gates.
- **Renumber** `## 🤖 Step 13 — Update Local Dev` → Step 11 (`--number=11`, `### 🔒 Gate 11`), and `## 🤖 Step 14 — Close Workflow` → Step 12 (`--number=12`, `### 🔒 Gate 12`).
- **Step 12 (Close Workflow) sub-step 1:** add `Route:` after the `runs gate --squash-of ... --capstone-only` fence: exit 0 → hold `head` as `SQUASH_SHA` → sub-step 2; exit 12 → the squash commit's CI is red, hold `NEXT_STEP` = `/bkit-debug {FID}` → **Failure Path**; **Else** → **Failure Path**. The `Else` arm is today's behaviour through the header rule "Exit non-zero with no `Route:` → **Failure Path**".

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.ts`

- **Existence Check:** the file exists.
- `WORKFLOW_STEPS.ship`: delete the `ship-failure-diagnose` (11) and `ship-failure-remediate` (12, `resumeAt: ship-merge-pr`, `resumeOnVerdict: PASS`) entries and their comments; `ship-switch-to-dev` → 11, `ship-close-workflow` → 12; the "a merged PR goes on to Step 13" comment → Step 11.
- No `RETIRED_STEPS` entry: `resumePoint` already ignores rows of steps the table lacks.

#### [MODIFY] `.bkit/core/engine/commands/workflow/steps.ts`

- **Existence Check:** the file exists.
- `ROW_FIELDS`: delete `"ship/ship-failure-diagnose"` and `"ship/ship-failure-remediate"`.
- `progressPoint`: the `ship.merge` check list becomes `["ship-merge-pr"]`.

#### [MODIFY] `.bkit/core/engine/checks/status-holes.ts`

- **Existence Check:** the file exists.
- `SHIP_STEP_ORDER`: drop the two keys. Delete `RETRY_LOOP_STEPS` and its four filters. The header comment and the `MERGED_ON_ENTRY_SKIP` comment cite Steps 11-12 by the new numbers and drop the retry-loop note.

#### [MODIFY] `.bkit/core/engine/commands/workflow/workflows.ts`

- **Existence Check:** the file exists; `failVerb` at line 393.
- `failVerb`: read `str(ctx.flags.nextStep)` at the top, beside the `--token needs --fid` check, so a bad value exits before `failState` writes anything. Empty → absent. A value with a line break, or one not starting `/bkit-` → `CommandError(EXIT.USAGE, "--next-step must be one /bkit-* command line")`.
- The `buildComment` call passes `lines` = one line, `Next step: ` followed by the value in backticks, when the value is held.
- `ctx.emit` adds `nextStep` (the value, or `null`).
- The `fail` verb's flag spec and output doc gain `--next-step` / `nextStep`, which `pnpm cli:sync` copies into `.bkit/core/.bkit/cli.md`.
- `.bkit/core/engine/commands/workflow/issues.ts` (`buildComment`, `CommentInput.lines`) is reused unchanged.

### Tests

#### [MODIFY] the tests the runbook names

- `audits/workflows/workflow-shape.test.ts`, `audits/workflows/ship-invariants.test.ts`, `audits/workflows/counter-prose-audit.test.ts`, `commands/workflow/step-table.test.ts`, `commands/workflow/steps.test.ts`, `checks/status-holes.test.ts` and `commands/workflow/workflows.test.ts`, all under `.bkit/core/engine/`; and the regenerated baseline `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`.

### Docs and agent copies

#### [MODIFY] the docs in `Documentation Updates`

- The catalog, prompts, README and templates sources under `.bkit/core/.bkit/`; `docs/testing.md`; `docs/deployments.md`; `docs/setup.md`; `.bkit/instructions.md`; and the three `utility-pre-release-check` agent copies.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `## 🧠 Step 11 — Failure Diagnose` and `## 🧠 Step 12 — Failure Remediate`, with their gates, in `.bkit/core/workflows/bkit-ship.md` | The Failure Path with `NEXT_STEP` = `/bkit-debug {FID}` | DELETE | No route reaches them; decision `911-ship-failed-merge-steps-removed` (Task 1) |
| The Merge Question's "diagnosis found no clear cause" Q1 variant and its separate `Try again` arm | The used-up-limit Q1 and the grant arm | DELETE | Asked only from the removed Step 11 (Task 1) |
| `ship-failure-diagnose` and `ship-failure-remediate` in `WORKFLOW_STEPS.ship` in `.bkit/core/engine/commands/workflow/step-table.ts` | The existing ignore rule for rows of removed steps | DELETE | Task 1 |
| `"ship/ship-failure-diagnose"` and `"ship/ship-failure-remediate"` in `ROW_FIELDS`, and the two names in `progressPoint`, in `.bkit/core/engine/commands/workflow/steps.ts` | — | DELETE | Task 1 |
| The two keys in `SHIP_STEP_ORDER`, and `RETRY_LOOP_STEPS` with its filters, in `.bkit/core/engine/checks/status-holes.ts` | — | DELETE | Task 1 |
| The two entries in `COUNTER_STEP_MAP` (`counter-prose-audit.test.ts`), the two keys in `CANONICAL_SHIP_STEP_KEYS` (`ship-invariants.test.ts`), and the test "ship takes a merge fix round without asking when the diagnosis found the cause" (`workflow-shape.test.ts`) | — | DELETE | Task 1 |
| `retryLoopPathBStatus` and the "does NOT flag absence of failure-diagnose/remediate" checks (`status-holes.test.ts`) | The test that old rows are `unexpected` and nothing is `missing` | DELETE | Task 1 |
| The two `ship-failure-*` rows and the Step 11-12 sentences in the `/bkit-ship` catalog (`.bkit/core/.bkit/workflows.md`) | — | DELETE | Task 4 |
| The `ship-failure-*` globs in the Failure Path's abort-handover `Read:` line | — | DELETE | Task 1; no new run writes those files |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` (source of `.bkit/workflows.md`) | "14 steps" → 12 in the overview and the `### \`/bkit-ship\` — 12 steps` heading; delete the Step 11-12 table rows, the `Ship merge loop` row of the fix-loop table, the resume bullet for a last `ship-failure-remediate` row, and every sentence naming the failure round (pre-merge pushes, "These refusals do not enter CI diagnosis or remediation.", the Step 12 fix commit); renumber Step 13/14 citations to 11/12; the `ship.merge` Asks column and the `merge` owner-pause reason name only the used-up limit; "canonical 14 step keys" → 12 |
| `.bkit/core/.bkit/prompts.md` | The sentence naming the agents' callers drops "Ship Steps 11-12" |
| `.bkit/core/.bkit/README.md` | Ship's step count 14 → 12 |
| `.bkit/core/.bkit/templates.md` | The `§ \`/bkit-ship\` — 14 steps` reference → 12 steps |
| `.bkit/core/.bkit/cli.md` | Regenerated by `pnpm cli:sync`: the `fail` flag list gains `--next-step` |
| `docs/testing.md` | "canonical 14 step keys" → 12; the pre-merge push list drops "Failure Remediate" |
| `docs/deployments.md` | Drop "and a Failure Remediate fix"; "Step 14" → Step 12 |
| `docs/setup.md` | The `§ \`/bkit-ship\` — 14 steps` reference → 12 steps |
| `.bkit/instructions.md` | Hand-rewrite the `bkit-ship.md` `- source:` block (delete the lines for the removed steps, renumber the rest), per knowledge row `renumbering-a-workflow-leaves-instructions-md-local-entries-stale`; the pre-release-check example names a debug step key instead of `ship-failure-remediate` |
| `.claude/agents/utility-pre-release-check.md`, `.opencode/agents/utility-pre-release-check.md`, `.codex/agents/utility-pre-release-check.toml` | The same example, changed by hand in all three copies |
| `docs/decisions.jsonl` | Written at plan time: `911-ship-failed-merge-steps-removed`, `911-ship-steps-renumbered`, `467-ship-step-names-frozen` (same-key update), `911-ship-red-ci-next-step-flag` |
| `docs/deferrals.jsonl` | Written at plan time: `911-ship-strategy-field-removal-via-907` |
| `docs/knowledge.jsonl`, `docs/architecture.md`, `docs/technology.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` | No change: no new learning, file kind, library, schema, UI or log |

## Rollback Strategy

Code-only — `git revert` sufficient.

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | None | No database |
| **Code** | `git revert {COMMIT}` of the change's commits, then `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` to refresh `dist/` and the mirrors | A status file written after the change holds no `ship-failure-*` row, so the reverted engine reads it unchanged |
| **Risk window** | None | Consumers get the change only with a bkit release |

## Agent Execution Runbook

**Integration shape (advice only):** one PR for all five tasks is fine; a commit per task keeps each regenerated mirror beside its source change.

**Regenerate after a `bkit-ship.md` edit** (named `REGEN` below; run in this order):

1. Hand-rewrite the `bkit-ship.md` `- source:` block in `.bkit/instructions.md` to match the edited workflow (knowledge row `renumbering-a-workflow-leaves-instructions-md-local-entries-stale`).
2. `pnpm tsx .bkit/core/engine/tools/instructions.ts` (check only), then `pnpm instructions:sync` once the check names only the intended lines.
3. `pnpm build`, then `pnpm tsx .bkit/core/engine/cli.ts upgrade` to refresh the mirrors and `dist/`.
4. `pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u -t "bkit-ship: the none render matches its baseline byte for byte"`, never `pnpm bkit:generate` (it would fold the four other baselines' unrelated drift into this change).

<!-- bkit:group 1 start -->

### TASK GROUP 1: Remove ship Steps 11-12

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Remove Failure Diagnose and Failure Remediate from the ship workflow and the engine, and renumber Steps 13-14 to 11-12
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the header (Resume, Limits, Locks, Worktrees), the Failure Path step 4 `Read:` line, the Step 2 and Step 10 routes, the Merge Question, the deleted Steps 11-12, and the renumbered Steps 11-12, per `Architecture & Component Changes` § Workflow (the `NEXT_STEP` lines are Task 3)
  - **UPDATE:** `WORKFLOW_STEPS` in `.bkit/core/engine/commands/workflow/step-table.ts`: delete the two ship failure entries, renumber `ship-switch-to-dev` 11 and `ship-close-workflow` 12, fix the "Step 13" comment
  - **UPDATE:** `ROW_FIELDS` in `.bkit/core/engine/commands/workflow/steps.ts`: delete the two ship failure entries
  - **UPDATE:** `progressPoint` in `.bkit/core/engine/commands/workflow/steps.ts`: the `ship.merge` check list becomes `ship-merge-pr` alone
  - **UPDATE:** `SHIP_STEP_ORDER` in `.bkit/core/engine/checks/status-holes.ts`: drop the two keys, and renumber the header and `MERGED_ON_ENTRY_SKIP` comments
  - **DELETE:** `RETRY_LOOP_STEPS` in `.bkit/core/engine/checks/status-holes.ts`: the list and its four filters
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: add the Step 1-12 shape test and the Merge Question test; the `--require=strategy` test expects four sites; `Step 14 — Close Workflow` / `Step 13 — Update Local Dev` section matchers → Step 12 / Step 11; delete "ship takes a merge fix round without asking when the diagnosis found the cause"
  - **UPDATE:** `CANONICAL_SHIP_STEP_KEYS` in `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: 12 keys, with its comment and describe titles at 12; the push-timing list drops Failure Remediate; "wires bkit ledgers into exactly 2 bash regions" → 1; the `Step 11` exclusion in the gate-movement test names `Failure Diagnose`; `Step 14.3 labels skip` → Step 12
  - **UPDATE:** `COUNTER_STEP_MAP` in `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts`: delete the two ship failure entries
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.test.ts`: replace the `it.each` "a ship failure-remediate %s row resumes at %o" with the old-row test; `runProgress all workflow numbers` uses ship total 12
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: "names every missing field at once" uses `build-failure-remediate`
  - **UPDATE:** `.bkit/core/engine/checks/status-holes.test.ts`: delete `retryLoopPathBStatus`, the retry-loop exclusions in `computeMandatoryForPath` and "does NOT flag absence of failure-diagnose/remediate (retry-loop steps)"; replace "retry-loop Path B: no holes (failure steps optional)" with the old-row test; the "Step 13" comments → Step 11
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: in `bkit workflows summary`, add the summary guard test
  - **UPDATE:** `.bkit/instructions.md`: the `bkit-ship.md` `- source:` block, through `REGEN`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated through `REGEN`
  - **READ:** `resumePoint` in `.bkit/core/engine/commands/workflow/step-table.ts`: the ignore rule for rows of removed steps
  - **DONE WHEN:** `grep -n 'ship-failure\|Failure Diagnose\|Failure Remediate' .bkit/core/workflows/bkit-ship.md .bkit/core/engine/commands/workflow/step-table.ts .bkit/core/engine/commands/workflow/steps.ts .bkit/core/engine/checks/status-holes.ts` prints nothing; `REGEN` ran; `pnpm vitest run` on `workflow-shape.test.ts`, `ship-invariants.test.ts`, `counter-prose-audit.test.ts`, `step-table.test.ts`, `steps.test.ts`, `status-holes.test.ts`, `workflows.test.ts`, `trackers.test.ts` and `.bkit/core/engine/tools/instructions-coverage.test.ts` passes, including `bkit-ship.md — canonical 12 ship-* step-key set` and `bkit workflows summary` `lists ship-failure rows from a run started before their removal`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship has no Failure Diagnose or Failure Remediate step and runs Steps 1-12` fails on the heading "Step 11 — Failure Diagnose" still being present
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `status route --require=strategy is used at exactly the four strategy-routing sites` fails on the site list still holding "ship-failure-remediate"
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship asks the Merge Question only when the merge attempts are used up` fails on the Merge Question still holding "the diagnosis found no clear cause"
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `bkit status resume ignores ship rows for the removed failure steps` fails on a remediate `PASS` row resuming at `ship-failure-remediate` instead of `ship-merge-pr`
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `workflow progress runProgress all workflow numbers` fails on the ship line reading "Step 3/14 Base Check"
    - `.bkit/core/engine/checks/status-holes.test.ts` `detectHoles reports a pre-change run's ship-failure rows as unexpected and no step as missing` fails on `ship-failure-diagnose` being accepted as a known step instead of listed as unexpected

<!-- bkit:task 1 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Name `/bkit-debug` when ship stops on a red CI run

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Add `--next-step` to `bkit workflows fail`
  - **UPDATE:** `failVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`: validate `--next-step` before `failState` (empty → absent; a line break or no `/bkit-` prefix → `EXIT.USAGE` with "--next-step must be one /bkit-* command line"), pass the `Next step:` line through `CommentInput.lines`, emit `nextStep`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.ts`: the `fail` verb spec gains the `next-step` flag with its help text, and `nextStep` in the output doc
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: three tests in `bkit workflows fail`
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: regenerated by `pnpm cli:sync`
  - **READ:** `buildComment` in `.bkit/core/engine/commands/workflow/issues.ts`: appends `lines` after the links
  - **READ:** `CommentInput` in `.bkit/core/engine/commands/workflow/issues.ts`: the optional `lines` field
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the `fail` spec in `workflows.ts` declares `next-step`; `.bkit/core/.bkit/cli.md` names `--next-step` in the `fail` flag list; `pnpm build` and `pnpm tsx .bkit/core/engine/cli.ts upgrade` refreshed `dist/` and the mirrors; `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep` fails on the comment missing "Next step: `/bkit-debug"
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write` fails on the refusal not naming "must be one /bkit-* command line", or on a `workflow-failed` row being written
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail treats an empty --next-step as absent` fails on the flag being refused as unknown, or on `nextStep` not printing null

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Hold `NEXT_STEP` = `/bkit-debug {FID}` on every red-CI stop in ship, and pass it through the Failure Path
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Step 10 sub-step 1 exit-12 arms (new non-regenerable arm; the regenerate `Else` arm on `unchanged` / `undeclared`; the used-up regenerable arm), the Step 12 (Close Workflow) sub-step 1 `Route:`, and Failure Path steps 1 and 6, per `Architecture & Component Changes` § Workflow
  - **UPDATE:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`: three tests in `bkit-ship.md — Failure Path single-write contract` or a new `bkit-ship.md — red CI names /bkit-debug` describe
  - **UPDATE:** `.bkit/instructions.md`: the `bkit-ship.md` `- source:` block, through `REGEN`
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`: regenerated through `REGEN`
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** `REGEN` ran; `pnpm vitest run` on `ship-invariants.test.ts`, `workflow-shape.test.ts`, `trackers.test.ts` and `instructions-coverage.test.ts` passes; `grep -c 'NEXT_STEP' .bkit/core/workflows/bkit-ship.md` counts the Step 10 arms, the Step 12 arm and the two Failure Path uses
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path, and on no other` fails on the exit-12 arm reaching the Failure Path with "no NEXT_STEP held"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP` fails on sub-step 1 having "no Route: after runs gate --capstone-only"
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it` fails on the `workflows fail` fence lacking "--next-step="

<!-- bkit:task 3 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Docs and hand-authored copies

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Rewrite the bkit docs that ship with the package
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: every item in its `Documentation Updates` row
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the cross-phase reuse sentence drops "Ship Steps 11-12" and "in-ship merge failures"
  - **UPDATE:** `.bkit/core/.bkit/README.md`: the Ship row's step count 14 → 12
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: the `§ \`/bkit-ship\` — 14 steps` reference → 12 steps
  - **DEPENDS ON:** 1, 3
  - **DONE WHEN:** `grep -n 'ship-failure\|Ship Steps 11\|bkit-ship\` — 14\|14 steps' .bkit/core/.bkit/workflows.md .bkit/core/.bkit/prompts.md .bkit/core/.bkit/templates.md` prints nothing; the README Ship row reads 12; `pnpm tsx .bkit/core/engine/cli.ts upgrade` refreshed the mirrors, and `pnpm tsx .bkit/core/engine/cli.ts check` reports no mirror drift
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Rewrite the repo docs and the hand-authored `utility-pre-release-check` copies
  - **UPDATE:** `docs/testing.md`: "canonical 14 step keys" → 12; the pre-merge push list drops "Failure Remediate"
  - **UPDATE:** `docs/deployments.md`: drop "and a Failure Remediate fix"; the Step 14 citations → Step 12
  - **UPDATE:** `docs/setup.md`: the `§ \`/bkit-ship\` — 14 steps` reference → 12 steps
  - **UPDATE:** `.bkit/instructions.md`: the pre-release-check example names a debug step (`debug-failure-remediate` must read `debug-failure-diagnose`) instead of `ship-failure-remediate`
  - **UPDATE:** `.claude/agents/utility-pre-release-check.md`: the same example, by hand
  - **UPDATE:** `.opencode/agents/utility-pre-release-check.md`: the same example, by hand
  - **UPDATE:** `.codex/agents/utility-pre-release-check.toml`: the same example, by hand
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -rn 'ship-failure\|Failure Remediate fix\|bkit-ship\` — 14' docs/testing.md docs/deployments.md docs/setup.md .bkit/instructions.md .claude/agents/utility-pre-release-check.md .opencode/agents/utility-pre-release-check.md .codex/agents/utility-pre-release-check.toml` prints nothing; the three agent copies hold the same example line; `pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts` passes
  - **TEST FIRST:** n/a — docs and agent prompt wording only, no behaviour change

<!-- bkit:task 5 end -->

<!-- bkit:group 3 end -->

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
- [ ] **Test Synchronization:** no E2E test exists for these surfaces; the markdown-invariant tests (`workflow-shape.test.ts`, `ship-invariants.test.ts`, `counter-prose-audit.test.ts`) and `instructions-coverage.test.ts` change with the workflow in Tasks 1 and 3.
- [ ] **Build Configuration:** `tsconfig.json` `exclude` keeps `**/*.test.ts` out of `dist/`; no test-only file is added.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/step-table.test.ts`, `.bkit/core/engine/checks/status-holes.test.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`):** the old-row resume, the 12-step progress line, the `unexpected` report, the summary guard and the three `--next-step` tests, each on a temporary status file the test writes.
- [ ] **Unit (`.bkit/core/engine/render/trackers.test.ts`):** only `bkit-ship.none.txt` changes; `git diff --stat .bkit/core/engine/render/__snapshots__/` lists no other baseline.
- [ ] **Advisory hole sweep:** `pnpm bkit:audit:status` exits 0, and `docs/plans/202610/logs/719-cloud-variants-add/status.jsonl` lists its `ship-failure-*` rows under `unexpected` and nothing new under `missing`.
- [ ] **Apply local migrations:** not applicable — no database.
- [ ] **Run all tests:** `pnpm test` passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** After `pnpm build`, copy `docs/plans/202610/logs/719-cloud-variants-add/status.jsonl` to a scratch path, cut the copy after its last `ship-failure-*` row (its runs ended, so the cut leaves one `IN_PROGRESS` run), and run `node dist/cli.js status resume --workflow=ship --file={copy}`: it exits 0 and names `ship-merge-pr` / Step 10, not a failure step.
- [ ] **Step 2:** Run `node dist/cli.js workflows summary` on the same copy: it exits 0 and lists the old `ship-failure-*` rows.
- [ ] **Step 3:** Run `node dist/cli.js workflows fail --workflow=ship --step-number=10 --step-title="Merge Gate + Merge PR" --error="CI red" --next-step="/bkit-debug 911-ship-failed-merge"` in a scratch repo: the printed comment ends with ``Next step: `/bkit-debug 911-ship-failed-merge` `` and `nextStep` holds the value; `--next-step="git push"` exits 2.
- [ ] **Step 4:** Pack the package (`pnpm pack`), install it into a clean scratch consumer with `bkit install`, and read the rendered `.claude/commands/bkit-ship.md`: no Failure Diagnose or Failure Remediate step, Steps 1-12, and `NEXT_STEP` on the Step 10 exit-12 arms and the Step 12 capstone route.
- [ ] **Step 5:** Run `bkit upgrade` in an existing scratch consumer on the previous release: the upgraded `bkit-ship.md` matches Step 4's render.
