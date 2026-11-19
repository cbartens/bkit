## Session Prompt — this run's, newer than everything below

#1058 publish=false

## Issue description — oldest

Found by the security review of "Worktree removal says not-landed once a later commit on dev changes the same file" (https://github.com/cbartens/bkit/issues/1055). Deferral row: `1055-worktree-removal-says-challenge-low-bkit-core-engine-commands-workflow-worktrees-ts-805`.

### What happened

The check that decides whether a branch's work is already on `dev` (`notOnDev` in `.bkit/core/engine/commands/workflow/worktrees.ts`) hands each changed file path to git after `--`. Git reads a path that starts with `:` as a pattern, not as a file name. For example `:/src.txt` (a file `src.txt` inside a folder literally named `:`) is read as "the file `src.txt` at the top of the repository".

So for such a path both `git ls-tree` (in `treeEntry`) and the new `git rev-list` (in `devHeldEntry`, `worktrees.ts:805`) look at the wrong file. In one unusual history the check then calls the branch landed although the file under `:` never reached `dev`, and cleanup deletes the branch with that file lost. A simpler form of the same mistake existed before, through the `feature === dev` comparison.

The reviewer confirmed the git behaviour with read-only commands (git 2.56.0): `ls-tree HEAD -- ':/package.json'` resolves to the top-level file, `rev-list -- ':/package.json'` accepts the same pattern, and `GIT_LITERAL_PATHSPECS=1` makes `:/package.json` match nothing. It was not replayed end to end in a scratch repository.

### What should happen

Every path that `git diff --name-only -z` returns is read by git as a literal path, in `treeEntry` and in `devHeldEntry`. `notOnDev` names a branch file whose path starts with `:` unless `origin/dev` holds that exact path.

### How bad

Low. It needs a folder literally named `:` (or a path starting with `:`) in the branch, plus a matching top-level file on `dev`. When it does happen, the cost is a deleted branch with an unlanded file.

### Possible fix

Set `GIT_LITERAL_PATHSPECS=1` in the environment `cleanupRead` gives git (or pass `--literal-pathspecs` before the subcommand). Two tests first, in `.bkit/core/engine/commands/workflow/branches.test.ts`:

- a path under a directory named `:` is compared as itself, not as the top-level file (`notOnDev` must name `:/src.txt` when `dev` deleted `src.txt`, re-added it and later edited it);
- a path under a directory named `:` that `dev` never touched is not reported landed.

Also check the other callers of `cleanupRead` and `treeEntry` for the same handling, and close the deferral row when it lands.

### Removes

Nothing; one environment setting in the existing shared helper.
