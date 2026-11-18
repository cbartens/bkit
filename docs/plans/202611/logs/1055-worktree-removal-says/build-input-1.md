## Session Prompt — this run's, newer than everything below

/bkit-build #1055 publish=false

## Issue description — oldest

### What happened

`bkit worktrees remove --fid={FID} --branch=feat/{FID}` refuses a branch whose work is on `origin/dev`, with `reason: not-landed`, once a later commit on `dev` has changed one of the same files.

Seen on 2026-11-18 after pushing `dev` at `2fa879a63`. Nine builds had been squash-landed one after another. Only the newest one was removed; the other eight were refused:

<!-- prettier-ignore -->
| Branch | Landing commit on `dev` | Files the command named as "work `origin/dev` does not carry" |
| --- | --- | --- |
| `feat/1028-gate-fails-workflow` | `fee013752` | `docs/architecture.md`, `docs/testing.md`, `package.json`, `scripts/gate/bkit-text-ceiling.json` |
| `feat/1030-later-scope-passing` | `b3b3c5eac` | `.bkit/core/.bkit/workflows.md`, `.bkit/version`, `.bkit/workflows.md`, `docs/testing.md` |
| `feat/811-publish-dev-refused` | `fa7b9af16` | `.bkit/core/.bkit/workflows.md`, `.bkit/version`, `.bkit/workflows.md`, `docs/deployments.md`, `docs/testing.md` |
| `feat/1039-ledger-query-status` | `1d0f619ea` | `.bkit/version`, `docs/testing.md` |
| `feat/992-ledger-commands-six` | `97359934d` | 9 files, among them `.bkit/core/engine/commands/workflow/ledgers.ts` |
| `feat/1020-two-small-check` | `5d908d631` | 8 files, among them `.bkit/instructions.md` |
| `feat/819-build-pre-commit` | `4a8b33972` | `docs/deployments.md`, `docs/testing.md` |
| `feat/1018-subagent-commits-makes` | `b7fd5085c` | `.bkit/core/.bkit/workflows.md`, `.bkit/version`, `.bkit/workflows.md`, `docs/testing.md` |

Checked for every row:

- `git diff --name-only {landing commit} feat/{FID}` is empty, or holds only `DETAILS.md` and `docs/capabilities.md` (the two files `pnpm bkit:graph:refresh` rewrites after a landing).
- Every named file is byte-identical between the branch tip and the landing commit, and has 1 to 8 later commits on `dev`.

So each branch is fully on `dev`. The refusal comes from `notOnDev` (called at `.bkit/core/engine/commands/workflow/worktrees.ts:1029`), which judges the branch against today's `origin/dev`.

An older friction row has the same shape for `bkit branches land`: `branches-land/remote-not-landed-false-positive` in `.bkit/friction.jsonl`.

### What should happen

A branch counts as landed when some commit on `origin/dev` holds everything the branch holds. Later commits on `dev` that change the same files do not turn it back into "not landed".

### How bad

Medium. Nothing is lost, the command errs on the safe side. But landed worktrees pile up (about 450 MB each here), and the only ways out are a removal by force or by raw git, which is exactly what the command exists to avoid.

### Possible fix

- For each path the branch changed against its merge base with `origin/dev`, search `origin/dev`'s history of that path for a commit whose blob equals the branch's blob. Landed when every path has one.
- Or record the landing commit when a branch is landed (the `status.jsonl` of the run, or the ownership marker), and have `remove` compare the branch with that commit.

Write the failing test first: land a branch, add a later commit on `dev` to one of its files, run `remove`.

### Removes

The need for a by-hand proof and a forced or raw-git removal after every run of several landings.
