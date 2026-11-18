# Brief: group 2 — Challenge round 1 findings

Plan: Worktree setup adopts a checkout that is already on feat/{FID} Implementation Plan

## Why and what

### Context & Goals

`bkit worktrees setup` tries `git worktree add` for plan, design, build and debug whenever worktrees are allowed, even when the session already sits on `feat/{FID}` in a linked worktree a host (the Codex app) made first. Git refuses to check one branch out twice, so setup exits 8 and the workflow takes its Failure Path. Only ship already skips the add when the session's branch is the target. This plan makes that the rule for every workflow: when the session's current branch is already the target `feat/{FID}`, setup uses that checkout (mode `adopted`), and `worktreePath` is that checkout, not the main checkout.

Settled before this plan (engineer calls from the run's brief, no owner question needed): (1) apply ship's rule to every workflow, with no `git worktree list --porcelain` lookup; (2) add no prompt or workflow text telling hosts not to make their own worktree, because setup handles it. Footprint: `.bkit/core/engine/commands/workflow/worktrees.ts`, its two test files, `dist/commands/workflow/worktrees.js`, and the two doc lines that describe the adopted mode. No workflow or prompt file changes.

**Related Issues:**

- #919 — worktree setup tries to add a second worktree for a branch a host already checked out (this plan's issue)
- #812 — the placeholder gate firing on fetched issue text (the other failure in the same consumer run, not in scope)

---

### Narrative

A host app makes its own worktree on `feat/{FID}` and starts `/bkit-plan` inside it. Step 2's `bkit worktrees setup` recognises that the session is already on the branch it would create, works in that checkout and carries on.

### Success Criteria

- `bkit worktrees setup --workflow={plan|design|build|debug|ship} --worktrees` run from a linked worktree on `feat/{FID}` exits 0 with `mode` `adopted`.
- `worktreePath` and `logDir` point into that linked worktree, not the main checkout.
- No `git worktree add` runs, and no second worktree appears.
- A session on any other branch still mints a worktree as before.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Session in the main checkout while `feat/{FID}` is held by another worktree | Needs the porcelain lookup the run's engineer ruled out | a follow-up issue if it recurs |
| Resume rebase for an adopted linked worktree | Adopted checkouts never rebase; changing that widens the mode | a follow-up issue |

## Where it fits

- Group 1: Setup adopts the checkout the session is already on — done
  - TASK 1: Make `worktrees setup` adopt the session's checkout for every workflow when the session is on `feat/{FID}` — done
  - TASK 2: Rebuild the tracked engine output — done
  - TASK 3: Update the two doc lines that describe adopted mode and its tests — done
- Group 2: Challenge round 1 findings — this group
  - TASK 4: A plan, design or build run started in the shared main checkout while it sits on feat/{FID} now works there in place, so its abort or pause handover `git add -A` commits and pushes other agents' and the human's uncommitted files to origin — open

## The work

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** A plan, design or build run started in the shared main checkout while it sits on feat/{FID} now works there in place, so its abort or pause handover `git add -A` commits and pushes other agents' and the human's uncommitted files to origin
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/worktrees.ts:1253` · **Round:** 1
  - **DONE WHEN:** under `--worktrees` (or `--detect` resolving to worktrees), `bkit worktrees setup` for design, plan or build from the main checkout on `feat/{FID}` (session top level equals `repoRoot`) exits 7 with a message to switch the main checkout off the branch or run from the feature's worktree, and writes no log directory; a linked worktree on `feat/{FID}` is still adopted for every workflow, and ship and debug keep their existing in-place adoption of the main checkout on their target.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees` fails on exit 0 with `mode` adopted and `worktreePath` the main checkout, and on `docs/plans/{month}/logs/{fid}` being created there
<!-- bkit:task 4 end -->

## Deviations

Run instructions from the v6.3 orchestrator, who started this run (engineer calls already settled, no owner question needed):

- Open question 1 is settled: apply the rule ship already has to every workflow. When the session's current branch is already the target `feat/{FID}`, setup uses that checkout (mode `adopted`) and does not run `git worktree add`. The condition today is `const mint = worktrees && !(workflow === "ship" && session === target);` in `.bkit/core/engine/commands/workflow/worktrees.ts`. Do not add the `git worktree list --porcelain` lookup.
- Open question 2 is settled: add no prompt or workflow text telling hosts not to create their own worktree. Setup handles it.
- Expected footprint: `worktrees.ts`, its test file(s), `dist/`, and a doc line only if a doc states the ship-only rule. No workflow or prompt file changes.
- Removes: the ship-only special case (`workflow === "ship"`) becomes the general case. The plan's Supersession Inventory names it.
- Do not change `.bkit/instructions.md`, `.bkit/core/workflows/bkit-build.md`, `branches.ts`, `steps.ts`, `ledgers.ts` or `decisions.ts`. If the work truly needs one of them, stop and say so.
- Never run `pnpm bkit:text:ceiling raise`. Never push. Never use `--no-verify`. Never name a bkit consumer in any file; write `a consumer`.
