# Cleanup check reads paths starting with `:` as literal file names Implementation Plan

## Context & Goals

`notOnDev` (`.bkit/core/engine/commands/workflow/worktrees.ts`) hands every changed file path to git after `--`. Git reads a path starting with `:` as a pathspec pattern, so `:/src.txt` (the file `src.txt` inside a folder named `:`) is read as the top-level `src.txt`. `treeEntry` (`ls-tree`) and `devHeldEntry` (`rev-list`) then look at the wrong file, and cleanup can call a branch landed while its file never reached `dev`. The goal: every path from `git diff --name-only -z` is read as a literal path by `treeEntry` and `devHeldEntry`, and the other cleanup reads that pass a changed path are checked for the same mistake.

**Related Issues:**

- #1058 — Cleanup check reads a path starting with `:` as a pattern (open)
- #1055 — Worktree removal says not-landed once a later commit on dev changes the same file (the review that found it)

---

## Acceptance Scenario

### Narrative

A branch adds a file under a folder named `:` while `origin/dev` holds a top-level file with the same name. Cleanup now compares the file under `:` as itself, so it names that file as not landed and keeps the branch.

### Success Criteria

- `notOnDev` names `:/src.txt` when `dev` deleted `src.txt`, re-added it with its original content and edited it later.
- `notOnDev` names `:/src.txt` when `dev` never touched `src.txt` and never held `:/src.txt`.
- Paths that do not start with `:` are read as before (the existing `shared landed comparison` tests stay green).
- The `:(exclude)` entries that `dirtyWork`'s `status` call passes keep working as pathspec magic.

### Process Sketch

- **WHEN** `notOnDev` reads a changed path through `treeEntry` or `devHeldEntry` **→ THEN** git reads it as a literal path.
- **WHEN** the changed path is `:/src.txt` and `origin/dev` holds only the top-level `src.txt` **→ THEN** `notOnDev` returns `[":/src.txt"]`.
- **IF** `dirtyWork` passes `:(exclude)...` entries to `git status` **→ THEN** those stay pathspec magic, because only the reads that carry a single changed path are made literal.

### Concrete Example

**Setup:** `origin/dev` holds `src.txt` ("code v0"). A branch commits `:/src.txt`. On `dev`, `src.txt` is deleted, re-added as "code v0" and later edited.

**Steps:**

1. Cleanup calls `notOnDev(clone, "feat/1-x")` → the changed list is `:/src.txt`.
2. `treeEntry` and `devHeldEntry` read `:/src.txt` as a literal path → `dev` holds no such path.

**Outcome:** `notOnDev` returns `[":/src.txt"]` and the branch is kept.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A path under `:` that `dev` never touched | Named as not landed (before the fix it was read as the unchanged top-level file and dropped). |
| A path under `:` with a same-named top-level file edited on `dev` | Named as not landed, whatever the top-level file's history. |
| A path with no leading `:` | Compared exactly as before. |
| `git status` with `:(exclude)` entries in `dirtyWork` | Still read as pathspec magic. |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a path under a directory named `:` is compared as itself: `notOnDev` names `:/src.txt` when `dev` deleted `src.txt`, re-added it and later edited it | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| a path under a directory named `:` that `dev` never touched is not reported landed | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

None

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

