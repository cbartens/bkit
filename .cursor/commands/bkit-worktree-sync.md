<!-- bkit:managed v4.2.1 — do NOT edit; run `bkit upgrade` to refresh -->

# Worktree Sync (Utility Command)

**Usage:** `/bkit-worktree-sync {FID}`

**Purpose:** Review and merge agent worktree commits into the IDE's current branch. Human-triggered only — agent never invokes this autonomously.

> [!CAUTION]
> This command ALWAYS asks for confirmation before merging. It never auto-merges. Read the commit log before confirming.

## Step 1 — Verify Context

1. `git branch --show-current` → extract `CURRENT_BRANCH`. Assert non-empty.
2. `git rev-parse --show-toplevel` → extract `REPO_ROOT`. Assert non-empty.
3. Assert `{FID}` argument was provided and is non-empty. **If** missing → print `Usage: /bkit-worktree-sync {FID}` and STOP.
4. `WORKTREE_PATH` = `"$REPO_ROOT/.worktrees/{FID}"`
5. **If** `$WORKTREE_PATH` does not exist (`[ ! -d "$WORKTREE_PATH" ]`) → print `Error: worktree not found at $WORKTREE_PATH` and STOP.

## Step 2 — Pre-merge Clean-tree Guard

1. `git -C "$REPO_ROOT" status --porcelain` → capture output as `LOCAL_STATUS`.
2. **If** `LOCAL_STATUS` is empty → skip to Step 3.
3. Auto-commit dirty paths on the IDE's current branch using the same path-exclusion filter as pre-worktree (prevents merge from clobbering uncommitted edits, skips junk):

   ```bash
   git -C "$REPO_ROOT" status --short
   git -C "$REPO_ROOT" add -- ':\!.DS_Store' ':\!*.log' ':\!*.swp' ':\!node_modules'
   git -C "$REPO_ROOT" commit -m "chore: pre-merge uncommitted dev changes"
   ```

4. Print: `Pre-merge clean-tree guard: committed local changes on {CURRENT_BRANCH}.`

## Step 3 — Show Diff Summary

1. `git -C "$WORKTREE_PATH" branch --show-current` → extract `WORKTREE_BRANCH`.
2. `git -C "$WORKTREE_PATH" log --oneline origin/dev..HEAD` → display all commits Claude made since branching from `dev`.
3. Print summary:

```
Worktree: $WORKTREE_PATH
Branch:   {WORKTREE_BRANCH}
Target:   {CURRENT_BRANCH}

Commits from Claude:
{git log output}
```

4. `git -C "$WORKTREE_PATH" diff --stat origin/dev..HEAD` → display file change summary.

## Step 4 — Confirm

Ask the human:

```
Merge {WORKTREE_BRANCH} → {CURRENT_BRANCH}?

Options:
  [m] merge   — git merge .worktrees/{FID}/{WORKTREE_BRANCH}
  [r] rebase  — git rebase --onto {CURRENT_BRANCH} origin/dev .worktrees/{FID}/{WORKTREE_BRANCH}
  [x] abort   — do nothing

Enter choice:
```

**If** human chooses `x` or provides no input → STOP without modifying any files.

## Step 5 — Merge or Rebase

**If** human chose `m` (merge):

1. `git merge "$WORKTREE_PATH/{WORKTREE_BRANCH}"` (or using the full path reference).
2. **If** merge conflict → print conflict list and STOP. Human resolves manually.
3. Print: `Merge complete. {CURRENT_BRANCH} now includes Claude's changes.`

**If** human chose `r` (rebase):

1. `git fetch origin dev` (ensure base is current).
2. Explain: Rebase cherry-picks Claude's commits onto the current branch. This rewrites history — only safe if `{WORKTREE_BRANCH}` has not been pushed to a shared remote yet (or you are force-pushing a personal branch).
3. Ask for final confirmation before proceeding.
4. `git rebase --onto {CURRENT_BRANCH} origin/dev .worktrees/{FID}/{WORKTREE_BRANCH}` (or equivalent cherry-pick sequence).
5. **If** rebase conflict → print conflict list and STOP. Human resolves manually.
6. Print: `Rebase complete.`

## Step 6 — Done

Print:

```
Sync complete.

Next steps:
  - Review the merged changes in your IDE.
  - Run /bkit-worktree-prune {FID} to clean up the worktree once you're satisfied.
```
