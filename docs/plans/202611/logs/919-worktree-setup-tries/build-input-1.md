## Session Prompt — this run's, newer than everything below

/bkit-build #919 publish=false

## Issue description — oldest

### What happened

A consumer ran `/bkit-plan` from the Codex app. Before bkit's Step 2 ran, Codex created its own git worktree with its `create_worktree` tool, at `~/.codex/worktrees/{name}/{consumer-repo}`, and named the branch `feat/700-raise-source-unit`. That is the same branch name bkit picks.

Step 2 then ran:

```
bkit worktrees setup --workflow=plan --fid=700-raise-source-unit --month=202611 --detect
```

`--detect` reported that the runtime may create worktrees, so bkit tried to create a second worktree for the same branch. Git refuses to check one branch out in two places:

```
[bkit-worktrees] git worktree add failed: Preparing worktree (checking out 'feat/700-raise-source-unit')
fatal: 'feat/700-raise-source-unit' is already used by worktree at '/Users/{user}/.codex/worktrees/{name}/{consumer-repo}'
```

The command exited 8, the workflow took its Failure Path, and no plan was generated.

### What should happen

When the session is already on `feat/{FID}` in a linked worktree, setup uses that checkout (mode `adopted`) and carries on. It does not try to create a second one.

### Cause

`.bkit/core/engine/commands/workflow/worktrees.ts:1158`:

```ts
const mint = worktrees && !(workflow === "ship" && session === target);
```

Only ship skips creating a worktree when the session's current branch (`session`, line 1103) is already the target branch. Plan, design, build and debug always try to create one when worktrees are allowed. `git worktree add` (`addWorktree`, line 285, called at line 1191) then fails because the branch is already checked out somewhere else.

### Steps to reproduce

1. In a consumer repo, run `git worktree add -b feat/123-x ../wt origin/dev` and `cd ../wt`.
2. Run `bkit worktrees setup --workflow=plan --fid=123-x --month=<YYYYMM> --worktrees`.
3. It exits 8 with the `already used by worktree` error.

### How often

Every time a host makes its own worktree on `feat/{FID}` before Step 2. That happened with the Codex app here.

### Affected area

`bkit worktrees setup`, which runs in Step 2 of bkit-plan, bkit-design, bkit-build, bkit-debug and bkit-ship.

### Open questions

1. Should every workflow use the same rule as ship (current branch == target → use this checkout)? Or should setup look up where the target branch is checked out with `git worktree list --porcelain` and use that path? The second also covers a session started from the main checkout while the branch is checked out somewhere else.
2. Should the workflow prompts tell hosts not to create their own worktree before Step 2, or is it enough for setup to handle one?

### References

- Consumer run: a consumer's plan run, failure record in `.git/bkit-outbox/error.md`
- #812, the other failure in the same run (the placeholder gate firing on fetched issue text)
