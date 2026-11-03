# Brief: group 1 — Plan Convert becomes its own numbered step

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

- Group 1: Plan Convert becomes its own numbered step — this group
  - TASK 1: Split Branch Sync and Plan Convert into Steps 3 and 4 and renumber the build to sixteen steps — open
- Group 2: Plan Current posts on both routes — next
  - TASK 2: Post a Plan Current comment whether the step runs or self-skips — open
- Group 3: Shipped reference and generated copies — later
  - TASK 3: Record the new step in the shipped workflow catalogue and re-sync the clauses drawn from it — open
  - TASK 4: Regenerate the host mirrors and the built CLI — open
  - TASK 5: Bring the testing doc and the knowledge ledger onto the new step numbers — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Split Branch Sync and Plan Convert into Steps 3 and 4 and renumber the build to sixteen steps
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

<!-- bkit:task 1 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| A workflow's ordered steps and their resume targets | `.bkit/core/engine/commands/workflow/step-table.ts` | `grep -n "build-branch-sync\|build-plan-convert\|build-plan-current" .bkit/core/engine`; read `WORKFLOW_STEPS` build rows; read `step-table.test.ts` | `WORKFLOW_STEPS.build` — holds every build row, its number, title and `resumeAt`; `workflow-shape.test.ts` already holds it to the headings | EXTEND | the split row set lands in the same table; no new table or field |
| A numbered step that runs a subagent and posts its own comment | `.bkit/core/workflows/bkit-build.md` | `grep -n "Step [0-9]\|--number=[0-9]\|step-number=" .bkit/core/workflows/bkit-build.md`; read Steps 3-5 and the Decision Pause routes | Step 4 — Plan Current and Step 5 — Install Skills — one heading, sub-steps, one `steps finish --number=` each | EXTEND | Plan Convert copies that shape as its own section; no new workflow file |
| A step comment posted without a subagent artifact or verdict | `.bkit/core/workflows/bkit-build.md` (verb: `bkit steps finish`) | `grep -rn "comment-field" .bkit/core`; read `steps.ts` finish flags and `issues.ts` `buildComment` | `steps finish --comment-field` / `--post` / `--number` — prints `- {Name}: {value}` on the heading line, writes a row, commits allow-empty, needs no `--agent` | EXTEND | Plan Current's skip posts through that existing flag set; no new verb, no engine change |
| A test holding a workflow's headings, `--step=` calls and comment numbers together | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | read `describe("resume")` `stepSections` test and the `Step 3 — Branch Sync` section assertions | `stepSections` + `WORKFLOW_STEPS` already compare headings and `--step=`; no test compares `--number` | EXTEND | the existing comparison gains a `--number` case and retargeted sections |
| A resume that re-runs a step instead of moving on | `.bkit/core/engine/commands/workflow/step-table.ts` | read `resumeAt` consumers in `status.ts`; `build-plan-verify` / `build-challenge` rows | `resumeAt: "build-branch-sync"` today — resumes at the plan re-check | EXTEND | `resumeAt: "build-plan-convert"` points the same mechanism at the re-check's new home |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.ts`

- **Existence Check:** `WORKFLOW_STEPS.build` holds the build rows today, with `build-plan-convert` and `build-branch-sync` both at number 3, title `Branch Sync`.
- `build-branch-sync` keeps number 3, title `Branch Sync`, no `resumeAt` (it is now the step before the convert).
- `build-plan-convert` takes number 4, title `Plan Convert`, `resumeAt: "build-plan-convert"` — a run whose last DONE row is the convert resumes at the plan re-check, now inside Plan Convert's own step.
- Every later row shifts by one per the table above; `build-create-pr` and `build-close-workflow` both move to 16.
- The `//` comments above the rows stay true: the convert row still resumes at its own re-check, the setup rows still run again.

#### [MODIFY] `.bkit/core/engine/commands/workflow/step-table.test.ts`

- The numbers each resume case expects (`build-challenge` 11, `build-plan-execute` 7, `build-plan-verify` 8, `build-plan-gaps-remediate` 9, `build-run-tests` 12, `build-failure-diagnose` 13) follow the table.

#### [MODIFY] `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`

- Regenerated from the edited workflow (`pnpm vitest run .bkit/core/engine/render/trackers.test.ts -u`).

Reuse Inventory rows left out: 0; Architecture entries left out: 2 — read them in docs/plans/202610/705-build-plan-convert-plan.md § Reuse Inventory and § Architecture & Component Changes.
