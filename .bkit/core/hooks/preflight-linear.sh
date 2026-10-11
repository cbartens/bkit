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
