#!/usr/bin/env bash
# Example. Paste below the bkit-managed block in .husky/pre-push and own it.
# bkit install does not write this file and does not overwrite a copy.
#
# Warn-only. Never blocks a push, never writes, never runs graphify.
# A fresh docs/capabilities.md is stamped at the parent of the commit that
# carries it, so staleness is source files changed since that stamp.
CAP_DOC="docs/capabilities.md"
if [ -f "$CAP_DOC" ]; then
  CAP_SHA=$(sed -n 's/.*Diagrams from `graph\.json` @ `\([0-9a-f]\{7,\}\)`.*/\1/p' "$CAP_DOC" | head -1)
  if [ -n "$CAP_SHA" ] && git cat-file -e "$CAP_SHA^{commit}" 2>/dev/null; then
    CAP_CHANGED=$(git diff --name-only "$CAP_SHA..HEAD" -- '*.ts' '*.tsx' 2>/dev/null | wc -l | tr -d ' ')
    if [ "${CAP_CHANGED:-0}" -gt 0 ]; then
      echo "[pre-push] NOTE: $CAP_DOC diagrams were built at $CAP_SHA; $CAP_CHANGED source files changed since." >&2
      echo "[pre-push]       Refresh when convenient:  pnpm graph:update && pnpm graph:rollup" >&2
      echo "[pre-push]       Not a gate. The release gate is 'pnpm graph:check' before the dev -> main PR." >&2
    fi
  fi
fi
