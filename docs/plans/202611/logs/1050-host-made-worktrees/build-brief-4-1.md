# Brief: group 4 — Challenge round 1 findings

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
- Group 2: The setup checks — done
  - TASK 2: Refuse design, plan and build in a main checkout, a submodule's included (row 1) — done
  - TASK 3: Write debug-on-`dev`'s shared-checkout record where the linked worktree reads it (row 2) — done
  - TASK 4: Run the unpushed-`dev` refusal in adopted design and plan (row 4) — done
  - TASK 5: Say plainly when an adopted worktree has no git hooks directory (row 5) — done
- Group 3: Docs, ledger and build output — done
  - TASK 6: State the two changed rules in their doc sources — done
  - TASK 7: Close the row 1 deferral — done
  - TASK 8: Rebuild `dist/` — done
- Group 4: Challenge round 1 findings — this group
  - TASK 9: A user whose git config sets core.hooksPath=~/.githooks (an existing directory git expands and runs hooks from) gets hooksMissing "~/.githooks" and a stderr line telling the agent the commit and push hooks do not run and to run the package install, on every adopted setup — open

## The work

<!-- bkit:task 9 start -->
- [ ] **TASK 9:** A user whose git config sets core.hooksPath=~/.githooks (an existing directory git expands and runs hooks from) gets hooksMissing "~/.githooks" and a stderr line telling the agent the commit and push hooks do not run and to run the package install, on every adopted setup
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/worktrees.ts:351` · **Round:** 1
  - **DONE WHEN:** `missingHooksDir` reads `core.hooksPath` with git's path expansion (`git config --type=path --get core.hooksPath`, or `git rev-parse --git-path hooks`), so a `~/` value is resolved to the home directory before the existence check; adopted setup with `core.hooksPath=~/.githooks` emits no `hooksMissing` and no stderr warning when `$HOME/.githooks` exists, and still reports it when that directory is missing; the relative `.husky/_` cases in "says so when the adopted worktree has no hooks directory" still pass. Verified on git 2.56: `git config --get` returns the raw `~/.githooks-probe`, while `--type=path` and `--git-path hooks` both return the expanded home path, and `path.isAbsolute("~/...")` is false, so the code joins it onto the checkout and finds nothing.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/worktrees.test.ts` `does not report a ~ hooks directory that exists` fails on `hooksMissing` being `"~/.githooks"` and stderr naming it, with `HOME` stubbed to a temp dir holding `.githooks` and `core.hooksPath` set to `~/.githooks` on a host worktree adopted for plan
<!-- bkit:task 9 end -->

## Deviations

- Files you may change: `.bkit/core/engine/commands/workflow/worktrees.ts`, `.bkit/core/engine/commands/lib.ts`, their test files (`worktrees.test.ts`, `branches.test.ts`, `lib.test.ts` or the test file that already covers the function you change), the built `dist/`, `docs/deferrals.jsonl` through `bkit ledgers append` only (to close the row the issue names for row 1), and a doc line only where a doc states the rule you change (doc sources are `.bkit/core/.bkit/*.md`; rendered copies are regenerated with `pnpm tsx .bkit/core/engine/cli.ts upgrade`, never edited by hand).
- Files you must not change: `.bkit/core/engine/commands/workflow/steps.ts`, `tasks.ts`, `tests.ts`, `decisions.ts`, `status.ts`, `ledgers.ts`, `summary.ts`, `workflows.ts`, `issues.ts`, `challenge.ts`, `open-decision.ts`, `.bkit/core/engine/ledgers/status.ts`, `.bkit/instructions.md`, and every workflow and prompt file. The build of issue 958 changes them and runs beside you. If a row cannot be fixed without one of them, leave that row out, say so in your report, and message the orchestrator with what you found.
- The change: the five rows of the issue's table. The issue says: "Reproduce each row first; drop any that does not reproduce." Do exactly that, one test per row, each seen red before the code changes. A row that does not reproduce is dropped and named in your report with what you ran.
- Rows 2 and 3 ask for one helper that answers "where does this run live" for both callers. Do not add a second copy of that lookup: if a helper already answers it, extend it.
- Row 5: prefer saying plainly that `.husky/_` is missing and what to run over running an install inside adopted mode, unless the code already has an install path adopted mode can reuse as it is. Say which one you chose and why.
- Before changing a function, check every caller of it (`statusLocation` has callers that pass no `--file`), and say in your report what each caller does after the change.
- No word-count change is expected. `pnpm bkit:text:ceiling check` must still pass. Never `raise`.
