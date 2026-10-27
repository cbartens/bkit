# Build Step Comments Carry Their Own Numbers Implementation Plan

## Context & Goals

A `/bkit-build` run's issue comments must line up one-to-one with the workflow's numbered steps. Today Plan Convert hides inside Branch Sync's Step 3 and posts under its number and heading, and Plan Current posts nothing when `anchor-read` self-skips, so a run's comments jump Step 3 to Step 5 with two Step 3 posts.

Plan Convert becomes its own Step 4, Branch Sync keeps Step 3, Plan Current moves to Step 5 and posts on both routes, and every later step shifts by one: Steps 5-15 become 6-16.

**Related Issues:**

- `#705` — build step comments get their own numbers (this plan).
- `#703` — the run the defect was found in (the comment sequence and status rows cited in the input).

## Acceptance Criteria

- A `/bkit-build` on an issue with no plan posts a **Plan Convert** comment under the Plan Convert step's own number, and the following comments are Branch Sync, Plan Current, Install Skills, … in order.
- A run whose plan is already valid (no conversion) posts no Plan Convert comment.
- A run whose plan is converted posts a **Plan Current** comment — a "skipped (no plan anchor)" comment when `anchor-read` exits 12.
- No comment heading reads `Step N — Branch Sync` for the convert step.
- No number is reused for two different steps, except the intended pairs: Plan Verify + Group Gate at one number, Create PR + Close Workflow at one number, and the Decision Pause carrying its paused step's number.
- `workflow-shape.test.ts` and `step-table.ts` agree with the workflow headings and `--step=` calls; `pnpm test`, `pnpm typecheck`, `pnpm lint:prose`, `pnpm format:check` pass; `dist/` rebuilt; mirrors regenerated and consistent (`pnpm bkit check`).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| When a plan must be converted, the plan check, the convert prompt's scope | The step only moves to its own number; its rules stay as they are | follow-up issue if a rule proves wrong |
| Stamping a `bkit:anchor` during `/bkit-build` | A converted plan carries no anchor by design; Plan Current names the skip instead | `/bkit-plan` (the workflow that stamps anchors) |
| Any other workflow's step numbering | Design, plan, debug, ship and auto are untouched | separate issue per workflow |

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A workflow's ordered steps and their resume targets | `.bkit/core/engine/commands/workflow/step-table.ts` | `grep -n "build-branch-sync\|build-plan-convert\|build-plan-current" .bkit/core/engine`; read `WORKFLOW_STEPS` build rows; read `step-table.test.ts` | `WORKFLOW_STEPS.build` — holds every build row, its number, title and `resumeAt`; `workflow-shape.test.ts` already holds it to the headings | EXTEND | the split row set lands in the same table; no new table or field |
| A numbered step that runs a subagent and posts its own comment | `.bkit/core/workflows/bkit-build.md` | `grep -n "Step [0-9]\|--number=[0-9]\|step-number=" .bkit/core/workflows/bkit-build.md`; read Steps 3-5 and the Decision Pause routes | Step 4 — Plan Current and Step 5 — Install Skills — one heading, sub-steps, one `steps finish --number=` each | EXTEND | Plan Convert copies that shape as its own section; no new workflow file |
| A step comment posted without a subagent artifact or verdict | `.bkit/core/workflows/bkit-build.md` (verb: `bkit steps finish`) | `grep -rn "comment-field" .bkit/core`; read `steps.ts` finish flags and `issues.ts` `buildComment` | `steps finish --comment-field` / `--post` / `--number` — prints `- {Name}: {value}` on the heading line, writes a row, commits allow-empty, needs no `--agent` | EXTEND | Plan Current's skip posts through that existing flag set; no new verb, no engine change |
| A test holding a workflow's headings, `--step=` calls and comment numbers together | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | read `describe("resume")` `stepSections` test and the `Step 3 — Branch Sync` section assertions | `stepSections` + `WORKFLOW_STEPS` already compare headings and `--step=`; no test compares `--number` | EXTEND | the existing comparison gains a `--number` case and retargeted sections |
| A resume that re-runs a step instead of moving on | `.bkit/core/engine/commands/workflow/step-table.ts` | read `resumeAt` consumers in `status.ts`; `build-plan-verify` / `build-challenge` rows | `resumeAt: "build-branch-sync"` today — resumes at the plan re-check | EXTEND | `resumeAt: "build-plan-convert"` points the same mechanism at the re-check's new home |
| The shipped catalogue of build steps | `.bkit/core/.bkit/workflows.md` | `grep -n "plan-convert\|Branch Sync\|Plan Current" .bkit/core/.bkit/workflows.md`; read the build step table, § Anchor Block, § Cross-step invariants | the build step table rows 1-15, the agent rows, the "No plan" note | EXTEND | rows renumbered and a Plan Convert row added in the same table |
| The mirrored clauses drawn from the catalogue | `.bkit/instructions.md` | `grep -n "source: \`.bkit/core/.bkit/workflows.md\`" .bkit/instructions.md`; `pnpm instructions:show --file workflows` | § Cross-step invariants mirror carries "build Steps 9, 10" and "group verify (Step 7)" | EXTEND | `pnpm instructions:sync` rewrites it from the edited catalogue |
| The stale step reference in the knowledge ledger | `docs/knowledge.jsonl` | `grep -n "plan-line-anchors" docs/knowledge.jsonl`; read `.bkit/core/.bkit/jsonl.md` § Updating a Row and § Writers | the winning `plan-line-anchors-…` row cites `build Step 4 — Plan Current` | EXTEND | a same-`key` append corrects the reference; lines are never edited |

