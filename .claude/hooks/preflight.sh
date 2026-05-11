#!/usr/bin/env bash
# preflight.sh — Claude Code SessionStart hook
#
# Validates Linear issue state before any background/cloud session does bkit
# work. Refuses the session if the issue isn't approved for automation.
#
# Trigger:  LINEAR_ISSUE_ID env var present (proxy for non-IDE session).
# Guards:   `Automated` label present; issue state not in {Cancelled, Done}.
# Setup:    See `.agents/README.md` § Linear setup.
#
# IMPORTANT — Claude Code SessionStart hooks CANNOT block the session: any
# non-zero exit is treated as non-blocking (docs.claude.com/docs/en/hooks.md).
# Failures are surfaced via `additionalContext` (the agent reads + obeys the
# HARD STOP instruction) AND `stderr` (visible to the user). Exit code is
# informational only.

# <!-- bkit:start -->

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

# Dispatch bypass — when BKIT_PREFLIGHT_BYPASS=dispatch is set, skip the Linear
# Auto/state guards. Used for Cowork Dispatch sessions (phone-triggered)
# that may not carry an Auto-labelled issue. Destruction guards (paths,
# .env, secrets) are unaffected — those live elsewhere in the agent stack.
# Brew check above still runs on Darwin regardless of bypass.
if [[ "${BKIT_PREFLIGHT_BYPASS:-}" == "dispatch" ]]; then
  emit_context "Dispatch bypass active (BKIT_PREFLIGHT_BYPASS=dispatch) — Linear Auto/state guards skipped for ${LINEAR_ISSUE_ID}. Destruction guards remain in force."
  exit 0
fi

# LINEAR_API_KEY required to call the Linear GraphQL API.
if [[ -z "${LINEAR_API_KEY:-}" ]]; then
  echo "Guard pre-check: FAIL — LINEAR_API_KEY not set; cannot validate ${LINEAR_ISSUE_ID}." >&2
  emit_context "Guard pre-check: FAIL — LINEAR_API_KEY missing for ${LINEAR_ISSUE_ID}. HARD STOP: refuse any Linear-related work, report the failure to the user, and stop."
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
