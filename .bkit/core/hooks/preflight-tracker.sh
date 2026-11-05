# --- Tracker guard: identical in the Claude and Cursor preflight hooks (bkit renders it
# from one source). Uses bash + python3 + curl, and bkit for Jira. Needs `emit_context`,
# which the host's code above defines in that host's output shape. Dispatches on
# `bkit.tracker.default` in the repo's package.json. An unset tracker uses Linear only
# when LINEAR_ISSUE_ID is present. Passes on a readable issue carrying `bkit:auto` that is not finished by
# the tracker's state category; any unreadable answer is a HARD STOP naming tracker + reason.

CURL_LIMITS=(--connect-timeout 5 --max-time 15)

# bkit_guard_fail TRACKER ID REASON — HARD STOP naming the tracker and the reason.
bkit_guard_fail() {
  echo "Guard pre-check: FAIL. ${1} issue ${2}: ${3}" >&2
  emit_context "Guard pre-check: FAIL. ${1} issue ${2}: ${3}. HARD STOP: refuse any ${1}-related work on this issue. Report the failure to the user, then stop."
  exit 1
}

BKIT_GUARD_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
BKIT_GUARD_TRACKER=$(ROOT="$BKIT_GUARD_ROOT" python3 -c '
import json, os
try:
    with open(os.path.join(os.environ["ROOT"], "package.json")) as f:
        print(((json.load(f).get("bkit") or {}).get("tracker") or {}).get("default") or "none")
except Exception:
    print("none")
' 2>/dev/null || echo none)

if [[ "$BKIT_GUARD_TRACKER" == "none" ]]; then
  if [[ -n "${LINEAR_ISSUE_ID:-}" ]]; then
    BKIT_GUARD_TRACKER="linear"
  else
    exit 0
  fi
fi

case "$BKIT_GUARD_TRACKER" in
  github)
    # Issue id: GITHUB_ISSUE_ID, else the leading digits of the `feat/{FID}` branch.
    GH_ISSUE="${GITHUB_ISSUE_ID:-}"
    if [[ -z "$GH_ISSUE" ]]; then
      GH_BRANCH=$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)
      if [[ "$GH_BRANCH" =~ ^feat/([0-9]+) ]]; then GH_ISSUE="${BASH_REMATCH[1]}"; fi
    fi
    if [[ -z "$GH_ISSUE" ]]; then
      emit_context "Guard pre-check: SKIPPED — no issue id; bkit:auto not verified"
      exit 0
    fi
    # BKIT_GH_TOKEN reads the issue over the GitHub REST API.
    if [[ -z "${BKIT_GH_TOKEN:-}" ]]; then
      echo "Guard pre-check: FAIL. BKIT_GH_TOKEN not set, so the GitHub issue cannot be validated." >&2
      emit_context "Guard pre-check: FAIL. BKIT_GH_TOKEN is not set, so bkit cannot check the GitHub issue. HARD STOP: refuse any GitHub-related work. Report the failure to the user, then stop."
      exit 1
    fi
    GH_REMOTE=$(git remote get-url origin 2>/dev/null || true)
    GH_REPO=$(printf '%s' "$GH_REMOTE" | sed -E 's#^(https://([^@/]*@)?|ssh://git@|git@)github\.com[:/]##; s#\.git$##')
    if [[ "$GH_REPO" != */* ]]; then
      bkit_guard_fail "GitHub" "#${GH_ISSUE}" "could not read owner/repo from the origin remote"
    fi
    GH_RESPONSE=$(curl -sS --fail "${CURL_LIMITS[@]}" \
      -H "Authorization: Bearer ${BKIT_GH_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/${GH_REPO}/issues/${GH_ISSUE}" 2>/dev/null) \
      || bkit_guard_fail "GitHub" "#${GH_ISSUE}" "the GitHub API request failed (network, auth or not found)"
    IFS=$'\t' read -r ISSUE_STATE LABELS < <(RESPONSE="$GH_RESPONSE" python3 -c '
import json, os
try:
    d = json.loads(os.environ["RESPONSE"])
    state = d["state"]
    labels = ",".join((l["name"] if isinstance(l, dict) else str(l)) for l in (d.get("labels") or []))
    print(state + "\t" + (labels if labels else "-"))
except Exception:
    print("UNKNOWN\t-")
')
    if [[ "$ISSUE_STATE" == "UNKNOWN" ]]; then
      bkit_guard_fail "GitHub" "#${GH_ISSUE}" "the GitHub API answer could not be read"
    fi
    ISSUE_ID_DISPLAY="#${GH_ISSUE}"
    TRACKER_NAME="GitHub"
    TERMINAL="false"
    [[ "$ISSUE_STATE" == "closed" ]] && TERMINAL="true"
    ;;
  linear)
    # BKIT_LINEAR_API_KEY required to call the Linear GraphQL API.
    if [[ -z "${BKIT_LINEAR_API_KEY:-}" ]]; then
      echo "Guard pre-check: FAIL. BKIT_LINEAR_API_KEY not set, so ${LINEAR_ISSUE_ID:-(unset)} cannot be validated." >&2
      emit_context "Guard pre-check: FAIL. BKIT_LINEAR_API_KEY is not set, so bkit cannot check ${LINEAR_ISSUE_ID:-(unset)}. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
      exit 1
    fi

    # LINEAR_ISSUE_ID required (Claude's trigger above already demands it; a Cursor Cloud
    # Agent sets it from workflow context).
    if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
      echo "Guard pre-check: FAIL. LINEAR_ISSUE_ID not set." >&2
      emit_context "Guard pre-check: FAIL. LINEAR_ISSUE_ID is not set. HARD STOP: refuse any Linear-related work. Report the failure to the user, then stop."
      exit 1
    fi

    # Query Linear for issue state (name + category type) and labels.
    QUERY='query($id: String!) { issue(id: $id) { identifier title state { name type } labels { nodes { name } } } }'

    BODY=$(LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" Q="$QUERY" python3 -c '
import json, os
print(json.dumps({"query": os.environ["Q"], "variables": {"id": os.environ["LINEAR_ISSUE_ID"]}}))
')

    RESPONSE=$(curl -sS "${CURL_LIMITS[@]}" \
      -X POST \
      -H "Content-Type: application/json" \
      -H "Authorization: ${BKIT_LINEAR_API_KEY}" \
      --data "$BODY" \
      "https://api.linear.app/graphql" 2>/dev/null) \
      || bkit_guard_fail "Linear" "$LINEAR_ISSUE_ID" "the Linear API request failed (could not be reached)"

    # Parse response: identifier, state name, state type, labels (tab-separated, "-" empty).
    IFS=$'\t' read -r ISSUE_ID_DISPLAY ISSUE_STATE STATE_TYPE LABELS < <(RESPONSE="$RESPONSE" LINEAR_ISSUE_ID="$LINEAR_ISSUE_ID" python3 -c '
import json, os
try:
    d = json.loads(os.environ["RESPONSE"])
except Exception:
    d = {}
issue = (d.get("data") or {}).get("issue")
if not issue:
    print(os.environ["LINEAR_ISSUE_ID"] + "\tUNKNOWN\t-\t-")
else:
    state = issue.get("state") or {}
    labels = ",".join(n["name"] for n in ((issue.get("labels") or {}).get("nodes") or []))
    print("\t".join([issue.get("identifier") or os.environ["LINEAR_ISSUE_ID"], state.get("name") or "-", state.get("type") or "-", labels if labels else "-"]))
')
    if [[ "$ISSUE_STATE" == "UNKNOWN" ]]; then
      bkit_guard_fail "Linear" "$LINEAR_ISSUE_ID" "the Linear API answer carried no issue"
    fi
    TRACKER_NAME="Linear"
    TERMINAL="false"
    [[ "$STATE_TYPE" == "completed" || "$STATE_TYPE" == "canceled" ]] && TERMINAL="true"
    ;;
  jira)
    JIRA_BRANCH=$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)
    JIRA_ISSUE=""
    if [[ "$JIRA_BRANCH" =~ ^feat/([A-Za-z][A-Za-z0-9]*-[0-9]+)(-|$) ]]; then
      JIRA_ISSUE=$(printf '%s' "${BASH_REMATCH[1]}" | tr '[:lower:]' '[:upper:]')
    fi
    if [[ -z "$JIRA_ISSUE" ]]; then
      emit_context "Guard pre-check: SKIPPED — no issue id; bkit:auto not verified"
      exit 0
    fi
    BKIT_JIRA_BIN="$BKIT_GUARD_ROOT/node_modules/.bin/bkit"
    if [[ ! -x "$BKIT_JIRA_BIN" ]]; then
      bkit_guard_fail "Jira" "$JIRA_ISSUE" "node_modules/.bin/bkit is missing or not executable"
    fi
    BKIT_JIRA_TMPDIR=$(mktemp -d "${TMPDIR:-/tmp}/bkit-guard.XXXXXX") \
      || bkit_guard_fail "Jira" "$JIRA_ISSUE" "could not create a temporary issue outbox"
    JIRA_FETCH=("$BKIT_JIRA_BIN" issues fetch --issue "$JIRA_ISSUE" --outbox "$BKIT_JIRA_TMPDIR" --json)
    if command -v timeout >/dev/null 2>&1; then
      JIRA_FETCH=(timeout 20 "${JIRA_FETCH[@]}")
    fi
    JIRA_STATUS=0
    JIRA_RESPONSE=$("${JIRA_FETCH[@]}" 2>/dev/null) || JIRA_STATUS=$?
    rm -rf -- "$BKIT_JIRA_TMPDIR"
    if [[ "$JIRA_STATUS" == "124" ]]; then
      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch timed out"
    fi
    if [[ "$JIRA_STATUS" != "0" ]]; then
      JIRA_REASON=$(RESPONSE="$JIRA_RESPONSE" python3 -c '
import json, os
try:
    reason = json.loads(os.environ["RESPONSE"]).get("reason")
    print(reason if reason in {"auth", "network", "not-found", "unavailable"} else "unreadable reply")
except Exception:
    print("unreadable reply")
')
      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch failed (exit ${JIRA_STATUS}, ${JIRA_REASON})"
    fi
    IFS=$'\t' read -r ISSUE_STATE TERMINAL LABELS < <(RESPONSE="$JIRA_RESPONSE" python3 -c '
import json, os
try:
    d = json.loads(os.environ["RESPONSE"])
    state, terminal, labels = d["state"], d["terminal"], d["labels"]
    if not isinstance(state, str) or not state or not isinstance(terminal, bool) or not isinstance(labels, list) or not all(isinstance(label, str) for label in labels):
        raise ValueError("invalid issue facts")
    print(state + "\t" + str(terminal).lower() + "\t" + (",".join(labels) or "-"))
except Exception:
    print("UNKNOWN\t-\t-")
')
    if [[ "$ISSUE_STATE" == "UNKNOWN" ]]; then
      bkit_guard_fail "Jira" "$JIRA_ISSUE" "the issue fetch answer could not be read"
    fi
    ISSUE_ID_DISPLAY="$JIRA_ISSUE"
    TRACKER_NAME="Jira"
    ;;
  *)
    exit 0
    ;;
esac

FAIL_REASON=""

# Guard 1: `bkit:auto` label must be present.
if [[ ",${LABELS}," != *",bkit:auto,"* ]]; then
  FAIL_REASON="bkit:auto label missing (labels: ${LABELS})"
fi

# Guard 2: Issue must not be finished (terminal by state category, never by name).
if [[ "$TERMINAL" == "true" ]]; then
  FAIL_REASON="the issue is in a terminal state (${ISSUE_STATE})"
fi

if [[ -n "$FAIL_REASON" ]]; then
  echo "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}" >&2
  emit_context "Guard pre-check: FAIL. Issue ${ISSUE_ID_DISPLAY}: ${FAIL_REASON}. HARD STOP: refuse any ${TRACKER_NAME}-related work on this issue. Report the failure to the user, then stop."
  exit 1
fi

emit_context "Guard pre-check: PASS | issue: ${ISSUE_ID_DISPLAY} | status: ${ISSUE_STATE} | labels: ${LABELS}"
exit 0
