# Host-made worktrees: the same checks, status file and hooks Implementation Plan

## Context & Goals

Issue #1050 lists five places where `bkit worktrees setup` and the status-file lookup still assume a run lives either in `.worktrees/{FID}` or in the main checkout, after #919 made setup adopt a worktree a host made. Goal: a run in a host-made worktree gets the same checks, the same status file and the same hooks as a run in `.worktrees/{FID}`.

Every row was checked in the code before it was planned. All five reproduce:

- **Row 1 (submodule):** ran `bkit worktrees setup --workflow=plan --worktrees` inside a throwaway git submodule on `feat/42-thing`. It exited 0, `mode: "adopted"`, wrote `docs/plans/202611/logs/42-thing/` in place, and reported `repoRoot` as `{super}/.git/modules`. The refusal did not fire.
- **Row 2 (debug on `dev` from a linked worktree):** ran `bkit worktrees setup --workflow=debug --branch=dev --worktrees` from a linked worktree on `dev` (main checkout on another branch). The shared-checkout record landed in the main checkout's `.git/bkit/shared-checkout/42-thing.json` with `paths: []`. This git (2.56) puts `bkit/...` under the per-worktree git dir for a linked worktree (`.git/worktrees/{name}/bkit/...`), which is where every later reader (`readRecord`, `activeRecord`, `commitOwnSet`) looks, so the record is never found. The record also holds the main checkout's dirty files, not the linked worktree's.
- **Row 3 (`statusLocation`):** by code. `.bkit/core/engine/commands/lib.ts` `statusLocation` checks only `.worktrees/{fid}` and then the main checkout. A host-made worktree's `status.jsonl` is never returned.
- **Row 4 (unpushed `dev` in adopted design / plan):** by code. The refusal in `worktrees.ts` is guarded by `mode !== "adopted"`, so an adopted design or plan on a branch holding unpushed `dev` commits sails through.
- **Row 5 (missing `.husky/_`):** by code. `worktrees.ts` has no hooks check anywhere, and adopted mode skips install. A new linked worktree has no `.husky/_` (it is generated, not tracked) while the clone-wide `core.hooksPath` still points at it, so no hook runs.

**Related Issues:**

- #1050 — host-made worktrees: five places still assume `.worktrees/{FID}` or the main checkout (open)
- #919 — worktree setup tries a second worktree when the session already sits on `feat/{FID}` (the change this follows up)

---

## 👤 ⚠️ Acceptance Scenario

### Narrative

A person starts a design, plan, build or debug run from a worktree their host made. They get the same refusals, the same status file location and a plain warning when the git hooks are not set up, as in a worktree bkit made.

### Success Criteria

- In a git submodule's main checkout on `feat/{FID}`, design, plan and build setup exits 7 and writes no log directory.
- Debug on `dev` from a linked worktree writes its shared-checkout record where that worktree reads it, from that worktree's own dirty files.
- `statusLocation` returns the host-made worktree's copy of the status file (or its log directory when the file is not written yet) for every caller, with or without `--file`.
- Design and plan setup adopted in a worktree on a branch carrying unpushed `dev` commits exits 7 with the same message as a resumed branch.
- Adopted setup says plainly, in its output and on stderr, when the hooks directory git is told to use is missing, and what to run.

### Process Sketch

- **WHEN** `worktrees setup` runs design / plan / build under `--worktrees` in a main checkout on `feat/{FID}` **→ THEN** it exits 7, even when that main checkout is a submodule.
- **WHEN** debug runs in place on `dev` from a linked worktree **→ THEN** the shared-checkout record is written for that worktree and found by its commit and push.
- **WHEN** a command with no `--file` asks `statusLocation` from a host-made worktree that holds the run **→ THEN** it gets that worktree's file.
- **WHEN** design or plan adopts a branch that holds unpushed `dev` commits **→ THEN** it exits 7 telling the user to publish `dev`.
- **WHEN** adopted setup finds `core.hooksPath` set and its directory missing in the checkout **→ THEN** the output carries `hooksMissing` and stderr names the directory and what to run.
- **IF** the repository has no `origin/dev` ref (a local-only repo) **→ THEN** the adopted unpushed-`dev` check is skipped, as there is nothing to compare with.

