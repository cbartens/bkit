# Brief: group 2 — The setup checks (tests)

Plan: Host-made worktrees: the same checks, status file and hooks Implementation Plan

## Why and what

### Context & Goals

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

### Narrative

A person starts a design, plan, build or debug run from a worktree their host made. They get the same refusals, the same status file location and a plain warning when the git hooks are not set up, as in a worktree bkit made.

### Success Criteria

- In a git submodule's main checkout on `feat/{FID}`, design, plan and build setup exits 7 and writes no log directory.
- Debug on `dev` from a linked worktree writes its shared-checkout record where that worktree reads it, from that worktree's own dirty files.
- `statusLocation` returns the host-made worktree's copy of the status file (or its log directory when the file is not written yet) for every caller, with or without `--file`.
- Design and plan setup adopted in a worktree on a branch carrying unpushed `dev` commits exits 7 with the same message as a resumed branch.
- Adopted setup says plainly, in its output and on stderr, when the hooks directory git is told to use is missing, and what to run.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| `repoRoot` / `mainCheckoutRoot` returning `{super}/.git/modules` inside a submodule | Only the row 1 refusal is asked for; the root helper is shared by many callers | A follow-up issue if submodule runs are to be supported beyond the refusal |
| `failState`'s own `.worktrees/{fid}`-else-top line in `workflows.ts` | `workflows.ts` is outside this run's files; it already picks the session's checkout | Follow-up if it should call `sessionCheckout` |
| Fetching `origin/dev` in adopted mode before the row 4 check | The issue asks for the check, not a fetch | A follow-up if stale-ref false refusals show up |

## Where it fits

- Group 1: The run's home from the session's own checkout — done
  - TASK 1: Find a host-made worktree's status file (row 3), with the helper rows 1 and 2 also use — done
- Group 2: The setup checks — this group
  - TASK 2: Refuse design, plan and build in a main checkout, a submodule's included (row 1) — open
  - TASK 3: Write debug-on-`dev`'s shared-checkout record where the linked worktree reads it (row 2) — open
  - TASK 4: Run the unpushed-`dev` refusal in adopted design and plan (row 4) — open
  - TASK 5: Say plainly when an adopted worktree has no git hooks directory (row 5) — open
- Group 3: Docs, ledger and build output — next
  - TASK 6: State the two changed rules in their doc sources — open
  - TASK 7: Close the row 1 deferral — open
  - TASK 8: Rebuild `dist/` — open

## The work

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Refuse design, plan and build in a main checkout, a submodule's included (row 1)
  - **UPDATE:** `run` in `.bkit/core/engine/commands/workflow/worktrees.ts`: the refusal guard calls `!inLinkedWorktree(ctx.cwd)` instead of comparing the top level with the parent of the common git dir
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.test.ts`: the new submodule case beside the existing main-checkout refusal test
  - **READ:** `.bkit/core/engine/commands/lib.ts`: the `inLinkedWorktree` helper TASK 1 adds
  - **DEPENDS ON:** 1
  - **DONE WHEN:** design, plan and build under `--worktrees` in a submodule's main checkout on `feat/{fid}` exit 7 and write no log directory; a linked worktree on `feat/{fid}` and a main checkout on its own branch still adopt; the existing main-checkout refusal test passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `refuses design, plan and build in place in a submodule's main checkout on feat/{fid}` fails on setup exiting 0 and adopting in place instead of exit 7 with no log directory

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Write debug-on-`dev`'s shared-checkout record where the linked worktree reads it (row 2)
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

