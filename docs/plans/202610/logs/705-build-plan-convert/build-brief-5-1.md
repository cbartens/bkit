# Brief: group 5 — Challenge round 2 findings

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
- Group 2: Plan Current posts on both routes — done
  - TASK 2: Post a Plan Current comment whether the step runs or self-skips — done
- Group 3: Shipped reference and generated copies — done
  - TASK 3: Record the new step in the shipped workflow catalogue and re-sync the clauses drawn from it — done
  - TASK 4: Regenerate the host mirrors and the built CLI — done
  - TASK 5: Bring the testing doc and the knowledge ledger onto the new step numbers — done
- Group 4: Challenge round 1 findings — done
  - TASK 6: Stale build-step numbers in `docs/deployments.md` survive the renumbering (CI-dispatch / PR-pre-flight pointed at the wrong step) — done
  - TASK 7: The shipped cloud doc and its source still say `bkit-build` Step 15 closes the workflow — done
- Group 5: Challenge round 2 findings — this group
  - TASK 8: Plan Convert's finish asserts an artifact the no-plan route never writes, so a `/bkit-build` on an issue with no plan dies at `steps finish` (exit 7) before posting its Plan Convert comment — the whole point of #705 — open

## The work

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Plan Convert's finish asserts an artifact the no-plan route never writes, so a `/bkit-build` on an issue with no plan dies at `steps finish` (exit 7) before posting its Plan Convert comment — the whole point of #705
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:391` · **Round:** 2
  - **DONE WHEN:** Step 4's finish records `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` as an optional artifact (or the check log is guaranteed to exist before the finish), so the missing-plan route completes: `tests plan-check` exit 2 routes to the convert, the convert writes the plan, the finish returns 0 and posts `### Step 4 — Plan Convert`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Convert's finish carries the plan-check log as an optional artifact` fails on `bkit-build.md:391` naming `build-plan-check.md` with a required `--artifact`, because a plan-less run's `steps finish` exits 7 instead of posting.

<!-- bkit:task 8 end -->
