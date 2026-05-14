#!/usr/bin/env bash
# preflight.sh — Cursor Cloud sessionStart hook (failClosed: true)
#
# Validates Linear issue state before any background/cloud session does bkit
# work. Refuses the session if the issue isn't approved for automation.
#
# Trigger:  is_background_agent === true (received via stdin JSON).
# Guards:   `Automated` label present; issue state not in {Cancelled, Done}.
# Setup:    See `.agents/README.md` § Linear setup.
#
# Cursor honours non-zero exit as a hard stop (failClosed: true) — non-zero
# blocks the session before the agent starts. Failures are also surfaced via
# `additional_context` so the user sees the reason.

# <!-- bkit:start -->

set -euo pipefail

# Consume stdin so the writing process doesn't block.
# Cursor sessionStart payload: { session_id, is_background_agent, composer_mode } — used for IDE detection below.
INPUT=$(cat)

# IDE session bailout — primitive grep so we don't pull in python3 on the skip path.
# With failClosed:true wired in .cursor/hooks.json, a python3-missing machine would
# otherwise block local IDE sessions. Background-agent sessions run inside the bkit
# Dockerfile where python3 is guaranteed; the post-bailout code can safely use it.
# (Claude variant: uses empty LINEAR_ISSUE_ID env var as the proxy.)
if ! printf '%s' "$INPUT" | grep -q '"is_background_agent"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# emit_context — Cursor sessionStart expects { additional_context: ... } directly.
# (Claude variant: wraps in { hookSpecificOutput: { hookEventName, additionalContext } }.)
emit_context() {
  python3 - "$1" <<'PY'
import json, sys
print(json.dumps({"additional_context": sys.argv[1]}))
PY
}

# Brew dep preflight — N/A on Cursor Cloud.
# Cursor Cloud runs in a containerised env where required CLIs (gh, jq, vale, pnpm, bun) are
# pre-installed via .cursor/Dockerfile, so the laptop-side brew check makes no sense here.
# (Claude variant: validates required CLIs are on PATH; missing → HARD STOP with brew install hint.)

# LINEAR_API_KEY required to call the Linear GraphQL API.
if [[ -z "${LINEAR_API_KEY:-}" ]]; then
  echo "Guard pre-check: FAIL — LINEAR_API_KEY not set; cannot validate ${LINEAR_ISSUE_ID:-(unset)}." >&2
  emit_context "Guard pre-check: FAIL — LINEAR_API_KEY missing. HARD STOP: refuse any Linear-related work, report the failure to the user, and stop."
  exit 1
fi

# LINEAR_ISSUE_ID required (set by Cursor Cloud Agent from workflow context).
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
  -H "Authorization: ${LINEAR_API_KEY}" \
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

# Guard 1: `Auto` label must be present.
if [[ ",${LABELS}," != *",Auto,"* ]]; then
  FAIL_REASON="Auto label missing (labels: ${LABELS})"
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
