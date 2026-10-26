#!/usr/bin/env bash
# bkit-preflight.sh — Cursor Cloud sessionStart hook (failClosed: true)
#
# Validates Linear issue state before any background/cloud session does bkit
# work. Refuses the session if the issue isn't approved for automation.
#
# Trigger:  is_background_agent === true (received via stdin JSON).
# Guards:   `bkit:auto` label present; issue state not in {Cancelled, Done}.
# Setup:    See `.bkit/README.md` § Linear setup.
#
# Cursor honours non-zero exit as a hard stop (failClosed: true) — non-zero
# blocks the session before the agent starts. Failures are also surfaced via
# `additional_context` so the user sees the reason.
#
# bkit generates the managed block at install: the Linear guard and the rules-read
# advisory are shared with the Claude hook (bkit's `hooks/preflight-linear.sh` and
# `hooks/preflight-rules.sh`); the trigger, the runtime marker and the output shape
# below are Cursor's own.

# <!-- bkit:start -->

# {{BKIT_MANAGED_MARKER}}

set -euo pipefail

# Consume stdin so the writing process doesn't block.
# Cursor sessionStart payload: { session_id, is_background_agent, composer_mode } — used for IDE detection below.
INPUT=$(cat)

# emit_context — Cursor sessionStart expects ONE JSON document { additional_context: ... }
# on stdout. Each call accumulates its string; the EXIT trap writes the document once, so
# the advisory and the Linear guard result ride one document. Defined above the bail so an
# IDE session gets the advisory too, and built with no python3: failClosed:true blocks the
# session on a non-zero exit, and an IDE session may not have python3 at all.
# (Claude variant: wraps in { hookSpecificOutput: { hookEventName, additionalContext } }.)
BKIT_CONTEXT=""
emit_context() {
  [[ -z "$BKIT_CONTEXT" ]] || BKIT_CONTEXT+=$'\n\n'
  BKIT_CONTEXT+="$1"
}

# JSON-escape one string, so a context carrying a quote or a backslash cannot break the
# document.
bkit_json_escape() {
  local s=$1
  s=${s//\\/\\\\}
  s=${s//\"/\\\"}
  s=${s//$'\n'/\\n}
  s=${s//$'\r'/\\r}
  s=${s//$'\t'/\\t}
  printf '%s' "$s"
}

bkit_write_document() {
  [[ -n "$BKIT_CONTEXT" ]] || return 0
  printf '{"additional_context":"%s"}\n' "$(bkit_json_escape "$BKIT_CONTEXT")"
}

trap bkit_write_document EXIT

# {{BKIT_PART preflight-rules.sh}}

# IDE session bailout — grep only, no python3 on the skip path (failClosed:true in
# .cursor/hooks.json blocks the session if this exits non-zero). Background-agent
# sessions run inside the bkit Dockerfile, where python3 is present for the code below.
# (Claude variant: uses empty LINEAR_ISSUE_ID env var as the proxy.)
if ! printf '%s' "$INPUT" | grep -q '"is_background_agent"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# Runtime bridge — `is_background_agent` arrives ONLY on this hook's stdin JSON,
# so a workflow shell has no way to see it. Drop a marker `bkit runtime detect`
# reads back as RUNTIME=CLOUD_CURSOR. Gitignored, and a Cursor Cloud Agent gets
# a fresh clone per session, so it cannot go stale. Best-effort: a failure here
# degrades detection to LOCAL, it must never block the session.
if BKIT_REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) && [[ -d "$BKIT_REPO_ROOT/.bkit" ]]; then
  printf 'CLOUD_CURSOR\n' > "$BKIT_REPO_ROOT/.bkit/.runtime-cursor" 2>/dev/null \
    || echo "[bkit-runtime] could not write .bkit/.runtime-cursor — runtime will resolve as LOCAL" >&2
fi

# Brew dep preflight — N/A on Cursor Cloud.
# Cursor Cloud runs in a containerised env where required CLIs (gh, jq, vale, pnpm, bun) are
# pre-installed via .cursor/Dockerfile, so the laptop-side brew check makes no sense here.
# (Claude variant: validates required CLIs are on PATH; missing → HARD STOP with brew install hint.)

# {{BKIT_PART preflight-linear.sh}}

# <!-- bkit:end -->
