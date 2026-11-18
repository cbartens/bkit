# Brief: group 1 — Setup adopts the checkout the session is already on

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
  - TASK 2: Rebuild the tracked engine output — open
  - TASK 3: Update the two doc lines that describe adopted mode and its tests — open

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

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Rebuild the tracked engine output
  - **UPDATE:** `dist/commands/workflow/worktrees.js`: regenerated by `pnpm build` from task 1's source
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -c 'workflow === "ship" && session === target' dist/commands/workflow/worktrees.js` prints 0, and `pnpm build` leaves `dist/` with no further diff
  - **TEST FIRST:** n/a — regenerated build output with no behaviour of its own; task 1's tests cover the source

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Update the two doc lines that describe adopted mode and its tests
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `adopted` row of the worktree modes table (session already on the branch is adopted for every workflow; `worktreePath` is that checkout, the repo root only when it is the main checkout)
  - **UPDATE:** `.bkit/workflows.md`: the installed copy, re-rendered by `pnpm tsx .bkit/core/engine/cli.ts upgrade` once at the end of the session, never hand-edited
  - **UPDATE:** `docs/testing.md`: the `worktrees.test.ts` / `worktrees.integration.test.ts` row, naming the adopt-the-host-worktree cases
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the `adopted` row no longer says `worktreePath` = repo root unconditionally, `.bkit/workflows.md` matches its source after `upgrade`, and the `docs/testing.md` row names the new cases
  - **TEST FIRST:** n/a — documentation only

<!-- bkit:task 3 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Skip `git worktree add` when the session is already on the target branch, for every workflow | `.bkit/core/engine/commands/workflow/worktrees.ts` | `grep -n 'workflow === "ship"' .bkit/core/engine/commands/workflow/worktrees.ts`; read lines 1190-1345 (`mint`, `mode`, adopted block); `git worktree list --porcelain` lookup considered and ruled out by the run's brief | `worktrees.ts` `const mint = worktrees && !(workflow === "ship" && session === target);` — ship-only | EXTEND | Drop the `workflow === "ship"` term so the same condition covers every workflow. |
| Adopt the session's own checkout, not the main checkout, when the session is on the target branch | `.bkit/core/engine/commands/workflow/worktrees.ts` | read `wt = mode === "adopted" ? root : wtDir` and `repoRoot` / `mainCheckoutRoot` in `.bkit/core/engine/commands/lib.ts` (`--git-common-dir`, always the main checkout); `grep -n 'show-toplevel' worktrees.ts` | `worktrees.ts` already runs `git rev-parse --show-toplevel` for the plain-directory guard | EXTEND | `root` is the main checkout from any worktree, so adopted mode in a linked worktree would inspect the main checkout's branch. Resolve the session's top level once and use it for `wt` and the adopted-block branch checks when the session is on the target. |
| Tests for the adopt-the-host-worktree rule | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | `grep -n 'linked(\|adopts the main checkout' worktrees.test.ts`; read the `adopt in place` and `ship` describes | `linked()` helper, `repo()` helper, `adopt in place` describe | EXTEND | New cases in the same describes with the same helpers. |
| Integration test with a real remote | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | `grep -n 'function fixture\|advanceDev' worktrees.integration.test.ts` | `fixture()` and `advanceDev()` | EXTEND | One case on the same fixture. |
| Doc lines for the adopted mode | `.bkit/core/.bkit/workflows.md` | `grep -rn 'adopted' .bkit/core/.bkit/workflows.md`; `grep -n 'adopt in place' docs/testing.md` | the `adopted` row of the mode table; the `worktrees` row of `docs/testing.md` | EXTEND | Edit the existing row in place; no new section. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts`

- **Existence Check:** the file exists; `const mint = worktrees && !(workflow === "ship" && session === target);` is near line 1252.
- The condition becomes `const mint = worktrees && session !== target;`, and the comment above it (`Ship mints only when the session is not already on the branch it ships`) says so for every workflow.
- When `session === target`, resolve the session's top level (`git rev-parse --show-toplevel` from `ctx.cwd`, falling back to `root`); `wt` and the adopted-block branch reads (`git(root, ["branch", "--show-current"])` at the debug-named check, the ship switch check, `here`, and the `shared` check) use it instead of `root`. When the session is on another branch, `wt` stays `root`, so `adopts the main checkout even when called from a linked worktree` is unchanged.
- `repoRoot` in the JSON stays the main checkout.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.test.ts`

- **Existence Check:** the file exists.
- Cases for the first four matrix rows.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`

- **Existence Check:** the file exists.
- One case for the fifth matrix row.

#### [MODIFY] `dist/commands/workflow/worktrees.js`

- **Existence Check:** tracked build output; regenerated by `pnpm build`, never hand-edited.

## Deviations

Run instructions from the v6.3 orchestrator, who started this run (engineer calls already settled, no owner question needed):

- Open question 1 is settled: apply the rule ship already has to every workflow. When the session's current branch is already the target `feat/{FID}`, setup uses that checkout (mode `adopted`) and does not run `git worktree add`. The condition today is `const mint = worktrees && !(workflow === "ship" && session === target);` in `.bkit/core/engine/commands/workflow/worktrees.ts`. Do not add the `git worktree list --porcelain` lookup.
- Open question 2 is settled: add no prompt or workflow text telling hosts not to create their own worktree. Setup handles it.
- Expected footprint: `worktrees.ts`, its test file(s), `dist/`, and a doc line only if a doc states the ship-only rule. No workflow or prompt file changes.
- Removes: the ship-only special case (`workflow === "ship"`) becomes the general case. The plan's Supersession Inventory names it.
- Do not change `.bkit/instructions.md`, `.bkit/core/workflows/bkit-build.md`, `branches.ts`, `steps.ts`, `ledgers.ts` or `decisions.ts`. If the work truly needs one of them, stop and say so.
- Never run `pnpm bkit:text:ceiling raise`. Never push. Never use `--no-verify`. Never name a bkit consumer in any file; write `a consumer`.
