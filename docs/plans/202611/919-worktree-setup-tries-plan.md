# Worktree setup adopts a checkout that is already on feat/{FID} Implementation Plan

## Context & Goals

`bkit worktrees setup` tries `git worktree add` for plan, design, build and debug whenever worktrees are allowed, even when the session already sits on `feat/{FID}` in a linked worktree a host (the Codex app) made first. Git refuses to check one branch out twice, so setup exits 8 and the workflow takes its Failure Path. Only ship already skips the add when the session's branch is the target. This plan makes that the rule for every workflow: when the session's current branch is already the target `feat/{FID}`, setup uses that checkout (mode `adopted`), and `worktreePath` is that checkout, not the main checkout.

Settled before this plan (engineer calls from the run's brief, no owner question needed): (1) apply ship's rule to every workflow, with no `git worktree list --porcelain` lookup; (2) add no prompt or workflow text telling hosts not to make their own worktree, because setup handles it. Footprint: `.bkit/core/engine/commands/workflow/worktrees.ts`, its two test files, `dist/commands/workflow/worktrees.js`, and the two doc lines that describe the adopted mode. No workflow or prompt file changes.

**Related Issues:**

- #919 — worktree setup tries to add a second worktree for a branch a host already checked out (this plan's issue)
- #812 — the placeholder gate firing on fetched issue text (the other failure in the same consumer run, not in scope)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

### Narrative

A host app makes its own worktree on `feat/{FID}` and starts `/bkit-plan` inside it. Step 2's `bkit worktrees setup` recognises that the session is already on the branch it would create, works in that checkout and carries on.

### Success Criteria

- `bkit worktrees setup --workflow={plan|design|build|debug|ship} --worktrees` run from a linked worktree on `feat/{FID}` exits 0 with `mode` `adopted`.
- `worktreePath` and `logDir` point into that linked worktree, not the main checkout.
- No `git worktree add` runs, and no second worktree appears.
- A session on any other branch still mints a worktree as before.

### Process Sketch

- **WHEN** the session's branch equals `feat/{FID}` and worktrees are allowed **→ THEN** setup adopts the session's checkout, reports `mode: adopted`, and does not fetch, rebase, copy or install.
- **WHEN** the session is on a different branch and worktrees are allowed **→ THEN** setup mints or resumes `.worktrees/{FID}` as today.
- **IF** the session's checkout is `dev` or `main` **→ THEN** the existing refusal (exit 7) still applies.

### Concrete Example

**Setup:** a repo with `dev`; the host ran `git worktree add -b feat/123-x {somewhere-outside-the-repo} dev` and the session is inside it.

**Steps:**

1. Run `bkit worktrees setup --workflow=plan --fid=123-x --month=202611 --worktrees` from that worktree → setup exits 0 instead of 8.
2. Read the JSON → `mode` is `adopted`, `worktreePath` is the host's worktree, `.worktrees/123-x` does not exist.

**Outcome:** the plan workflow continues in the host's worktree.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Ship is run from a linked worktree already on its target branch | Adopted at that worktree, not at the main checkout (the main checkout cannot switch to a branch held elsewhere). |
| Session in a linked worktree on a different branch than the target | Unchanged: the existing `adopts the main checkout even when called from a linked worktree` behaviour. |
| The host's worktree is behind `origin/dev` | Adopted as it is: no fetch and no rebase, as for every adopted checkout. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| design, plan, build and debug each adopt a linked worktree already on `feat/{fid}`: exit 0, `mode` adopted, `worktreePath` is that worktree, no second worktree | Unit (boundary: real temp git repo + linked worktree) | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |
| ship run from a linked worktree on its target branch adopts that worktree | Unit (boundary: real temp git repo + linked worktree) | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |
| the adopted worktree holds the run's log directory (`logDir` under it, not under the main checkout) | Unit (boundary: real temp git repo + linked worktree) | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |
| a plan session on another branch in the main checkout still mints `.worktrees/{fid}` (`mode` created) | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |
| plan with `--worktrees` from a host-made worktree on `feat/{fid}` adopts it without rebasing, though `origin/dev` moved, and creates no `.worktrees/{fid}` | Integration (real git remote) | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 1 |
| refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 4 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

None. No names, flags, exit codes or JSON keys change. One behaviour shift is named under Open Questions & Assumptions.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

- **Assumption (settled by the run's engineer):** every workflow uses ship's rule, "current branch equals target means use this checkout"; setup does not look the branch up with `git worktree list --porcelain` → a session started from the main checkout while the branch is held in another worktree still fails with exit 8, and is left for a later issue.
- **Assumption (settled by the run's engineer):** no prompt or workflow text tells hosts not to make their own worktree → the change touches no workflow or prompt file.
- **Assumption:** a session that sits inside bkit's own `.worktrees/{FID}` on `feat/{FID}` and calls setup with `--worktrees` now gets `adopted` (no fetch, rebase onto `dev`, carry of leftovers, copy or install), where it used to get `resumed` → if a workflow calls setup from inside `.worktrees/{FID}` and relies on the resume rebase, that rebase no longer runs. No existing test calls setup from there, and the workflows call it from the main checkout.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- **`git worktree list --porcelain` lookup** (use the path where the target branch is checked out): rejected by the run's engineer. It also covers a session started in the main checkout, and is the follow-up to propose if that case shows up.
- **Prompt text telling hosts not to create worktrees:** rejected; setup handles the host's worktree, and a sentence in every workflow costs tokens in every run.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Session in the main checkout while `feat/{FID}` is held by another worktree | Needs the porcelain lookup the run's engineer ruled out | a follow-up issue if it recurs |
| Resume rebase for an adopted linked worktree | Adopted checkouts never rebase; changing that widens the mode | a follow-up issue |

## Suggested Scope Expansion

None.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The change reads the session's own `git rev-parse --show-toplevel` and passes it only to `git` calls and `path.join` as the existing `root` is.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package change.
- [ ] **Dependency Versions:** no dependency change.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** the run's brief settles the two open questions.
- [ ] **Project Context:** `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows for worktrees setup are read by the builder before editing.
- [ ] **Project Documents:** assessed in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Deployments & Setup:** branch and worktree behaviour follows `.bkit/workflows.md` § worktree modes table, updated in task 3.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** no `NEW` row exists.
- [ ] **Gate 1 — Verified:** every item above is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — worktree and checkout handling in the command layer | `docs/architecture.md` § Package boundaries, § Environments (Producer checkout row) | covered | None. It names no mint-or-adopt rule, so no edit. |
| technology | `docs/technology.md` | yes — build output and test conventions | `docs/technology.md` § Conventions | covered | None. `dist/` is rebuilt by `pnpm build` (task 2). |
| security | `docs/security.md` | no — no credential, input-trust or permission change | none | none | Not applicable: the change picks which local checkout setup works in. |
| testing | `docs/testing.md` | yes — test tiers and the key-test-file table | `docs/testing.md` § Key test files (the `worktrees.test.ts` / `worktrees.integration.test.ts` row), § Test first | covered | Update that row to name the adopt-the-host-worktree cases (task 3). |
| data-schema | `docs/data-schema.md` | no — no database | none | none | Not applicable. |
| observability | `docs/observability.md` | no — no log or span change | none | none | Not applicable. |
| deployments | `docs/deployments.md` | no — no release or CI change | none | none | Not applicable. |
| workflows catalog | `.bkit/workflows.md` | yes — it states the `adopted` mode and `worktreePath` | `.bkit/workflows.md` worktree modes table (`adopted` row); source `.bkit/core/.bkit/workflows.md` | covered | The row says `worktreePath` = repo root; update it (task 3). |

## Documentation Warnings

None

## Data Schema Integration

None — no database. The `worktrees setup` JSON keys are unchanged.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Skip `git worktree add` when the session is already on the target branch, for every workflow | `.bkit/core/engine/commands/workflow/worktrees.ts` | `grep -n 'workflow === "ship"' .bkit/core/engine/commands/workflow/worktrees.ts`; read lines 1190-1345 (`mint`, `mode`, adopted block); `git worktree list --porcelain` lookup considered and ruled out by the run's brief | `worktrees.ts` `const mint = worktrees && !(workflow === "ship" && session === target);` — ship-only | EXTEND | Drop the `workflow === "ship"` term so the same condition covers every workflow. |
| Adopt the session's own checkout, not the main checkout, when the session is on the target branch | `.bkit/core/engine/commands/workflow/worktrees.ts` | read `wt = mode === "adopted" ? root : wtDir` and `repoRoot` / `mainCheckoutRoot` in `.bkit/core/engine/commands/lib.ts` (`--git-common-dir`, always the main checkout); `grep -n 'show-toplevel' worktrees.ts` | `worktrees.ts` already runs `git rev-parse --show-toplevel` for the plain-directory guard | EXTEND | `root` is the main checkout from any worktree, so adopted mode in a linked worktree would inspect the main checkout's branch. Resolve the session's top level once and use it for `wt` and the adopted-block branch checks when the session is on the target. |
| Tests for the adopt-the-host-worktree rule | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | `grep -n 'linked(\|adopts the main checkout' worktrees.test.ts`; read the `adopt in place` and `ship` describes | `linked()` helper, `repo()` helper, `adopt in place` describe | EXTEND | New cases in the same describes with the same helpers. |
| Integration test with a real remote | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | `grep -n 'function fixture\|advanceDev' worktrees.integration.test.ts` | `fixture()` and `advanceDev()` | EXTEND | One case on the same fixture. |
| Doc lines for the adopted mode | `.bkit/core/.bkit/workflows.md` | `grep -rn 'adopted' .bkit/core/.bkit/workflows.md`; `grep -n 'adopt in place' docs/testing.md` | the `adopted` row of the mode table; the `worktrees` row of `docs/testing.md` | EXTEND | Edit the existing row in place; no new section. |

## Architecture & Component Changes

**Ledger rows:** None

### Backend (workflow commands)

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

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| The ship-only special case `workflow === "ship" && session === target` in `.bkit/core/engine/commands/workflow/worktrees.ts` | The general condition `session === target` | DELETE | Ship's rule becomes the rule for every workflow; no second code path stays behind. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/workflows.md` | The `adopted` row of the worktree modes table: the session on the branch is adopted for every workflow, and `worktreePath` is that checkout (the repo root only when it is the main checkout). The installed `.bkit/workflows.md` follows through `bkit upgrade` at the end of the session. |
| `docs/testing.md` | The `worktrees.test.ts` / `worktrees.integration.test.ts` row: add the session already on `feat/{fid}` in a linked worktree adopted for every workflow. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {COMMIT}` | Code-only — `git revert` sufficient. |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Setup adopts the checkout the session is already on

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Make `worktrees setup` adopt the session's checkout for every workflow when the session is on `feat/{FID}`
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

- [x] **TASK 2:** Rebuild the tracked engine output
  - **UPDATE:** `dist/commands/workflow/worktrees.js`: regenerated by `pnpm build` from task 1's source
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -c 'workflow === "ship" && session === target' dist/commands/workflow/worktrees.js` prints 0, and `pnpm build` leaves `dist/` with no further diff
  - **TEST FIRST:** n/a — regenerated build output with no behaviour of its own; task 1's tests cover the source

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Update the two doc lines that describe adopted mode and its tests
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `adopted` row of the worktree modes table (session already on the branch is adopted for every workflow; `worktreePath` is that checkout, the repo root only when it is the main checkout)
  - **UPDATE:** `.bkit/workflows.md`: the installed copy, re-rendered by `pnpm tsx .bkit/core/engine/cli.ts upgrade` once at the end of the session, never hand-edited
  - **UPDATE:** `docs/testing.md`: the `worktrees.test.ts` / `worktrees.integration.test.ts` row, naming the adopt-the-host-worktree cases
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the `adopted` row no longer says `worktreePath` = repo root unconditionally, `.bkit/workflows.md` matches its source after `upgrade`, and the `docs/testing.md` row names the new cases
  - **TEST FIRST:** n/a — documentation only

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 4 start -->

- [x] **TASK 4:** A plan, design or build run started in the shared main checkout while it sits on feat/{FID} now works there in place, so its abort or pause handover `git add -A` commits and pushes other agents' and the human's uncommitted files to origin
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/worktrees.ts:1253` · **Round:** 1
  - **DONE WHEN:** under `--worktrees` (or `--detect` resolving to worktrees), `bkit worktrees setup` for design, plan or build from the main checkout on `feat/{FID}` (session top level equals `repoRoot`) exits 7 with a message to switch the main checkout off the branch or run from the feature's worktree, and writes no log directory; a linked worktree on `feat/{FID}` is still adopted for every workflow, and ship and debug keep their existing in-place adoption of the main checkout on their target.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `refuses design, plan and build in place in the main checkout on feat/{fid} under --worktrees` fails on exit 0 with `mode` adopted and `worktreePath` the main checkout, and on `docs/plans/{month}/logs/{fid}` being created there

<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** no `[NEW]` file exists; every change extends an existing file.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened; `pnpm bkit:text:ceiling raise` was not run.
- [ ] **Red before code:** the tests step recorded every planned test of the group red before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** none, or each is cleared by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in task 1's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test task 1's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** not applicable, no log change.
- [ ] **Update documentation:** the two doc rows match the new behaviour.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Dogfood:** `pnpm build`, then in a scratch repo `git worktree add -b feat/123-x ../wt dev`, `cd ../wt` and `node dist/cli.js worktrees setup --workflow=plan --fid=123-x --month=202611 --worktrees` exits 0 with `mode` `adopted` and `worktreePath` the scratch worktree.
- [ ] **Run all tests:** the unit and integration suites pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output or a CLI result).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing.

- [ ] **Step 1:** Start `/bkit-plan` from a host-made worktree on `feat/{FID}` and confirm Step 2 no longer exits 8.