### Concrete Example

**Setup:** A repo with `core.hooksPath=.husky/_`, a host-made worktree on `feat/42-thing`, and local `dev` two commits ahead of `origin/dev` that the branch contains.

**Steps:**

1. User runs `bkit worktrees setup --workflow=plan --fid=42-thing --month=202611 --worktrees` from the host worktree → System exits 7: the branch carries 2 commits of unpushed `dev`; publish `dev`, then re-run.
2. User pushes `dev` and re-runs → System adopts the worktree, and prints `hooksMissing: ".husky/_"` with a stderr line saying the pre-commit and pre-push hooks do not run there and to run the project's dependency install in that worktree.

**Outcome:** The run starts only when it can land, and the user knows before pushing that the pre-push gates would not have run.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Session in a linked worktree under `.worktrees/{FID}` | Unchanged: it is a linked worktree, adopted or resumed as before. |
| `statusLocation` from the main checkout with `.worktrees/{FID}` holding the file | Unchanged: the minted worktree's copy wins. |
| `statusLocation` from an unrelated linked worktree whose log directory for the FID does not exist | Falls back to the main checkout, as before. |
| Local repo with no remote, design / plan adopted | No `origin/dev` ref: the unpushed-`dev` check is skipped, setup adopts as before. |
| `core.hooksPath` unset | No hooks are expected, so no warning and no `hooksMissing`. |
| Ship and debug in the main checkout | Keep their in-place adoption (the refusal applies to design / plan / build only). |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| row 3: `statusLocation` from a host-made linked worktree returns that worktree as the book root, with the status file present and with only its log directory present | Unit | `.bkit/core/engine/commands/lib.test.ts` | 1 |
| row 1: design, plan and build under `--worktrees` in a submodule's main checkout on `feat/{fid}` exit 7 and write no log directory | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 2 |
| row 2: debug in place on `dev` from a linked worktree writes the record under that worktree's git dir, from that worktree's dirty files | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 3 |
| row 4: plan from a host-made worktree whose branch carries unpushed `dev` commits exits 7, and build from it still adopts | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 4 |
| row 5: adopted setup with `core.hooksPath` set and its directory missing reports `hooksMissing` and warns on stderr; with the directory present it reports nothing | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 5 |
| does not report a ~ hooks directory that exists | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 9 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

One new optional output field on `bkit worktrees setup`: `hooksMissing` (the missing hooks directory as git is told to find it, e.g. `.husky/_`). It is absent unless a hook directory is missing, so no existing consumer or exact-shape test changes. Two new exported helpers in `.bkit/core/engine/commands/lib.ts`: `inLinkedWorktree` and `sessionCheckout`. The refusal in row 1 now also fires in a submodule's main checkout, which is the fix itself. No other breaking change.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

- **Assumption:** A stale `origin/dev` in adopted mode is acceptable for the row 4 check → adopted mode does no fetch (the issue does not ask for one), so a `dev` that was pushed by someone else since the last fetch could show a false "unpushed" refusal. The message says to publish `dev` and re-run, which is a no-op push in that case. The resume path has the same property today (its check runs before its fetch).
- **Assumption:** A remote-less clone has nothing to compare with → the adopted row 4 check is skipped when `refs/remotes/origin/dev` is absent, so local-only adoption keeps working.
- **Row 5 decision (no Q, stated):** say plainly that the hooks directory is missing and what to run; do not run an install. See Alternative Approaches.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- **Row 5, run the install in adopted mode (rejected):** the existing `install(wt, log)` in `worktrees.ts` could be called, but adopted mode skips install on purpose. It is also used on the main checkout when the runtime cannot mint worktrees, where an install rewrites dependencies and may run for minutes under a session that never asked for it, and `install` is gated by `config.worktreeInstall` and exit codes 5 and 6 that adopted callers do not handle. Warning is cheap, safe and visible. The chosen path reuses nothing from install.
- **Row 5, hard-code `.husky/_` (rejected):** bkit assumes no stack. Reading `core.hooksPath` (the directory git is told to run hooks from) gives the same answer for this repo and works for any hooks tool; nothing is checked when it is unset.
- **Row 2, pass `root` and `checkout` separately (chosen):** locks stay under the main checkout (`workflowLockLive(root, ...)`), while every record and git read moves to the adopted checkout, matching where `activeRecord` reads from the commit side.
- **Row 3, scan every linked worktree (rejected):** more git calls and guesses. The session's own checkout is the right place to look.