- **Assumption:** `git --literal-pathspecs` before the subcommand reaches both `ls-tree` and `rev-list` the same way `GIT_LITERAL_PATHSPECS=1` does (the issue's reviewer confirmed the env form with read-only commands) → the two new tests would stay red, and the task would switch to the env form per call.
- **Assumption:** The issue proposes setting `GIT_LITERAL_PATHSPECS=1` for every `cleanupRead` call. `dirtyWork` passes `:(exclude){entry}` entries to `git status` through `cleanupRead`, and a global setting would turn those into file names that match nothing. The plan therefore makes the reads literal per call (an opt-in on `cleanupRead`) → if every `cleanupRead` call were safe to make literal, the opt-in could become the default.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

Setting `GIT_LITERAL_PATHSPECS=1` in `gitEnv()` or for all of `cleanupRead` (the issue's first option) was rejected: `dirtyWork`'s `status` call needs `:(exclude)` magic (`copyExcludes`).

## Out of Scope

None

## Suggested Scope Expansion

None

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The change makes a data-loss path stricter: a branch file is no longer judged landed on the strength of a different file.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** the packages are declared, and the manifest and lockfile are in sync.
- [ ] **Dependency Versions:** outdated dependencies and the toolchain and stack CLI versions are checked.
- [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
- [ ] **User Context:** access to the files is confirmed, and missing user information is requested.
- [ ] **Project Context:** the relevant `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows are read.
- [ ] **Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are assessed through the `.agents/docs.md` index, and the plan's strategy matches `docs/testing.md`. Record each source in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None

### Conditional

- [ ] **Deployments & Setup:** release, CI and branch behaviour follows `docs/deployments.md`, and local-setup changes follow `docs/setup.md`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes | `.agents/docs.md` index; `docs/architecture.md` (placement of engine commands under `.bkit/core/engine/commands/workflow/`) | covered | None |
| technology | `docs/technology.md` | yes | `.agents/docs.md` index; `docs/technology.md` (TypeScript and `spawnSync` conventions) | covered | None |
| security | `docs/security.md` | yes | `docs/security.md` § subprocess rules (`spawnSync`, no shell strings): the change keeps the argument-array form | covered | None |
| testing | `docs/testing.md` | yes | `docs/testing.md` rows for `commands/workflow/branches.test.ts` (Unit, boundary: real temp git repos) | covered | The rows list no landed-comparison detail, so no row needs a change. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | None |
| design | `docs/design.md` | no — no UI | none | none | None |
| observability | `docs/observability.md` | no — no new logs | none | none | None |
| deployments | `docs/deployments.md` | no — no release or CI change | none | none | None |

## Documentation Warnings

None

## Data Schema Integration

None — no database.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Literal reading of changed paths in the landed comparison | `.bkit/core/engine/commands/workflow/worktrees.ts` | `grep -n 'cleanupRead\|treeEntry\|devHeldEntry' worktrees.ts`; `grep -rl 'LITERAL_PATHSPECS\|literal-pathspecs' .bkit/core docs`; `grep -n 'function gitEnv' .bkit/core/engine/ledgers/telemetry.ts`; git built-in `--literal-pathspecs` | `cleanupRead` and `treeEntry` in `worktrees.ts` — the shared git reader for cleanup, missing literal path handling | EXTEND | Give `cleanupRead` an opt-in literal mode and use it in `treeEntry`, `devHeldEntry` and `dirtyWork`'s `diff --cached`. |

## Architecture & Component Changes

**Ledger rows:** None

### Cleanup git reads

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts`

- **Existence Check:** the file exists, with `cleanupRead` (line 777), `treeEntry` (791), `devHeldEntry` (805) and `dirtyWork` (855).
- `cleanupRead` takes an optional literal flag and puts `--literal-pathspecs` before the subcommand when set.
- `treeEntry` (`ls-tree ... -- file`), `devHeldEntry` (`rev-list ... -- file`) and the `diff --cached --quiet ORIGIN_DEV -- file` call in `dirtyWork` read `file` literally.
- `dirtyWork`'s `status` call, which passes `:(exclude)` entries from `copyExcludes`, stays non-literal.
- `committedLines` calls `git show rev:file` (a revision path, not a pathspec) and is unchanged.

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.test.ts`

- **Existence Check:** the file exists, with the `shared landed comparison` describe block.
- Two new tests in that block, built from `withOrigin`, `commit` and `landOnDev`.

#### [MODIFY] `dist/commands/workflow/worktrees.js`

- **Existence Check:** the file exists.
- Regenerated by `pnpm build` and staged with the source, per the `Engine builds` rule.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

None

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/deferrals.jsonl` | Close the row `1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805` (task 2). |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Literal paths in the cleanup comparison

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Read every changed path literally in `treeEntry`, `devHeldEntry` and `dirtyWork`'s staged diff
  - **UPDATE:** `cleanupRead` in `.bkit/core/engine/commands/workflow/worktrees.ts`: an optional literal mode that puts `--literal-pathspecs` before the git subcommand
  - **UPDATE:** `treeEntry` in `.bkit/core/engine/commands/workflow/worktrees.ts`: reads `file` literally
  - **UPDATE:** `devHeldEntry` in `.bkit/core/engine/commands/workflow/worktrees.ts`: the `rev-list` reads `file` literally
  - **UPDATE:** `dirtyWork` in `.bkit/core/engine/commands/workflow/worktrees.ts`: the `diff --cached --quiet` reads `file` literally, and the `status` call with `:(exclude)` entries stays as it is
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: the two tests under `shared landed comparison`
  - **UPDATE:** `dist/commands/workflow/worktrees.js`: regenerated by `pnpm build`
  - **READ:** `copyExcludes` in `.bkit/core/engine/commands/workflow/worktrees.ts`: the `:(exclude)` entries that must stay pathspec magic
  - **READ:** `docs/security.md`: the subprocess rules (`spawnSync`, argument arrays)
  - **DONE WHEN:** both new tests pass and the existing `shared landed comparison` tests still pass; `grep -n 'literal-pathspecs' .bkit/core/engine/commands/workflow/worktrees.ts` shows the flag in `cleanupRead`; `dirtyWork`'s `status` call carries no literal flag; `dist/commands/workflow/worktrees.js` holds the same change
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `names a path under a directory named : when dev deleted, re-added and later edited the top-level file` fails on `notOnDev` returning "[]" because `:/src.txt` is read as the top-level `src.txt`, which `dev` re-added with the branch's content
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `a path under a directory named : that dev never touched is not reported landed` fails on `notOnDev` returning "[]" because `:/src.txt` is read as the unchanged top-level `src.txt`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Close the deferral row for the finding
  - **UPDATE:** `docs/deferrals.jsonl`: append a same-key row with `status: "CLOSED"` and the fix commit in `references` for `1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805`, through `bkit ledgers append --ledger=deferrals`
  - **READ:** `.bkit/jsonl.md`: § Updating a Row and the `deferral` per-kind fields
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `bkit ledgers query --ledger=deferrals --key=1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805` shows `status` `CLOSED`
  - **TEST FIRST:** n/a — a ledger row, no behaviour change

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran. A later task that names an earlier task's test takes it over: the build reports the takeover and does not refuse it.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
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

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/branches.test.ts`):** the two new `shared landed comparison` tests and the existing ones pass, using real temp git repositories.
- [ ] **Run all tests:** the local unit and integration suites pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch clone, commit `:/src.txt` on a branch while `origin/dev` holds a top-level `src.txt`, run `node dist/cli.js` cleanup for the branch, and check it names `:/src.txt` and keeps the branch.
