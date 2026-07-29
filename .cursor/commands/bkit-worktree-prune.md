<!-- bkit:managed v4.11.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Worktree Prune (Utility Command)

**Usage:** `/bkit-worktree-prune [FID]`

**Purpose:** Remove a agent worktree (and optionally its feature branch) once its changes have been merged or abandoned. Human-triggered only — agent never invokes this autonomously.

> [!CAUTION]
> Check ahead/behind status before pruning unsync'd work. ALWAYS show what will be deleted; NEVER remove a branch without asking.

## Parse Arguments

1. `git rev-parse --show-toplevel` → extract `REPO_ROOT`. Assert non-empty.
2. Self-skip check:
   ```bash
   . "$REPO_ROOT/.bkit/scripts/bkit-runtime.sh" || { echo "[bkit-runtime] missing bkit-runtime.sh — run 'bkit install'" >&2; exit 2; }
   bkit_worktree_helper_guard "$REPO_ROOT" "worktree-prune"
   BKIT_WHG_RC=$?
   ```
   **If** `BKIT_WHG_RC` = `1` → the guard already printed its loud self-skip message (`RUNTIME_WORKTREES=false` — this runtime has no `.worktrees/` tree to prune) → STOP, this is a no-op, NOT an error. **If** `BKIT_WHG_RC` = `2` → detect/assert failure → STOP, print the guard's error. **Else** (`0`) → continue.

**If** `{FID}` argument provided → jump to **Single Worktree Path**.
**Else** → **List All Path**.

## List All Path

1. `git worktree list` → display full worktree list.
2. List all Claude-managed worktrees:

   ```bash
   for dir in "$REPO_ROOT/.worktrees"/*/; do
     [ -d "$dir" ] || continue
     fid=$(basename "$dir")
     branch=$(git -C "$dir" branch --show-current 2>/dev/null || echo "unknown")
     last_commit=$(git -C "$dir" log -1 --format="%cr — %s" 2>/dev/null || echo "no commits")
     ahead=$(git -C "$dir" rev-list --count origin/dev..HEAD 2>/dev/null || echo "?")
     behind=$(git -C "$dir" rev-list --count HEAD..origin/dev 2>/dev/null || echo "?")
     echo "[$fid] branch=$branch ahead=$ahead behind=$behind last=$last_commit"
   done
   ```

3. Print table of all `.worktrees/*` entries with: FID, branch, last commit date, ahead/behind `origin/dev`.

4. **If** no worktrees found → print `No Claude worktrees found under .worktrees/` and STOP.

5. Ask human: `Enter FID to prune (or 'all' to prune all shown, or 'x' to abort):`

6. **If** human enters `x` or empty → STOP.
7. **If** human enters `all` → prune each FID in turn (run Single Worktree Path logic for each, skipping the per-FID branch-delete prompt and instead asking once at the end: `Delete all listed feature branches? [y/N]`).
8. **Else** → treat input as `{FID}` → continue to Single Worktree Path.

## Single Worktree Path

1. `WORKTREE_PATH` = `"$REPO_ROOT/.worktrees/{FID}"`.
2. **If** `$WORKTREE_PATH` does not exist → print `Error: worktree not found at $WORKTREE_PATH` and STOP.
3. `git -C "$WORKTREE_PATH" branch --show-current` → extract `WORKTREE_BRANCH`.
4. `git -C "$WORKTREE_PATH" rev-list --count origin/dev..HEAD` → extract `AHEAD`. **If** `AHEAD` > 0 → print warning:

   ```
   Warning: {WORKTREE_BRANCH} has {AHEAD} commits NOT in origin/dev.
   Have you synced with /bkit-worktree-sync {FID}?
   ```

   Ask: `Prune anyway? [y/N]:` — **if** human says anything other than `y` → STOP.

5. Ask: `Remove worktree at $WORKTREE_PATH? [y/N]:` — **if** not `y` → STOP.

6. `git worktree remove "$WORKTREE_PATH" --force`.
7. `git worktree prune`.

8. `git branch --list "{WORKTREE_BRANCH}"` → **If** local branch exists → ask:

   ```
   Delete local branch {WORKTREE_BRANCH}? [y/N]:
   ```

   **If** human says `y`:
   - `git branch -d {WORKTREE_BRANCH}`.
   - **If** `-d` fails (unmerged) → ask: `Branch has unmerged changes. Force delete? [y/N]:` → **If** `y` → `git branch -D {WORKTREE_BRANCH}`.

9. Print:

   ```
   Pruned: .worktrees/{FID}
   Branch {WORKTREE_BRANCH}: {deleted|kept}

   Run 'git worktree list' to confirm cleanup.
   ```
