#!/usr/bin/env bash
# bkit-preflight.sh — Claude Code SessionStart hook
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
# Cursor hook (bkit's `hooks/preflight-linear.sh`); the trigger, the brew check
# and the output shape below are Claude's own.

# <!-- bkit:start -->

# <!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

set -euo pipefail

# Consume stdin so the writing process doesn't block.
# Claude SessionStart payload: { session_id, transcript_path, cwd, permission_mode } — unused here.
INPUT=$(cat)

# emit_context — Claude SessionStart expects ONE JSON document
# { hookSpecificOutput: { hookEventName, additionalContext } } on stdout. Each call
# accumulates its string; the EXIT trap writes the document once, so the advisory and
# the Linear guard result ride one document (two documents are unparseable).
# (Cursor variant: emits { additional_context: ... } directly.)
BKIT_CONTEXT=""
emit_context() {
  [[ -z "$BKIT_CONTEXT" ]] || BKIT_CONTEXT+=$'\n\n'
  BKIT_CONTEXT+="$1"
}

# JSON-escape one string, so a context carrying a quote or a backslash cannot break the
# document. No python3 on this path: a python3-less IDE session must still get the
# advisory (Claude cannot block, so a lost advisory would be silent).
bkit_json_escape() {
  local s=$1 i oct ch esc
  s=${s//\\/\\\\}
  s=${s//\"/\\\"}
  s=${s//$'\n'/\\n}
  s=${s//$'\r'/\\r}
  s=${s//$'\t'/\\t}
  # The rest of the C0 range (U+0000–U+001F) — bash cannot hold NUL, so 1–31 minus the
  # three above. A raw control byte makes the whole document unparseable and the host
  # discards it, taking the advisory and the Linear guard result with it.
  for (( i = 1; i < 32; i++ )); do
    case $i in 9 | 10 | 13) continue ;; esac
    printf -v oct '%03o' "$i"
    printf -v ch "\\$oct"
    printf -v esc '\\u%04x' "$i"
    s=${s//$ch/$esc}
  done
  printf '%s' "$s"
}

bkit_write_document() {
  [[ -n "$BKIT_CONTEXT" ]] || return 0
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' \
    "$(bkit_json_escape "$BKIT_CONTEXT")"
}

trap bkit_write_document EXIT

# --- Rules-read advisory: the one session-start nudge (bkit renders it from this one
# source into each SessionStart host's hook). Advisory only: it names `.agents/rules.md`
# and no other file, never blocks a session and never changes the exit code. Needs
# `emit_context`, which the host's own code above defines.

BKIT_RULES_ADVISORY='[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.'

emit_context "$BKIT_RULES_ADVISORY"

# IDE session detection — the advisory above already fired; nothing else runs here.
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

# --- Linear guard: identical in the Claude and Cursor preflight hooks (bkit renders it
# from one source). Pure bash + python3 + curl, no bkit runtime. Needs `emit_context`,
# which the host's code above defines in that host's output shape.

# BKIT_LINEAR_API_KEY required to call the Linear GraphQL API.
if [[ -z "${BKIT_LINEAR_API_KEY:-}" ]]; then
  echo "Guard pre-check: FAIL — BKIT_LINEAR_API_KEY not set; cannot validate ${LINEAR_ISSUE_ID:-(unset)}." >&2
  emit_context "Guard pre-check: FAIL — BKIT_LINEAR_API_KEY missing for ${LINEAR_ISSUE_ID:-(unset)}. HARD STOP: refuse any Linear-related work, report the failure to the user, and stop."
  exit 1
fi

# LINEAR_ISSUE_ID required (Claude's trigger above already demands it; a Cursor Cloud
# Agent sets it from workflow context).
if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
  echo "Guard pre-check: FAIL — LINEAR_ISSUE_ID not set." >&2
  emit_context "Guard pre-check: FAIL — LINEAR_ISSUE_ID not set. HARD STOP: refuse any Linear-related work, report the failure to the user, and stop."
  exit 1
fi

# Query Linear for issue state and labels.
QUERY='query($id: String!) { issue(id: $id) { identifier title state { name } labels { nodes { name } } } }'

BODY=$(LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" Q="$QUERY" python3 -c '
import json, os
print(json.dumps({"query": os.environ["Q"], "variables": {"id": os.environ["LINEAR_ISSUE_ID"]}}))
')

RESPONSE=$(curl -sS \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: ${BKIT_LINEAR_API_KEY}" \
  --data "$BODY" \
  "https://api.linear.app/graphql" 2>/dev/null) || {
    echo "Guard pre-check: FAIL — Linear API request failed for ${LINEAR_ISSUE_ID}." >&2
    emit_context "Guard pre-check: FAIL — Linear API unreachable for ${LINEAR_ISSUE_ID}. HARD STOP: refuse any Linear-related work, report the failure to the user, and stop."
    exit 1
  }

# Parse response: identifier, state, labels.
read -r ISSUE_ID_DISPLAY ISSUE_STATE LABELS < <(RESPONSE="$RESPONSE" LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" python3 -c '
import json, os, sys
try:
    d = json.loads(os.environ["RESPONSE"])
except Exception:
    print(os.environ["LINEAR_ISSUE_ID"], "UNKNOWN", "")
    sys.exit(0)
issue = (d.get("data") or {}).get("issue") or {}
ident = issue.get("identifier") or os.environ["LINEAR_ISSUE_ID"]
state = (issue.get("state") or {}).get("name") or "UNKNOWN"
labels = ",".join(n["name"] for n in ((issue.get("labels") or {}).get("nodes") or []))
print(ident, state, labels if labels else "-")
')

FAIL_REASON=""

# Guard 1: `bkit:auto` label must be present.
if [[ ",${LABELS}," != *",bkit:auto,"* ]]; then
  FAIL_REASON="bkit:auto label missing (labels: ${LABELS})"
fi

# Guard 2: Issue must not be in a terminal state.
if [[ "$ISSUE_STATE" == "Cancelled" || "$ISSUE_STATE" == "Done" ]]; then
  FAIL_REASON="Issue is in terminal state: ${ISSUE_STATE}"
fi

if [[ -n "$FAIL_REASON" ]]; then
  echo "Guard pre-check: FAIL — issue: ${ISSUE_ID_DISPLAY} | ${FAIL_REASON}" >&2
  emit_context "Guard pre-check: FAIL — issue ${ISSUE_ID_DISPLAY} | ${FAIL_REASON}. HARD STOP: refuse any Linear-related work on this issue, report the failure to the user, and stop."
  exit 1
fi

emit_context "Guard pre-check: PASS | issue: ${ISSUE_ID_DISPLAY} | status: ${ISSUE_STATE} | labels: ${LABELS}"
exit 0

# <!-- bkit:end -->
