#!/usr/bin/env bash
# Example. Copy to scripts/graphify/ and own it. The bkit .husky/pre-push template runs it
# above the gates, so a stale register blocks in ~30s, not after the full gate; an older hook
# copy lacks that call → re-copy the "Capability register" block from the template.
# bkit install does not write this file and does not overwrite a copy.
#
# Capability register current on dev. BLOCKS a push to dev when docs/capabilities.md is not
# what the pushed commit builds. Reads PUSH_DEV_SHA (commit pushed to dev), set by the bkit
# pre-push template while reading git's ref list on stdin; stdin is consumed by now.
#
# graphify reads the working tree → check runs in a throwaway checkout of the pushed commit
# (`check-at`): uncommitted edits, a concurrent session's included, cannot change the answer.
# Other graphify release → blocked, with the install command. graphify NOT INSTALLED → warn
# only, saying the check did not run: a cloud session without it must still push; CI's Check
# Capability Register runs the same check on every push to dev. Revert pushes (IS_REVERT=1)
# skip it, as they skip the test tiers. Other branches → warn-only staleness note.
CAP_DOC="docs/capabilities.md"
if [ -f scripts/graphify/bkit-graphify.sh ] && [ -f "$CAP_DOC" ]; then
  if [ -n "${PUSH_DEV_SHA:-}" ] && [ "${IS_REVERT:-0}" != "1" ]; then
    if ! command -v graphify >/dev/null 2>&1; then
      echo "[pre-push] WARNING: $CAP_DOC was NOT checked — graphify is not installed." >&2
      echo "[pre-push]    CI's Check Capability Register checks it on this push; if it reds there, run" >&2
      echo "[pre-push]    pnpm graph:refresh, commit, and push again. Install graphify to check before pushing:" >&2
      echo "[pre-push]    brew install uv && uv tool install '$(bash scripts/graphify/bkit-graphify.sh spec)'" >&2
    elif ! bash scripts/graphify/bkit-graphify.sh check-at "$PUSH_DEV_SHA" < /dev/null; then
      echo "[pre-push] BLOCKED: $CAP_DOC is not what the pushed commit builds (diff above)." >&2
      echo "[pre-push] Fix: pnpm graph:refresh && git add $CAP_DOC && git commit, then push again." >&2
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
        echo "[pre-push]       Not a gate on this branch. A push to dev is blocked until it is current." >&2
      fi
    fi
  fi
fi