## Architecture & Component Changes

**Ledger rows:** None.

### Step numbering

One split plus one uniform shift, applied to the workflow, the engine table and every cross-reference:

<!-- prettier-ignore -->
| today | after | step name |
| --- | --- | --- |
| 1 | 1 | Start Workflow |
| 2 | 2 | Worktree Setup |
| 3 (convert + sync) | 3 | Branch Sync |
| — | 4 | Plan Convert |
| 4 | 5 | Plan Current |
| 5 | 6 | Install Skills |
| 6 | 7 | Plan Execute |
| 7 | 8 | Plan Verify (+ group gate) |
| 8 | 9 | Plan Gaps Remediate |
| 9 | 10 | Plan Verify Holistic |
| 10 | 11 | Build Challenge |
| 11 | 12 | Run Tests |
| 12 | 13 | Failure Diagnose |
| 13 | 14 | Failure Remediate |
| 14 | 15 | Summary |
| 15 | 16 | Close Workflow & Create PR |

### Engine

#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.ts`

- **Existence Check:** `WORKFLOW_STEPS.build` holds the build rows today, with `build-plan-convert` and `build-branch-sync` both at number 3, title `Branch Sync`.
- `build-branch-sync` keeps number 3, title `Branch Sync`, no `resumeAt` (it is now the step before the convert).
- `build-plan-convert` takes number 4, title `Plan Convert`, `resumeAt: "build-plan-convert"` — a run whose last DONE row is the convert resumes at the plan re-check, now inside Plan Convert's own step.
- Every later row shifts by one per the table above; `build-create-pr` and `build-close-workflow` both move to 16.
- The `//` comments above the rows stay true: the convert row still resumes at its own re-check, the setup rows still run again.

#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.test.ts`

- The numbers each resume case expects (`build-challenge` 11, `build-plan-execute` 7, `build-plan-verify` 8, `build-plan-gaps-remediate` 9, `build-run-tests` 12, `build-failure-diagnose` 13) follow the table.

### Workflow

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- Step 3 — Branch Sync keeps `branches sync --merge-docs` alone and finishes `--step=build-branch-sync … --number=3 --post --title="Branch Sync" --tree={BRANCH}`; its gate drops the plan-check and convert items.
- New Step 4 — Plan Convert takes the plan check (`tests plan-check --existence=report`), the route on exit 0 / exit 2 / markers / `NEWER_COMMENTS` / `CONVERTED` / `CONVERT_RETRY`, the `@bkit-build-plan-convert` dispatch with its unchanged Context / Read / Create lines, and the re-check after its finish; the finish posts `--step=build-plan-convert … --number=4 --post --title="Plan Convert"`. Its gate names the plan check, the conditional convert and the mechanical checks. A run whose plan is valid with no newer comments writes no row and posts no comment.
- Step 5 — Plan Current (moved from 4): `anchor-read` exit 12 finishes the step with no agent, posting `- Status: skipped (no plan anchor)` under `--number=5 --post --title="Plan Current"`, then moves on; exit 0 keeps the agent, its `--number=5` finish and the advisory.
- Every later heading (`## Step N — Title`), section gate label, `--number=`, the Create PR comment's `--step-number=`, routing jump (`→ Step N`), Resume contract reference (Build Challenge's and the challenge-merge sub-steps), the Plan contract line, the Group Loop section (`Steps 6-8` → `Steps 7-9`) and the Decision Pause routes take their new number. The Failure Path's `--step-number={N}` placeholder stays generic, so it needs no edit.

