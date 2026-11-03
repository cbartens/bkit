# Brief: group 2 — Plan Current posts on both routes

Plan: Build Step Comments Carry Their Own Numbers Implementation Plan

## Why and what

### Context & Goals

A `/bkit-build` run's issue comments must line up one-to-one with the workflow's numbered steps. Today Plan Convert hides inside Branch Sync's Step 3 and posts under its number and heading, and Plan Current posts nothing when `anchor-read` self-skips, so a run's comments jump Step 3 to Step 5 with two Step 3 posts.

Plan Convert becomes its own Step 4, Branch Sync keeps Step 3, Plan Current moves to Step 5 and posts on both routes, and every later step shifts by one: Steps 5-15 become 6-16.

**Related Issues:**

- `#705` — build step comments get their own numbers (this plan).
- `#703` — the run the defect was found in (the comment sequence and status rows cited in the input).

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| When a plan must be converted, the plan check, the convert prompt's scope | The step only moves to its own number; its rules stay as they are | follow-up issue if a rule proves wrong |
| Stamping a `bkit:anchor` during `/bkit-build` | A converted plan carries no anchor by design; Plan Current names the skip instead | `/bkit-plan` (the workflow that stamps anchors) |
| Any other workflow's step numbering | Design, plan, debug, ship and auto are untouched | separate issue per workflow |

## Where it fits

- Group 1: Plan Convert becomes its own numbered step — done
  - TASK 1: Split Branch Sync and Plan Convert into Steps 3 and 4 and renumber the build to sixteen steps — done
- Group 2: Plan Current posts on both routes — this group
  - TASK 2: Post a Plan Current comment whether the step runs or self-skips — open
- Group 3: Shipped reference and generated copies — next
  - TASK 3: Record the new step in the shipped workflow catalogue and re-sync the clauses drawn from it — open
  - TASK 4: Regenerate the host mirrors and the built CLI — open
  - TASK 5: Bring the testing doc and the knowledge ledger onto the new step numbers — open

## The work

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Post a Plan Current comment whether the step runs or self-skips
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 5 — Plan Current's `anchor-read` exit 12 route finishes the step with no `--agent` and no artifact, posting `--comment-field="Status=skipped (no plan anchor)"` under `--number=5 --post --title="Plan Current"` before moving on; its exit 0 route keeps the agent, its `--number=5` finish and the plan-currency advisory; the gate names both routes
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: a test holding both routes to a `--post` finish and the skip's own status field
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`: regenerated from the edited workflow
  - **DEPENDS ON:** 1
  - **DONE WHEN:** Step 5 carries two `steps finish --step=build-plan-current` calls, both `--number=5 --post`, the skip one naming no `--agent` and carrying the `Status=skipped (no plan anchor)` comment field; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/render/trackers.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Current posts a comment whether it runs or skips` fails on the exit-12 route posting nothing
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Current's skipped comment says no plan anchor` fails on the skip's comment carrying no status field
    - `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` fails on the baseline still showing one Plan Current finish

<!-- bkit:task 2 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Split Branch Sync and Plan Convert into Steps 3 and 4 and renumber the build to sixteen steps — `.bkit/core/workflows/bkit-build.md`, `.bkit/core/engine/commands/workflow/step-table.ts`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `.bkit/core/engine/commands/workflow/step-table.test.ts`, `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A numbered step that runs a subagent and posts its own comment | `.bkit/core/workflows/bkit-build.md` | `grep -n "Step [0-9]\|--number=[0-9]\|step-number=" .bkit/core/workflows/bkit-build.md`; read Steps 3-5 and the Decision Pause routes | Step 4 — Plan Current and Step 5 — Install Skills — one heading, sub-steps, one `steps finish --number=` each | EXTEND | Plan Convert copies that shape as its own section; no new workflow file |
| A step comment posted without a subagent artifact or verdict | `.bkit/core/workflows/bkit-build.md` (verb: `bkit steps finish`) | `grep -rn "comment-field" .bkit/core`; read `steps.ts` finish flags and `issues.ts` `buildComment` | `steps finish --comment-field` / `--post` / `--number` — prints `- {Name}: {value}` on the heading line, writes a row, commits allow-empty, needs no `--agent` | EXTEND | Plan Current's skip posts through that existing flag set; no new verb, no engine change |
| A test holding a workflow's headings, `--step=` calls and comment numbers together | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | read `describe("resume")` `stepSections` test and the `Step 3 — Branch Sync` section assertions | `stepSections` + `WORKFLOW_STEPS` already compare headings and `--step=`; no test compares `--number` | EXTEND | the existing comparison gains a `--number` case and retargeted sections |

### Architecture entries

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- Step 3 — Branch Sync keeps `branches sync --merge-docs` alone and finishes `--step=build-branch-sync … --number=3 --post --title="Branch Sync" --tree={BRANCH}`; its gate drops the plan-check and convert items.
- New Step 4 — Plan Convert takes the plan check (`tests plan-check --existence=report`), the route on exit 0 / exit 2 / markers / `NEWER_COMMENTS` / `CONVERTED` / `CONVERT_RETRY`, the `@bkit-build-plan-convert` dispatch with its unchanged Context / Read / Create lines, and the re-check after its finish; the finish posts `--step=build-plan-convert … --number=4 --post --title="Plan Convert"`. Its gate names the plan check, the conditional convert and the mechanical checks. A run whose plan is valid with no newer comments writes no row and posts no comment.
- Step 5 — Plan Current (moved from 4): `anchor-read` exit 12 finishes the step with no agent, posting `- Status: skipped (no plan anchor)` under `--number=5 --post --title="Plan Current"`, then moves on; exit 0 keeps the agent, its `--number=5` finish and the advisory.
- Every later heading (`## Step N — Title`), section gate label, `--number=`, the Create PR comment's `--step-number=`, routing jump (`→ Step N`), Resume contract reference (Build Challenge's and the challenge-merge sub-steps), the Plan contract line, the Group Loop section (`Steps 6-8` → `Steps 7-9`) and the Decision Pause routes take their new number. The Failure Path's `--step-number={N}` placeholder stays generic, so it needs no edit.

#### [MODIFY] `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

- The plan-check, convert-dispatch, `markers` and `newerThanPlan` assertions move from `/Step 3 — Branch Sync/` to `/Step 4 — Plan Convert/`; the `workflows input` absence assertion follows the plan check into Step 4.
- New: every `steps finish` line's `--number` equals the step table row its `--step` names; the convert step's line carries `--number=4` and `--title="Plan Convert"`; Step 3 holds `branches sync --merge-docs` and no `tests plan-check`; Step 4 skips a valid plan with no newer comments; Step 5 carries a `--post` finish on both routes, the skip one naming no `--agent`.

#### [MODIFY] `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`

- Regenerated from the edited workflow (`pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u`).
