#!/usr/bin/env bash
# Example. Copy to scripts/graphify/ and own it. The bkit .husky/pre-push template runs it
# above the gates, so a stale register blocks in ~30s, not after the full gate; an older hook
# copy lacks that call → re-copy the "Capability register" block from the template.
# bkit install does not write this file and does not overwrite a copy.
#
# Capability register current wherever CI checks it. BLOCKS a push to dev, and a push of a
# branch with an open PR into dev, when docs/capabilities.md is not what the pushed commit
# builds: CI's Check Capability Register fails both. Reads PUSH_DEV_SHA (commit pushed to dev),
# BRANCH (the checked-out branch) and PUSH_BRANCH_SHA (commit pushed to that branch, empty when
# the push does not update it), set by the bkit pre-push template while reading git's ref list
# on stdin; stdin is consumed by now. An older hook copy sets no BRANCH / PUSH_BRANCH_SHA → the
# checked-out branch and HEAD stand in.
#
# graphify reads the working tree → check runs in a throwaway checkout of the pushed commit
# (`check-at`): uncommitted edits, a concurrent session's included, cannot change the answer.
# Other graphify release → blocked, with the install command. graphify NOT INSTALLED → warn
# only, saying the check did not run: a cloud session without it must still push; CI's Check
# Capability Register runs the same check on every push to dev and every pull request. The
# open-PR lookup needs gh: gh NOT INSTALLED, or its call FAILING (offline, not signed in) →
# warn only, as with graphify; a lookup that cannot answer is never read as "no PR". Revert pushes
# (IS_REVERT=1) skip it, as they skip the test tiers. A branch with no open PR → warn-only
# staleness note.
CAP_DOC="docs/capabilities.md"
if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
  # The commit to check, and what the push is; empty → the warn-only note.
  CAP_GATE_SHA=""
  CAP_GATE_WHAT=""
  if [ "${IS_REVERT:-0}" = "1" ]; then
    :
  elif [ -n "${PUSH_DEV_SHA:-}" ]; then
    CAP_GATE_SHA="$PUSH_DEV_SHA"
    CAP_GATE_WHAT="this push to dev"
  else
    CAP_BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")}"
    if [ -n "${PUSH_BRANCH_SHA+set}" ]; then
      CAP_PUSHED="$PUSH_BRANCH_SHA"
    else
      CAP_PUSHED=$(git rev-parse HEAD 2>/dev/null || echo "")
    fi
    case "$CAP_BRANCH" in
      "" | HEAD | dev | main) ;;
      *)
        if [ -z "$CAP_PUSHED" ]; then
          :
        else
          # Why the lookup could not answer; empty → it answered (a PR number, or none).
          CAP_UNKNOWN=""
          if ! command -v gh >/dev/null 2>&1; then
            CAP_UNKNOWN="gh is not installed"
          # strip hook-injected GIT_DIR/GIT_WORK_TREE so gh resolves the repo from cwd (worktree-safe)
          elif CAP_PR=$(env -u GIT_DIR -u GIT_WORK_TREE gh pr list --head "$CAP_BRANCH" --base dev --state open --json number --jq '.[0].number' 2>/dev/null); then
            if [ -n "$CAP_PR" ]; then
              CAP_GATE_SHA="$CAP_PUSHED"
              CAP_GATE_WHAT="PR #$CAP_PR into dev"
            fi
          else
            CAP_UNKNOWN="gh pr list failed (offline, or gh not signed in)"
          fi
          if [ -n "$CAP_UNKNOWN" ]; then
            echo "[pre-push] WARNING: $CAP_DOC was NOT checked — $CAP_UNKNOWN, so whether '$CAP_BRANCH' has an open PR is unknown." >&2
            echo "[pre-push]    If a PR is open, CI's Check Capability Register fails it on a stale register; run" >&2
            echo "[pre-push]    pnpm graph:refresh, commit, and push again." >&2
          fi
        fi
        ;;
    esac
  fi
  if [ -n "$CAP_GATE_SHA" ]; then
    if ! command -v graphify >/dev/null 2>&1; then
      echo "[pre-push] WARNING: $CAP_DOC was NOT checked — graphify is not installed." >&2
      echo "[pre-push]    CI's Check Capability Register checks it for $CAP_GATE_WHAT; if it reds there, run" >&2
      echo "[pre-push]    pnpm graph:refresh, commit, and push again. Install graphify to check before pushing:" >&2
      echo "[pre-push]    brew install uv && uv tool install '$(bash scripts/graphify/bkit-graphify.sh spec)'" >&2
    elif ! bash scripts/graphify/bkit-graphify.sh check-at "$CAP_GATE_SHA" < /dev/null; then
      echo "[pre-push] BLOCKED: $CAP_DOC is not what the pushed commit builds (diff above); CI fails $CAP_GATE_WHAT on it." >&2
      echo "[pre-push] Fix: pnpm graph:refresh, git add the files it rewrote, git commit, then push again." >&2
      exit 1
    fi
  else
    # Warn-only. A fresh register is stamped at the parent of its commit → staleness =
    # source files changed since that stamp.
    CAP_SHA=$(sed -n 's/.*Diagrams from `graph\.json` @ `\([0-9a-f]\{7,\}\)`.*/\1/p' "$CAP_DOC" | head -1)
    if [ -n "$CAP_SHA" ] && git cat-file -e "$CAP_SHA^{commit}" 2>/dev/null; then
      CAP_CHANGED=$(git diff --name-only "$CAP_SHA..HEAD" -- '*.ts' '*.tsx' 2>/dev/null | wc -l | tr -d ' ')
      if [ "${CAP_CHANGED:-0}" -gt 0 ]; then
        echo "[pre-push] NOTE: $CAP_DOC diagrams were built at $CAP_SHA; $CAP_CHANGED source files changed since." >&2
        echo "[pre-push]       Refresh when convenient:  pnpm graph:refresh" >&2
        echo "[pre-push]       Not a gate on this branch until it has an open PR into dev; a push to dev is blocked until it is current." >&2
      fi
    fi
  fi
fi