### Tests

#### [MODIFY] `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

- The plan-check, convert-dispatch, `markers` and `newerThanPlan` assertions move from `/Step 3 — Branch Sync/` to `/Step 4 — Plan Convert/`; the `workflows input` absence assertion follows the plan check into Step 4.
- New: every `steps finish` line's `--number` equals the step table row its `--step` names; the convert step's line carries `--number=4` and `--title="Plan Convert"`; Step 3 holds `branches sync --merge-docs` and no `tests plan-check`; Step 4 skips a valid plan with no newer comments; Step 5 carries a `--post` finish on both routes, the skip one naming no `--agent`.

#### [MODIFY] `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`

- Regenerated from the edited workflow (`pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u`).

### Docs

#### [MODIFY] `.bkit/core/.bkit/workflows.md`

- Build step table: a `4 — Plan Convert` row holding what the convert does today, `3 — Branch Sync` cut back to the docs merge, every later row renumbered; the prose references move with them (§ Anchor Block's `Step 4` → `Step 5`, § Cross-step invariants' build numbers, the Group loop paragraph, the "No plan" note, the convert / plan-current agent rows).

#### [MODIFY] `docs/testing.md`

- The `workflow-shape.test.ts` row names Plan Convert instead of Branch Sync and carries the shifted build step numbers.

#### [MODIFY] `docs/knowledge.jsonl`

- One same-`key` append to the winning `plan-line-anchors-…` row, its `references` and the sentences naming the step reading `Step 5 — Plan Current`; no existing line edited.

### Generated copies

