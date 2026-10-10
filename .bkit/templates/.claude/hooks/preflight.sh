#!/usr/bin/env bash
# preflight.sh — Claude Code SessionStart hook
#
# Validates Linear issue state before any background/cloud session does bkit
# work. Refuses the session if the issue isn't approved for automation.
#
# Trigger:  LINEAR_ISSUE_ID env var present (proxy for non-IDE session).
# Guards:   `bkit:auto` label present; issue state not in {Cancelled, Done}.
# Setup:    See `.bkit/README.md` § Linear setup.
#
# IMPORTANT — Claude Code SessionStart hooks CANNOT block the session: any
# non-zero exit is treated as non-blocking (docs.claude.com/docs/en/hooks.md).
# Failures are surfaced via `additionalContext` (the agent reads + obeys the
# HARD STOP instruction) AND `stderr` (visible to the user). Exit code is
# informational only.
#
# bkit generates the managed block at install: the Linear guard is shared with the
# Cursor hook (bkit's `hook-parts/preflight-linear.sh`); the trigger, the brew check
# and the output shape below are Claude's own.

# <!-- bkit:start -->

# {{BKIT_MANAGED_MARKER}}

set -euo pipefail

# Consume stdin so the writing process doesn't block.
# Claude SessionStart payload: { session_id, transcript_path, cwd, permission_mode } — unused here.
INPUT=$(cat)

# emit_context — Claude SessionStart expects { hookSpecificOutput: { hookEventName, additionalContext } }.
# (Cursor variant: emits { additional_context: ... } directly.)
emit_context() {
  python3 - "$1" <<'PY'
import json, sys
print(json.dumps({
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": sys.argv[1],
  },
}))
PY
}

# IDE session detection — skip silently when this isn't a background/cloud run.
# Claude has no native is-background flag, so we use empty LINEAR_ISSUE_ID as the proxy.
# (Cursor variant: parses `is_background_agent` from stdin JSON.)
if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
  exit 0
fi

# Brew dep preflight — required CLIs for bkit workflows on a developer laptop.
# Missing → HARD STOP with setup hint. Do NOT auto-install.
# Darwin-gated: brew is macOS-only. Linux contexts (Cowork bash sandbox, CI,
# dev containers) skip this check; their environments install deps differently.
# (Cursor variant: skipped — Cloud Agent runs in a containerised env with deps pre-installed via .cursor/Dockerfile.)
if [[ "$(uname)" == "Darwin" ]]; then
  REQUIRED_BREW_BINS=(gh jq vale pnpm bun)
  MISSING_BINS=()
  for bin in "${REQUIRED_BREW_BINS[@]}"; do
    command -v "$bin" >/dev/null 2>&1 || MISSING_BINS+=("$bin")
  done
  if [[ ${#MISSING_BINS[@]} -gt 0 ]]; then
    MISSING_LIST="${MISSING_BINS[*]}"
    echo "Brew preflight: FAIL — missing required CLIs: ${MISSING_LIST}" >&2
    echo "Install with: brew install ${MISSING_LIST}" >&2
    emit_context "Brew preflight: FAIL — missing required CLIs: ${MISSING_LIST}. HARD STOP: refuse all bkit work, instruct the user to run \`brew install ${MISSING_LIST}\` and re-launch the session, then stop."
    exit 1
  fi
fi

# {{BKIT_PART preflight-linear.sh}}

# <!-- bkit:end -->
