# Worktree Removal Says "Not Landed" After a Later Commit on dev Implementation Plan

## Context & Goals

`bkit worktrees remove` and `bkit branches land` both ask `notOnDev` (`.bkit/core/engine/commands/workflow/worktrees.ts`) whether a branch's work is on `origin/dev`. It compares each changed file with today's `origin/dev`, so a later `dev` commit on the same file makes a landed branch look unlanded. The goal is that a branch counts as landed when, for every path it changed, some commit on `origin/dev` since the merge base holds the branch's version of that path. The check still preserves the branch whenever it cannot prove that. The fix lives in the one shared helper; neither caller changes.

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. Every test builds its own throwaway repos; none touches a real worktree or branch of this checkout.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `notOnDev` reports nothing for a branch whose file a later `dev` commit changed again | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| `notOnDev` still names a file whose branch version never reached `dev`, and only that file | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| `notOnDev` reports nothing for a file the branch deleted when `dev` deleted it and a later commit re-added it | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 1 |
| `bkit worktrees remove --branch` removes the worktree and deletes the local branch when a later `dev` commit changed the branch's file | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |
| `bkit worktrees remove --branch` deletes the remote branch too when a later `dev` commit changed the branch's file | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 1 |

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | no — no new component, container or file placement; one helper's logic changes | `docs/architecture.md` (headings read; no § on worktree cleanup) | covered | None. |
| technology | `docs/technology.md` | no — no new dependency; only `git` calls the helper already makes | `docs/technology.md` § Conventions | covered | None. |
| security | `docs/security.md` | yes — cleanup deletes branches, so the check must stay on the safe side | `docs/security.md` § Shell Injection (git arguments are passed as an array through `cleanupRead`, the new call does the same) | covered | None. |
| testing | `docs/testing.md` | yes — new tests, and two rows describe the touched test files | `docs/testing.md` § Where tests live; table rows for `worktrees.test.ts` and `branches.test.ts` (lines 964 and 966) | covered | Rows are updated in Task 2. |
| observability | `docs/observability.md` | yes — it describes the `carries work origin/dev does not — preserved` message | `docs/observability.md` line 221 (cleanup preservation diagnostics) | partial | The message text is unchanged, but the rule behind it changes; Task 2 rewrites that sentence. |
| deployments | `docs/deployments.md` | no — no release or CI behaviour changes | none | none | Not applicable. |
| data-schema, design, noise, setup | `docs/data-schema.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | no — no database, UI, noise or setup change | none | none | Not applicable. |

## Documentation Warnings

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Judge "is the branch's work on `origin/dev`" for both `worktrees remove` and `branches land` | `.bkit/core/engine/commands/workflow/worktrees.ts` | `grep -rn "notOnDev" .bkit/core/engine`; read `worktrees.ts:795-840`, the callers at `worktrees.ts:1029` and `:1041` and `branches.ts:3284` | `notOnDev` in `worktrees.ts` — already shared by both commands; misses only the "a later `dev` commit changed the file" case | EXTEND | Add a history search of `origin/dev` for each differing path inside the same helper, using its existing `treeEntry` and `cleanupRead`. No second helper, no caller change. |
| Per-path history lookup of `origin/dev` (commits since the merge base that touched the path) | `.bkit/core/engine/commands/workflow/worktrees.ts` | `grep -n "rev-list\|treeEntry\|committedLines" .bkit/core/engine/commands/workflow/worktrees.ts`; checked `git rev-list --full-history {base}..origin/dev -- {path}` by hand on the eight stuck branches (read-only): every differing path found a matching commit | `treeEntry` and `cleanupRead` in `worktrees.ts` — read a tree entry and run a read-only git call | EXTEND | One new small function beside `notOnDev` reuses both; the `.jsonl` line-union rule below it stays as it is. |
| Tests for the shared comparison and for `remove --branch` | `.bkit/core/engine/commands/workflow/branches.test.ts`, `.bkit/core/engine/commands/workflow/worktrees.test.ts` | read `describe("shared landed comparison")` (`branches.test.ts:3604`) and `describe("--branch")` (`worktrees.test.ts:1087`) | both blocks already build real temp repos with a bare origin (`withOrigin`, `landOnDev`, `repo`, `linked`) | EXTEND | Add cases to the existing blocks with the existing helpers. |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Landed check survives later dev commits

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Make `notOnDev` accept a path when any `origin/dev` commit since the merge base holds the branch's version of it
  - **UPDATE:** `notOnDev` in `.bkit/core/engine/commands/workflow/worktrees.ts`: for each path whose branch entry differs from today's `origin/dev` entry, before the `.jsonl` line check, treat the path as landed when `git rev-list --full-history {base}..origin/dev -- {path}` lists a commit whose tree entry for the path equals the branch's entry (mode, type and blob; absent counts for a deletion). A failed `rev-list` throws into the existing catch, so the branch is preserved
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: one small helper next to `notOnDev` that does the history lookup with `cleanupRead` and `treeEntry`
  - **READ:** `treeEntry` in `.bkit/core/engine/commands/workflow/worktrees.ts`: reads one tree entry; the new lookup reuses it
  - **READ:** `cleanupRead` in `.bkit/core/engine/commands/workflow/worktrees.ts`: the read-only git call the new lookup reuses
  - **READ:** `removeWorktree` in `.bkit/core/engine/commands/workflow/worktrees.ts`: the two calls at lines 1029 and 1041 stay as they are
  - **READ:** `.bkit/core/engine/commands/workflow/branches.ts`: the `branches land` call at line 3284 stays as it is
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: three cases in the `shared landed comparison` block, each built on `withOrigin` and `landOnDev`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.test.ts`: two cases in the `--branch` block built on `withOrigin`, `linked` and `remove`
  - **DONE WHEN:** the five tests below pass; the existing executable-bit and symlink cases in `branches.test.ts` still pass; `notOnDev` still returns a path when no `origin/dev` commit holds the branch's version of it; `worktrees.ts` has no second landed-comparison function and `branches.ts` and the two `removeWorktree` calls are byte-identical to before
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `a later dev commit on the same file does not turn a landed branch back into unlanded` fails on `notOnDev` returning "src.txt" for a branch whose change `dev` carried in an earlier commit
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `names only the file whose branch version never reached dev` fails on the result holding both "a.txt" and "src.txt" instead of "src.txt" alone
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `a deleted file that dev deleted and a later commit re-added counts as landed` fails on `notOnDev` returning "src.txt" for the re-added file
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `removes the worktree and local branch when a later dev commit changed the branch's file` fails on `reason` being "not-landed" with the branch and worktree kept
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `deletes the remote branch when a later dev commit changed the branch's file` fails on `reason` being "remote-not-landed" with the remote branch kept

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Bring the testing and observability docs in line with the new landed rule
  - **READ:** `.agents/docs.md`: the index row for each doc below
  - **UPDATE:** `docs/testing.md`: the `worktrees.test.ts` row (line 964) and the `branches.test.ts` row (line 966) name the new cases: a landed branch stays landed after a later `dev` commit on its file, only the unproven file is named, a deleted-then-re-added file counts as landed
  - **UPDATE:** `docs/observability.md`: the cleanup-preservation paragraph (line 221) says `carries work origin/dev does not — preserved` means no `origin/dev` commit since the merge base holds the branch's version of a named file
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both docs name the new rule and the new cases, and `grep -n "later" docs/testing.md docs/observability.md` shows the new wording on those lines
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->
