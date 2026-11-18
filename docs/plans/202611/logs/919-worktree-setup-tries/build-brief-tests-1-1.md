# Brief: group 1 — Setup adopts the checkout the session is already on (tests)

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

- Group 1: Setup adopts the checkout the session is already on — this group
  - TASK 1: Make `worktrees setup` adopt the session's checkout for every workflow when the session is on `feat/{FID}` — open
  - TASK 2: Rebuild the tracked engine output — done
  - TASK 3: Update the two doc lines that describe adopted mode and its tests — done

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Make `worktrees setup` adopt the session's checkout for every workflow when the session is on `feat/{FID}`
  - **READ:** `.bkit/core/engine/commands/lib.ts`: `repoRoot` / `mainCheckoutRoot` always resolve the main checkout through `--git-common-dir`
  - **UPDATE:** `worktreesCommand` in `.bkit/core/engine/commands/workflow/worktrees.ts`: `mint` loses the `workflow === "ship"` term; `wt` and the adopted-block branch reads use the session's top level when the session is on the target; the comment above `mint` is rewritten for every workflow
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.test.ts`: the four unit cases from the matrix
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`: the remote-backed case from the matrix
  - **DONE WHEN:** `grep -n 'workflow === "ship" && session === target' .bkit/core/engine/commands/workflow/worktrees.ts` finds nothing; the five new tests pass; the existing `adopts the main checkout even when called from a linked worktree`, ship and debug cases in both test files still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `adopts the linked worktree already on feat/{fid} for design, plan, build and debug` fails on exit 8 "already used by worktree" for plan, design and build, and on debug's `worktreePath` being the main checkout
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `ship run from a linked worktree on its target branch adopts that worktree` fails on `worktreePath` being the main checkout and the switch of the main checkout being refused with exit 7
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `the adopted linked worktree holds the log directory` fails on `logDir` pointing under the main checkout
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `a plan session on another branch still mints .worktrees/{fid}` fails on `mode` not being "created" if the condition is widened to skip every mint
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `plan from a host-made worktree on feat/{fid} adopts it without rebasing` fails on exit 8 and on `.worktrees/{fid}` being created

<!-- bkit:task 1 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| design, plan, build and debug each adopt a linked worktree already on `feat/{fid}`: exit 0, `mode` adopted, `worktreePath` is that worktree, no second worktree | Unit (boundary: real temp git repo + linked worktree) | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |
| ship run from a linked worktree on its target branch adopts that worktree | Unit (boundary: real temp git repo + linked worktree) | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |
| the adopted worktree holds the run's log directory (`logDir` under it, not under the main checkout) | Unit (boundary: real temp git repo + linked worktree) | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |
| a plan session on another branch in the main checkout still mints `.worktrees/{fid}` (`mode` created) | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |
| plan with `--worktrees` from a host-made worktree on `feat/{fid}` adopts it without rebasing, though `origin/dev` moved, and creates no `.worktrees/{fid}` | Integration (real git remote) | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 1 |

## Deviations

Run instructions from the v6.3 orchestrator, who started this run (engineer calls already settled, no owner question needed):

- Open question 1 is settled: apply the rule ship already has to every workflow. When the session's current branch is already the target `feat/{FID}`, setup uses that checkout (mode `adopted`) and does not run `git worktree add`. The condition today is `const mint = worktrees && !(workflow === "ship" && session === target);` in `.bkit/core/engine/commands/workflow/worktrees.ts`. Do not add the `git worktree list --porcelain` lookup.
- Open question 2 is settled: add no prompt or workflow text telling hosts not to create their own worktree. Setup handles it.
- Expected footprint: `worktrees.ts`, its test file(s), `dist/`, and a doc line only if a doc states the ship-only rule. No workflow or prompt file changes.
- Removes: the ship-only special case (`workflow === "ship"`) becomes the general case. The plan's Supersession Inventory names it.
- Do not change `.bkit/instructions.md`, `.bkit/core/workflows/bkit-build.md`, `branches.ts`, `steps.ts`, `ledgers.ts` or `decisions.ts`. If the work truly needs one of them, stop and say so.
- Never run `pnpm bkit:text:ceiling raise`. Never push. Never use `--no-verify`. Never name a bkit consumer in any file; write `a consumer`.