**Callers of `statusLocation` and what each does after the change** (none passes a file path it did not have; a cwd in the main checkout or in `.worktrees/{fid}` resolves exactly as before):

- `.bkit/core/engine/commands/lib.ts` `resolveActiveRun` (`--fid`, no `--file`): now also finds a host-made worktree's run.
- `.bkit/core/engine/commands/workflow/status.ts` `routeFile` (debug, `--prompt-file` + `--fid`, no `--file`): reads the host-made worktree's file.
- `.bkit/core/engine/commands/workflow/status.ts` `status path` verb: reports the host-made worktree's path and `bookRoot`.
- `.bkit/core/engine/commands/workflow/workflows.ts` `failState` (no `--file`): appends `workflow-failed` to the right copy. Its own `tree` line there (`.worktrees/{fid}`, else the session's top) already picks the session's checkout; it is a fourth copy of the lookup that this plan leaves alone because `workflows.ts` is outside this run's file list.
- `.bkit/core/engine/commands/workflow/workflows.ts` `inputVerb` (no `--file`): reads the right copy of the status file.
- ship branch of `statusLocation` itself: keeps its rule (current worktree top), now through `sessionCheckout`.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| `repoRoot` / `mainCheckoutRoot` returning `{super}/.git/modules` inside a submodule | Only the row 1 refusal is asked for; the root helper is shared by many callers | A follow-up issue if submodule runs are to be supported beyond the refusal |
| `failState`'s own `.worktrees/{fid}`-else-top line in `workflows.ts` | `workflows.ts` is outside this run's files; it already picks the session's checkout | Follow-up if it should call `sessionCheckout` |
| Fetching `origin/dev` in adopted mode before the row 4 check | The issue asks for the check, not a fetch | A follow-up if stale-ref false refusals show up |

## Suggested Scope Expansion

None.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The hooks check reads one git config value and tests that a directory exists; no value is executed.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no package change.
- [ ] **Dependency Versions:** no dependency change.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** the files are in the working tree.
- [ ] **Project Context:** `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows about worktree adoption read by the build.
- [ ] **Project Documents:** assessed in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Deployments & Setup:** none beyond rebuilding `dist/` (TASK 8).

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** no `NEW` row exists.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — the worktree and outbox boundary | `docs/architecture.md` (system context paragraph on the private outbox across linked worktrees) | covered | None. |
| technology | `docs/technology.md` | yes — TypeScript engine conventions | `docs/technology.md` § Conventions | covered | None. |
| security | `docs/security.md` | yes — CLI input and repository paths | `docs/security.md` § Trust boundaries (CLI and project hooks) | covered | None. |
| testing | `docs/testing.md` | yes — tier choice and where tests live | `docs/testing.md` § Where tests live, § Test first, and the `worktrees.test.ts` / `worktrees.integration.test.ts` rows | covered | None. |
| setup | `docs/setup.md` | yes — hooks and worktrees are local setup | `docs/setup.md` § Troubleshooting | covered | No row change: the warning text states its own fix. |
| deployments | `docs/deployments.md` | no — no release, CI or branch rule changes | none | not applicable | None. |
| data-schema | `docs/data-schema.md` | no — no database | none | not applicable | None. |
| design | `docs/design.md` | no — no UI | none | not applicable | None. |
| observability | `docs/observability.md` | no — one stderr line through the existing `ctx.log` | none | not applicable | None. |
| noise | `docs/noise.md` | no — nothing touches it | none | not applicable | None. |

Doc sources for the two rule statements that change: `.bkit/core/.bkit/cli.md` (the `status.jsonl` row) and `.bkit/core/.bkit/workflows.md` (the `design` / `plan` bullet under Worktree isolation). Rendered copies are regenerated by `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never edited.

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
| Where the session's own checkout and a run's home are (rows 2, 3) | `.bkit/core/engine/commands/lib.ts` | `grep -n "show-toplevel" lib.ts worktrees.ts workflows.ts`; references to `statusLocation`, `repoRoot`, `mainCheckoutRoot`; `grep -rn "absolute-git-dir" .bkit/core/engine --include='*.ts'` | `statusLocation` (ship branch inlines the top-level lookup; non-ship checks only `.worktrees/{fid}`), `repoRoot`, `mainCheckoutRoot`, `adoptRoot` inline in `worktrees.ts` | EXTEND | Add `inLinkedWorktree` and `sessionCheckout` beside `repoRoot`; `statusLocation` and `worktrees.ts` call them, which removes the inline `git rev-parse --show-toplevel ?? root` copies in `statusLocation` (ship) and in `adoptRoot`, and the `real(top) === real(root)` compare in the refusal. |
| Refuse in a main checkout, submodule included (row 1) | `.bkit/core/engine/commands/workflow/worktrees.ts` | `grep -n "refusing to run" worktrees.ts`; references to `real(` | The existing refusal guard | EXTEND | Replace the compare with `!inLinkedWorktree(ctx.cwd)`. |
| Record home for debug on `dev` in a linked worktree (row 2) | `.bkit/core/engine/commands/workflow/worktrees.ts` | references to `openSharedRecord`, `newRecord`, `listRecords`, `recordPathOf` in `ledgers.ts`; probe of `git rev-parse --git-path bkit/...` in a linked worktree | `openSharedRecord(root, ...)` already does the work, on the wrong checkout | EXTEND | Give it a `checkout` argument for every record and git read; `root` stays for locks. |
| Unpushed-`dev` refusal in adopted design / plan (row 4) | `.bkit/core/engine/commands/workflow/worktrees.ts` | references to `inheritedDevCommits`, `inheritedDevRefusal`, `DOCS_ONLY_WORKFLOWS` | The mint / resume refusal block | EXTEND | Drop the `mode !== "adopted"` guard, check the checked-out branch, skip without `origin/dev`. |
| Hooks-directory warning in adopted mode (row 5) | `.bkit/core/engine/commands/workflow/worktrees.ts` | `grep -rln "hooksPath" .bkit/core/engine --include='*.ts'`; `grep -n "husky" worktrees.ts` | `land.ts` and `tests-base.ts` only disable hooks; `install()` in `worktrees.ts` runs the package manager (rejected, see Alternatives) | EXTEND | A small `missingHooksDir` function in `worktrees.ts`, called in adopted mode; emitted as the optional `hooksMissing` field. |
| Tests for the five rows | `.bkit/core/engine/commands/lib.test.ts`, `.bkit/core/engine/commands/workflow/worktrees.test.ts`, `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | `grep -n "describe(" worktrees.test.ts`; read the host-worktree describes | Existing `hostWorktree`, `repo`, `setup`, `fixture` helpers and describes | EXTEND | New cases join the existing describes; no new test file. |

## Architecture & Component Changes

**Ledger rows:** `919-worktree-setup-tries-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-1258` (closed by TASK 7 through `bkit ledgers append`).

### Engine

#### [MODIFY] `.bkit/core/engine/commands/lib.ts`

- **Existence Check:** the file exists (1236 lines).
- Add `inLinkedWorktree(cwd)`: true when `git rev-parse --absolute-git-dir` differs from `--git-common-dir` (real paths). A main checkout and a submodule's checkout are not linked.
- Add `sessionCheckout(cwd)`: the top of the checkout `cwd` sits in, else the main checkout.
- `statusLocation`: ship uses `sessionCheckout`; non-ship returns `.worktrees/{fid}` when it holds the status file, else the session's checkout when it is a linked worktree whose log directory (`docs/plans/{month}/logs/{fid}`) exists, else the main checkout.

#### [MODIFY] `.bkit/core/engine/commands/workflow/worktrees.ts`

- **Existence Check:** the file exists (1552 lines).
- Refusal guard uses `!inLinkedWorktree(ctx.cwd)`.
- `adoptRoot` uses `sessionCheckout(ctx.cwd)`; `openSharedRecord(root, checkout, ...)` reads and writes records and runs git in `checkout`, and takes locks under `root`.
- Docs-only refusal also runs in adopted mode, on the checked-out branch.
- Adopted mode reports `hooksMissing` and logs a plain line.

### Tests and build output

- Tests land in the three existing test files named in the matrix. `dist/` is rebuilt (`pnpm build`).

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| Inline `git rev-parse --show-toplevel ?? root` in `statusLocation` (ship) | `sessionCheckout` | DELETE | One lookup, not two |
| Inline `adoptRoot` top-level expression in `worktrees.ts` | `sessionCheckout` | DELETE | Same |
| `real(git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root) === real(root)` in the refusal | `!inLinkedWorktree(ctx.cwd)` | DELETE | The compare is the row 1 bug |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/cli.md` | The `status.jsonl` row: a worktree the host made counts as the run's copy. |
| `.bkit/core/.bkit/workflows.md` | The `design` / `plan` bullet: an adopted branch carrying such work is refused too. |
| `docs/testing.md` | None — the test files named there already cover worktrees. |
| `docs/decisions.jsonl` | None — no new decision beyond the Alternatives above. |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: The run's home from the session's own checkout

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Find a host-made worktree's status file (row 3), with the helper rows 1 and 2 also use
  - **UPDATE:** `statusLocation` in `.bkit/core/engine/commands/lib.ts`: ship uses `sessionCheckout`; non-ship returns `.worktrees/{fid}` holding the file, else the session's linked worktree when its log directory exists, else the main checkout
  - **UPDATE:** `.bkit/core/engine/commands/lib.ts`: add exported `inLinkedWorktree(cwd)` and `sessionCheckout(cwd)` beside `repoRoot`
  - **UPDATE:** `.bkit/core/engine/commands/lib.test.ts`: the new test in the `statusLocation` describe
  - **READ:** `.bkit/core/engine/commands/workflow/status.ts`: `routeFile` and the `status path` verb, callers that pass no `--file`
  - **READ:** `.bkit/core/engine/commands/workflow/workflows.ts`: `failState` and `inputVerb`, callers that pass no `--file`
  - **READ:** `docs/testing.md`: § Where tests live
  - **DONE WHEN:** `statusLocation` from a linked worktree outside `.worktrees/` returns that worktree as `bookRoot` when it holds the status file or its log directory; the existing statusLocation tests in `lib.test.ts` still pass; `grep -n "show-toplevel" .bkit/core/engine/commands/lib.ts` shows no top-level lookup inside `statusLocation`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/lib.test.ts` `a host-made linked worktree holds the run` fails on `bookRoot` being the main checkout "expected host worktree" instead of the linked worktree, for the status-file-present and log-directory-only cases

<!-- bkit:task 1 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: The setup checks

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Refuse design, plan and build in a main checkout, a submodule's included (row 1)
  - **UPDATE:** `run` in `.bkit/core/engine/commands/workflow/worktrees.ts`: the refusal guard calls `!inLinkedWorktree(ctx.cwd)` instead of comparing the top level with the parent of the common git dir
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.test.ts`: the new submodule case beside the existing main-checkout refusal test
  - **READ:** `.bkit/core/engine/commands/lib.ts`: the `inLinkedWorktree` helper TASK 1 adds
  - **DEPENDS ON:** 1
  - **DONE WHEN:** design, plan and build under `--worktrees` in a submodule's main checkout on `feat/{fid}` exit 7 and write no log directory; a linked worktree on `feat/{fid}` and a main checkout on its own branch still adopt; the existing main-checkout refusal test passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `refuses design, plan and build in place in a submodule's main checkout on feat/{fid}` fails on setup exiting 0 and adopting in place instead of exit 7 with no log directory

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Write debug-on-`dev`'s shared-checkout record where the linked worktree reads it (row 2)
  - **UPDATE:** `openSharedRecord` in `.bkit/core/engine/commands/workflow/worktrees.ts`: take `(root, checkout, fid, workflow, logDir)`; `listRecords`, `removeRecord`, `readRecord`, `newRecord`, `writeRecord`, `landedRunCommits`, the parked-commit reads and every git read use `checkout`; only the lock checks use `root`
  - **UPDATE:** `run` in `.bkit/core/engine/commands/workflow/worktrees.ts`: `adoptRoot` comes from `sessionCheckout(ctx.cwd)` and is passed to `openSharedRecord`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.test.ts`: the new case in the "debug in place on dev shares the checkout" describe
  - **READ:** `readRecord` in `.bkit/core/engine/commands/workflow/ledgers.ts`: records live under `git rev-parse --git-path`, per worktree for a linked worktree
  - **DEPENDS ON:** 1
  - **DONE WHEN:** after `setup --workflow=debug --branch=dev --worktrees` from a linked worktree on `dev`, `git rev-parse --git-path bkit/shared-checkout/{fid}.json` run in that worktree names an existing record whose `paths` hold that worktree's dirty file; the existing in-place-on-dev tests (main checkout) still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `debug in place on dev from a linked worktree records its own checkout` fails on the record file under the linked worktree's git dir being missing, with the record sitting in the main checkout's `.git/bkit` and holding no dirty paths

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Run the unpushed-`dev` refusal in adopted design and plan (row 4)
  - **UPDATE:** `run` in `.bkit/core/engine/commands/workflow/worktrees.ts`: drop `mode !== "adopted"` from the docs-only refusal; in adopted mode check the checked-out branch (not `target`) and skip when `refs/remotes/origin/dev` does not exist
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`: the new case in "a host-made worktree on feat/{fid}"
  - **READ:** `inheritedDevCommits` in `.bkit/core/engine/commands/workflow/worktrees.ts`: reused as it is, with `inheritedDevRefusal` for the message
  - **DEPENDS ON:** 3
  - **DONE WHEN:** plan setup from a host-made worktree whose branch holds a local-`dev`-only commit exits 7 with "1 commit(s) of unpushed dev" and no log directory; build from the same worktree adopts; the existing host-made, adopt-in-place and no-remote unit tests still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `refuses plan from a host-made worktree whose branch carries unpushed dev work` fails on setup exiting 0 and adopting instead of exit 7 with "1 commit(s) of unpushed dev"

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Say plainly when an adopted worktree has no git hooks directory (row 5)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: add `missingHooksDir(checkout)` (reads `core.hooksPath`; relative paths resolve against the checkout; null when unset or present); in adopted mode `run` logs one line and emits optional `hooksMissing`; add the field to the verb's `output` map
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.test.ts`: the new case in "adopt the checkout the session is already on"
  - **DEPENDS ON:** 4
  - **DONE WHEN:** adopted setup with `core.hooksPath=.husky/_` and no `.husky/_` in the checkout emits `hooksMissing: ".husky/_"` and a stderr line naming the directory, the hooks that do not run and the install to run; with the directory present or `core.hooksPath` unset, `hooksMissing` is absent; the adopted full-shape `toEqual` test is unchanged and passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `says so when the adopted worktree has no hooks directory` fails on `hooksMissing` being absent and stderr silent, where ".husky/_" should be named

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Docs, ledger and build output

<!-- bkit:task 6 start -->

- [x] **TASK 6:** State the two changed rules in their doc sources
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the `status.jsonl` row also names a worktree the host made (the session's linked worktree holding the run)
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the `design` / `plan` bullet under Worktree isolation says an adopted branch carrying unpushed `dev` work is refused at Step 2 (exit 7) as a resumed one is
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply and § Before You Save
  - **DEPENDS ON:** 5
  - **DONE WHEN:** both source lines state the new rule; `pnpm tsx .bkit/core/engine/cli.ts upgrade` regenerates the rendered copies with no hand edit; no workflow or prompt file changed
  - **TEST FIRST:** n/a — documentation only, no behaviour change

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [x] **TASK 7:** Close the row 1 deferral
  - **UPDATE:** `docs/deferrals.jsonl`: a same-key row with `status: "CLOSED"` for `919-worktree-setup-tries-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-1258`, appended only through `bkit ledgers append --ledger=deferrals`
  - **READ:** `.bkit/core/.bkit/jsonl.md`: § Updating a Row and the deferral fields
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `bkit ledgers query` for that key reports `CLOSED`, and `git diff docs/deferrals.jsonl` shows one appended line and no other change
  - **TEST FIRST:** n/a — ledger row appended through the engine command, no behaviour change

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [x] **TASK 8:** Rebuild `dist/`
  - **UPDATE:** `dist/commands/lib.js`: compiled from the `lib.ts` change
  - **UPDATE:** `dist/commands/workflow/worktrees.js`: compiled from the `worktrees.ts` change
  - **DEPENDS ON:** 5
  - **DONE WHEN:** `pnpm build` exits 0 and `grep -l inLinkedWorktree dist/commands/lib.js dist/commands/workflow/worktrees.js` lists both files
  - **TEST FIRST:** n/a — generated build output, regenerated by `pnpm build`

<!-- bkit:task 8 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 1 findings

<!-- bkit:task 9 start -->

- [x] **TASK 9:** A user whose git config sets core.hooksPath=~/.githooks (an existing directory git expands and runs hooks from) gets hooksMissing "~/.githooks" and a stderr line telling the agent the commit and push hooks do not run and to run the package install, on every adopted setup
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/worktrees.ts:351` · **Round:** 1
  - **DONE WHEN:** `missingHooksDir` reads `core.hooksPath` with git's path expansion (`git config --type=path --get core.hooksPath`, or `git rev-parse --git-path hooks`), so a `~/` value is resolved to the home directory before the existence check; adopted setup with `core.hooksPath=~/.githooks` emits no `hooksMissing` and no stderr warning when `$HOME/.githooks` exists, and still reports it when that directory is missing; the relative `.husky/_` cases in "says so when the adopted worktree has no hooks directory" still pass. Verified on git 2.56: `git config --get` returns the raw `~/.githooks-probe`, while `--type=path` and `--git-path hooks` both return the expanded home path, and `path.isAbsolute("~/...")` is false, so the code joins it onto the checkout and finds nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `does not report a ~ hooks directory that exists` fails on `hooksMissing` being `"~/.githooks"` and stderr naming it, with `HOME` stubbed to a temp dir holding `.githooks` and `core.hooksPath` set to `~/.githooks` on a host worktree adopted for plan

<!-- bkit:task 9 end -->
<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** no `[NEW]` file exists.
- [ ] **Extensions landed:** every `EXTEND` landed in the file its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** the one new stderr line goes through `ctx.log`.
- [ ] **Update documentation:** the two doc sources are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Test Synchronization:** no E2E tests to update.
- [ ] **Build Configuration:** test files are already excluded from the build by the repo's compiler config.
- [ ] **Unit (`lib.test.ts`, `worktrees.test.ts`) and Integration (`worktrees.integration.test.ts`):** the five matrix tests pass.
- [ ] **Run all tests:** `pnpm test` and the integration suite pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch clone with `core.hooksPath=.husky/_`, make a worktree outside `.worktrees/`, run `node dist/cli.js worktrees setup --workflow=plan --fid=x --month=202611 --worktrees` from it, and confirm `hooksMissing` and the stderr line.