`.bkit/workflows.md`, `.claude/commands/bkit-build.md`, `.cursor/commands/bkit-build.md`, `.opencode/commands/bkit-build.md`, `.agents/skills/bkit-build/SKILL.md`, `.agents/plugins/bkit/skills/bkit-build/SKILL.md` and `dist/` are regenerated from the sources above, never hand-edited.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` | build step table gains Step 4 — Plan Convert and renumbers 3-16; § Anchor Block, § Cross-step invariants, the Group loop paragraph, the "No plan" note and the agent rows follow |
| `.bkit/instructions.md` | re-synced from the catalogue (`pnpm instructions:sync`) |
| `docs/testing.md` | the `workflow-shape.test.ts` row names Plan Convert and the new step numbers |
| `docs/knowledge.jsonl` | same-`key` append correcting the `Step 4 — Plan Current` reference |

## Verification Plan

### Automated Tests

- `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/commands/workflow/step-table.test.ts .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/commands/workflow/steps.test.ts` — heading, table, baseline and row-field agreement.
- `pnpm test` — the full suite, never scoped to the touched files.
- `pnpm typecheck`, `pnpm lint:prose`, `pnpm format:check`, `pnpm build`.
- `pnpm bkit check` — no mirror drift; `pnpm bkit:check:dist` — `dist/` matches the engine sources.

### Manual Verification

- Read the build workflow's headings top to bottom: 1-16, each number carrying one title.
- Read the comment lines: the convert posts `--number=4 --title="Plan Convert"`, Branch Sync `--number=3 --title="Branch Sync"`, Plan Current `--number=5` on both routes, and no other step reuses 3 or 4.

## Rollback Strategy

Code-only — `git revert` of the branch's commits restores the previous numbering; no data, migration or deploy step is involved.

## Security & Privacy

None — no new routes, DB writes, secrets or user input.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### GROUP 1: Plan Convert becomes its own numbered step

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Split Branch Sync and Plan Convert into Steps 3 and 4 and renumber the build to sixteen steps
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: `## 🤖 Step 3 — Branch Sync` keeps `branches sync --merge-docs` and finishes `--step=build-branch-sync … --number=3 --post --title="Branch Sync" --tree={BRANCH}`; the plan check, the `@bkit-build-plan-convert` dispatch and the re-check move into a new `## 🧠 Step 4 — Plan Convert` finishing `--step=build-plan-convert … --number=4 --post --title="Plan Convert"`; Step 5 — Plan Current and every step after it shifts by one in its heading, gate label, `--number=`, the Create PR comment's `--step-number=`, routing jump, Resume reference, Plan contract line, Group Loop paragraph and Decision Pause route
  - **UPDATE:** `WORKFLOW_STEPS` in `.bkit/core/engine/commands/workflow/step-table.ts`: `build-plan-convert` at 4 titled `Plan Convert` with `resumeAt: "build-plan-convert"`, `build-branch-sync` at 3 without `resumeAt`, and rows 5-16 shifted to match the headings
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the plan-check, convert, `markers` and `newerThanPlan` assertions retarget to `/Step 4 — Plan Convert/`, plus tests for Step 3 holding only the docs merge, every finish's `--number` against the step table, and the convert step's own number and title
  - **UPDATE:** `.bkit/core/engine/commands/workflow/step-table.test.ts`: each resume case's expected number follows the table, with cases for the convert, Plan Current and Plan Verify resume points
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated from the edited workflow, never hand-edited
  - **READ:** `.bkit/authoring.md`: the workflow prose rules the new Step 4 section follows
  - **DEPENDS ON:** none
  - **DONE WHEN:** `bkit-build.md` carries the headings `Step 1 — Start Workflow` through `Step 16 — Close Workflow & Create PR` with `3 — Branch Sync` and `4 — Plan Convert`; `WORKFLOW_STEPS.build` numbers and titles match them, `build-plan-convert` at 4 with `resumeAt: "build-plan-convert"`; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/commands/workflow/step-table.test.ts .bkit/core/engine/render/trackers.test.ts .bkit/core/engine/commands/workflow/steps.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Branch Sync merges docs and finishes as its own step` fails on Step 3 still running the plan check and dispatching the convert agent
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Convert checks the plan, converts one with no task markers, and re-checks` fails on no Step 4 section holding the check, the dispatch and the second check
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Convert leaves a valid plan with no newer comments alone` fails on the convert step running for a plan that needs none
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build's comment numbers match the step table` fails on a finish line posting a number its step's row does not carry
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the convert step posts under Plan Convert's number and title` fails on the convert finish posting `--number=3` with Branch Sync's title
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `a build that stopped after Plan Convert resumes at Plan Convert (Step 4)` fails on a run resuming past the plan re-check
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `a build that stopped after Plan Current resumes at Install Skills (Step 6)` fails on Install Skills still numbered 5
    - `.bkit/core/engine/commands/workflow/step-table.test.ts` `a build that stopped after Plan Verify resumes at Plan Verify (Step 8)` fails on the verify loop still numbered 7
    - `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` fails on the baseline still carrying the pre-split Step 3 body
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Branch Sync merges docs and finishes as its own step` fails on Step 3 still running the plan check and dispatching the convert agent — red evidence predates a module-level helper extraction in the same file; test body unchanged (owner, 2026-10-27)
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Convert checks the plan, converts one with no task markers, and re-checks` fails on no Step 4 section holding the check, the dispatch and the second check — red evidence predates a module-level helper extraction in the same file; test body unchanged (owner, 2026-10-27)
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Convert leaves a valid plan with no newer comments alone` fails on the convert step running for a plan that needs none — red evidence predates a module-level helper extraction in the same file; test body unchanged (owner, 2026-10-27)
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build's comment numbers match the step table` fails on a finish line posting a number its step's row does not carry — assertion loop rewritten into equivalent helper calls after the red run; the same three checks hold (owner, 2026-10-27)
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the convert step posts under Plan Convert's number and title` fails on the convert finish posting `--number=3` with Branch Sync's title — red evidence predates a module-level helper extraction in the same file; test body unchanged (owner, 2026-10-27)

