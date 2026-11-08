#!/usr/bin/env bash
# bkit-preflight.sh — Claude Code SessionStart hook
#
# Validates tracker issue state before any issue-carrying session does bkit
# work. Refuses the session if the issue isn't approved for automation.
#
# Trigger:  LINEAR_ISSUE_ID or GITHUB_ISSUE_ID env var present.
# Guards:   `bkit:auto` label present; issue state not terminal by category.
# Setup:    See `.bkit/README.md` for the configured tracker.
#
# IMPORTANT — Claude Code SessionStart hooks CANNOT block the session: any
# non-zero exit is treated as non-blocking (docs.claude.com/docs/en/hooks.md).
# Failures are surfaced via `additionalContext` (the agent reads + obeys the
# HARD STOP instruction) AND `stderr` (visible to the user). Exit code is
# informational only.
#
# bkit generates the managed block at install: the tracker guard and the rules-read
# advisory are shared with the Cursor hook (bkit's `hooks/preflight-tracker.sh` and
# `hooks/preflight-rules.sh`); the trigger, the brew check and the output shape below
# are Claude's own.

# <!-- bkit:start -->

# <!-- bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh -->

set -euo pipefail

# Consume stdin so the writing process doesn't block.
# Claude SessionStart payload: { session_id, transcript_path, cwd, permission_mode } — unused here.
INPUT=$(cat)

# emit_context — Claude SessionStart expects ONE JSON document
# { hookSpecificOutput: { hookEventName, additionalContext } } on stdout. Each call
# accumulates its string; the EXIT trap writes the document once, so the advisory and
# the tracker guard result ride one document (two documents are unparseable).
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
  # discards it, taking the advisory and the tracker guard result with it.
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
# Claude has no native is-background flag, so we use the issue env vars as the proxy.
# (Cursor variant: parses `is_background_agent` from stdin JSON.)
if [[ -z "${LINEAR_ISSUE_ID:-}" && -z "${GITHUB_ISSUE_ID:-}" ]]; then
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

# <!-- bkit:end -->
