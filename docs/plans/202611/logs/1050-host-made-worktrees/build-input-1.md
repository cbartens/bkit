## Session Prompt — this run's, newer than everything below

/bkit-build #1050 publish=false

## Issue description — oldest

### What happened

"Worktree setup tries a second worktree when the session already sits on feat/{FID}" (https://github.com/cbartens/bkit/issues/919) made `bkit worktrees setup` adopt a worktree that a host made, instead of adding a second one. The build's review found five places that still assume a run lives either in `.worktrees/{FID}` or in the main checkout. Row 1 is the review's own LOW finding; rows 2 to 5 were seen in the code and not run.

<!-- prettier-ignore -->
| # | Where | What goes wrong |
| --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/worktrees.ts:1258` | Inside a git submodule the new main-checkout refusal does not fire. The guard compares the top folder with the parent of `--git-common-dir`, which in a submodule is `{super}/.git/modules`. Design, plan and build then run in place there, and an abort or pause handover commits every uncommitted file in that checkout. |
| 2 | `openSharedRecord` in `worktrees.ts` | Debug on `dev` from a linked worktree is adopted, but its shared-checkout record is written under the main checkout's `.git/bkit`. The linked worktree never finds it, so the run cannot commit (exit 14 or 20). Nothing leaks. |
| 3 | `statusLocation` in `.bkit/core/engine/commands/lib.ts` | It looks for a run's status file only in `.worktrees/{fid}` or the main checkout, never in a worktree a host made. A caller that passes no `--file`, such as `failState`, reads the wrong copy. |
| 4 | `worktrees.ts`, adopted mode | Design and plan run from inside an adopted worktree skip the refusal for a branch that carries unpushed `dev` commits. |
| 5 | `worktrees.ts`, adopted mode | Adopted mode skips fetch, rebase and install. A worktree a host made may have no `.husky/_`, so its pre-push hook does not run. |

### What should happen

A run in a host-made worktree gets the same checks, the same status file and the same hooks as a run in `.worktrees/{FID}`.

### How bad

Medium for row 5: a push from such a worktree skips the pre-push gates without saying so. Low for the rest. Row 1 has a deferral row in `docs/deferrals.jsonl` under `919-worktree-setup-tries-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-1258`.

### Possible fix

- Row 1: refuse when `git rev-parse --absolute-git-dir` equals `git rev-parse --git-common-dir`.
- Rows 2 and 3: resolve the run's home from the session's own checkout, in one helper both callers use.
- Row 4: run the unpushed-`dev` check in adopted mode too.
- Row 5: in adopted mode, check that `.husky/_` exists and say so when it does not, or run the install.

Reproduce each row first; drop any that does not reproduce.

### Removes

Nothing known yet. Rows 2 and 3 may remove a second copy of "where does this run live".