<!-- bkit:task 1 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### GROUP 2: Plan Current posts on both routes

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Post a Plan Current comment whether the step runs or self-skips
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 5 — Plan Current's `anchor-read` exit 12 route finishes the step with no `--agent` and no artifact, posting `--comment-field="Status=skipped (no plan anchor)"` under `--number=5 --post --title="Plan Current"` before moving on; its exit 0 route keeps the agent, its `--number=5` finish and the plan-currency advisory; the gate names both routes
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: a test holding both routes to a `--post` finish and the skip's own status field
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated from the edited workflow
  - **DEPENDS ON:** 1
  - **DONE WHEN:** Step 5 carries two `steps finish --step=build-plan-current` calls, both `--number=5 --post`, the skip one naming no `--agent` and carrying the `Status=skipped (no plan anchor)` comment field; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/render/trackers.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Current posts a comment whether it runs or skips` fails on the exit-12 route posting nothing
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Current's skipped comment says no plan anchor` fails on the skip's comment carrying no status field
    - `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` fails on the baseline still showing one Plan Current finish
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Current posts a comment whether it runs or skips` fails on the exit-12 route posting nothing — setup predicate moved into a module-level helper after the red for `vitest(no-conditional-in-test)`; assertions unchanged (owner, 2026-10-27)
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Current's skipped comment says no plan anchor` fails on the skip's comment carrying no status field — same helper extraction after the red; assertions unchanged (owner, 2026-10-27)

<!-- bkit:task 2 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### GROUP 3: Shipped reference and generated copies

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Record the new step in the shipped workflow catalogue and re-sync the clauses drawn from it
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the build step table gains `4 — Plan Convert` holding what the convert does today, `3 — Branch Sync` cut back to the docs merge, rows 5-16 renumbered, and the prose references moved with them (§ Anchor Block, § Cross-step invariants, the Group loop paragraph, the "No plan" note, the convert and plan-current agent rows)
  - **UPDATE:** `.bkit/instructions.md`: re-synced from the edited catalogue with `pnpm instructions:sync`, so the mirrored § Cross-step invariants names the new build step numbers
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the build step table reads steps 1-16 with Plan Convert at 4 and no prose reference to an old number; `grep -n "Plan Convert" .bkit/core/.bkit/workflows.md` shows the new row; `pnpm instructions:sync` leaves the working tree unchanged on a second run; `pnpm vitest run .bkit/core/engine/tools/instructions.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `sync has nothing left to rewrite` fails on the mirrored § Cross-step invariants still naming the old build step numbers

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Regenerate the host mirrors and the built CLI
  - **UPDATE:** `.bkit/workflows.md`: regenerated from `.bkit/core/.bkit/workflows.md`
  - **UPDATE:** `.claude/commands/bkit-build.md`: regenerated from the edited workflow
  - **UPDATE:** `.cursor/commands/bkit-build.md`: regenerated from the edited workflow
  - **UPDATE:** `.opencode/commands/bkit-build.md`: regenerated from the edited workflow
  - **UPDATE:** `.agents/skills/bkit-build/SKILL.md`: regenerated from the edited workflow
  - **UPDATE:** `.agents/plugins/bkit/skills/bkit-build/SKILL.md`: regenerated from the edited workflow
  - **UPDATE:** `dist/cli.js`: rebuilt from the edited engine sources with `pnpm build`
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** `pnpm bkit install --tracker=github` re-renders every installed host and `pnpm build` rewrites `dist/`; `pnpm bkit check` exits 0 with no managed file needing a re-render, and the mirrors carry the `Step 4 — Plan Convert` heading; `pnpm bkit:check:dist` exits 0
  - **TEST FIRST:** n/a — generated copies of sources already tested; `pnpm bkit check` is their gate

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Bring the testing doc and the knowledge ledger onto the new step numbers
  - **UPDATE:** `docs/testing.md`: the `workflow-shape.test.ts` row names Plan Convert instead of Branch Sync and carries the shifted build step numbers
  - **UPDATE:** `docs/knowledge.jsonl`: one same-`key` append through `bkit ledgers append --ledger=knowledge` to the winning `plan-line-anchors-…` row, its `references` and its sentences reading `Step 5 — Plan Current`; no existing line edited, and the row goes in through a writer `.bkit/core/.bkit/jsonl.md` § Ledgers & Writers allows (the plan-execute agent is one)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the `docs/testing.md` row reads `Plan Convert` and no build step number from the old table; `.bkit/core/.bkit/jsonl.md`'s fold reports one entry for that `key` whose newest row names `Step 5 — Plan Current`; `pnpm lint:prose` passes
  - **TEST FIRST:** n/a — docs prose and an append-only ledger row; no behaviour change

<!-- bkit:task 5 end -->

<!-- bkit:group 3 end -->