- [ ] **TASK 4:** Run the unpushed-`dev` refusal in adopted design and plan (row 4)
  - **UPDATE:** `run` in `.bkit/core/engine/commands/workflow/worktrees.ts`: drop `mode !== "adopted"` from the docs-only refusal; in adopted mode check the checked-out branch (not `target`) and skip when `refs/remotes/origin/dev` does not exist
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts`: the new case in "a host-made worktree on feat/{fid}"
  - **READ:** `inheritedDevCommits` in `.bkit/core/engine/commands/workflow/worktrees.ts`: reused as it is, with `inheritedDevRefusal` for the message
  - **DEPENDS ON:** 3
  - **DONE WHEN:** plan setup from a host-made worktree whose branch holds a local-`dev`-only commit exits 7 with "1 commit(s) of unpushed dev" and no log directory; build from the same worktree adopts; the existing host-made, adopt-in-place and no-remote unit tests still pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` `refuses plan from a host-made worktree whose branch carries unpushed dev work` fails on setup exiting 0 and adopting instead of exit 7 with "1 commit(s) of unpushed dev"

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Say plainly when an adopted worktree has no git hooks directory (row 5)
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.ts`: add `missingHooksDir(checkout)` (reads `core.hooksPath`; relative paths resolve against the checkout; null when unset or present); in adopted mode `run` logs one line and emits optional `hooksMissing`; add the field to the verb's `output` map
  - **UPDATE:** `.bkit/core/engine/commands/workflow/worktrees.test.ts`: the new case in "adopt the checkout the session is already on"
  - **DEPENDS ON:** 4
  - **DONE WHEN:** adopted setup with `core.hooksPath=.husky/_` and no `.husky/_` in the checkout emits `hooksMissing: ".husky/_"` and a stderr line naming the directory, the hooks that do not run and the install to run; with the directory present or `core.hooksPath` unset, `hooksMissing` is absent; the adopted full-shape `toEqual` test is unchanged and passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `says so when the adopted worktree has no hooks directory` fails on `hooksMissing` being absent and stderr silent, where ".husky/_" should be named

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Find a host-made worktree's status file (row 3), with the helper rows 1 and 2 also use — `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/lib.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| row 1: design, plan and build under `--worktrees` in a submodule's main checkout on `feat/{fid}` exit 7 and write no log directory | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 2 |
| row 2: debug in place on `dev` from a linked worktree writes the record under that worktree's git dir, from that worktree's dirty files | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 3 |
| row 4: plan from a host-made worktree whose branch carries unpushed `dev` commits exits 7, and build from it still adopts | Integration | `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | 4 |
| row 5: adopted setup with `core.hooksPath` set and its directory missing reports `hooksMissing` and warns on stderr; with the directory present it reports nothing | Unit | `.bkit/core/engine/commands/workflow/worktrees.test.ts` | 5 |

## Deviations

- Files you may change: `.bkit/core/engine/commands/workflow/worktrees.ts`, `.bkit/core/engine/commands/lib.ts`, their test files (`worktrees.test.ts`, `branches.test.ts`, `lib.test.ts` or the test file that already covers the function you change), the built `dist/`, `docs/deferrals.jsonl` through `bkit ledgers append` only (to close the row the issue names for row 1), and a doc line only where a doc states the rule you change (doc sources are `.bkit/core/.bkit/*.md`; rendered copies are regenerated with `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never edited by hand).
- Files you must not change: `.bkit/core/engine/commands/workflow/steps.ts`, `tasks.ts`, `tests.ts`, `decisions.ts`, `status.ts`, `ledgers.ts`, `summary.ts`, `workflows.ts`, `issues.ts`, `challenge.ts`, `open-decision.ts`, `.bkit/core/engine/ledgers/status.ts`, `.bkit/instructions.md`, and every workflow and prompt file. The build of issue 958 changes them and runs beside you. If a row cannot be fixed without one of them, leave that row out, say so in your report, and message the orchestrator with what you found.
- The change: the five rows of the issue's table. The issue says: "Reproduce each row first; drop any that does not reproduce." Do exactly that, one test per row, each seen red before the code changes. A row that does not reproduce is dropped and named in your report with what you ran.
- Rows 2 and 3 ask for one helper that answers "where does this run live" for both callers. Do not add a second copy of that lookup: if a helper already answers it, extend it.
- Row 5: prefer saying plainly that `.husky/_` is missing and what to run over running an install inside adopted mode, unless the code already has an install path adopted mode can reuse as it is. Say which one you chose and why.
- Before changing a function, check every caller of it (`statusLocation` has callers that pass no `--file`), and say in your report what each caller does after the change.
- No word-count change is expected. `pnpm bkit:text:ceiling check` must still pass. Never `raise`.
