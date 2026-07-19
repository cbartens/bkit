#!/usr/bin/env bash
# bkit-workflow-telemetry.sh <workflow> <yyyymm> <fid>
# Writes the workflow's per-run `outcome` row + grades compliance, then prints the
# telemetry report to STDOUT (for the close-step tracker comment). Best-effort:
# never fails the caller; all diagnostics go to STDERR, STDOUT is the report only.
set -u
WF="${1:?workflow required}"
YYYYMM="${2:?yyyymm required}"
FID="${3:?fid required}"

REPO_ROOT=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")
WT=$(git rev-parse --show-toplevel)
STATUS="$WT/docs/plans/$YYYYMM/logs/$FID/status.jsonl"
STATS="$REPO_ROOT/.bkit/stats.jsonl"
BKIT_VER=$(jq -r '.pinnedVersion // empty' "$REPO_ROOT/.bkit/version" 2>/dev/null); [ -z "$BKIT_VER" ] && BKIT_VER="unknown"
REPO_SLUG=$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null | sed -E 's|.*github\.com[:/]||; s|\.git$||' || echo "unknown/repo")

# Unique-key count over a ledger — ALWAYS a clean single integer (0 if file absent/empty).
_keys() { # <file> <jq-filter>
  local n=0
  [ -f "$1" ] && n=$(jq -rs "$2" "$1" 2>/dev/null | grep -oE '[0-9]+' | tail -1)
  printf '%s' "${n:-0}"
}

pnpm bkit comply --phase "$WF" >&2 || echo "[bkit-comply] grader unavailable, skipping" >&2

BASE_SHA=$(jq -rs --arg w "$WF" '[.[]|select(.type=="workflow-started" and .workflow==$w)]|last|.parentSha // ""' "$STATUS" 2>/dev/null || echo "")
START_AT=$(jq -rs --arg w "$WF" '[.[]|select(.type=="workflow-started" and .workflow==$w)]|last|.at // ""' "$STATUS" 2>/dev/null || echo "")
if [ -n "$START_AT" ]; then START_S=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$START_AT" +%s 2>/dev/null || date -d "$START_AT" +%s 2>/dev/null || echo 0); else START_S=0; fi
DURATION_S=$(( $(date +%s) - START_S )); { [ "$DURATION_S" -lt 0 ] || [ "$START_S" -eq 0 ]; } && DURATION_S=0
START_MS=$(( START_S * 1000 ))

RANGE="origin/dev...HEAD"; [ -n "$BASE_SHA" ] && RANGE="${BASE_SHA}..HEAD"
DIFF_STAT=$(git diff --shortstat "$RANGE" 2>/dev/null || echo "")
LINES_ADDED=$(printf '%s' "$DIFF_STAT" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' | tail -1); LINES_ADDED=${LINES_ADDED:-0}
LINES_DELETED=$(printf '%s' "$DIFF_STAT" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' | tail -1); LINES_DELETED=${LINES_DELETED:-0}
FILES_CHANGED=$(printf '%s' "$DIFF_STAT" | grep -oE '[0-9]+ file' | grep -oE '[0-9]+' | tail -1); FILES_CHANGED=${FILES_CHANGED:-0}
LINES_CHANGED=$(( LINES_ADDED + LINES_DELETED ))
TASK_COUNT=$(grep -h '^\- \[' "$WT/docs/plans/$YYYYMM/$FID-plan"*.md 2>/dev/null | wc -l | tr -dc '0-9'); TASK_COUNT=${TASK_COUNT:-0}

DEFERRALS_COUNT=$(_keys "$WT/docs/deferrals.jsonl" '[.[]|select(.kind=="deferral")|.key]|unique|length')
FAILURES_COUNT=$(_keys "$WT/docs/failures.jsonl" '[.[]|select(.kind=="failure")|.key]|unique|length')
FRICTION_ADDED=$(_keys "$WT/.bkit/friction.jsonl" "[.[]|select((.workflow==\"$WF\") and (.ts>=$START_MS))|.key]|unique|length")
DEFERRALS_ADDED=$(_keys "$WT/docs/deferrals.jsonl" "[.[]|select((.workflow==\"$WF\") and (.ts>=$START_MS))|.key]|unique|length")
FAILURES_ADDED=$(_keys "$WT/docs/failures.jsonl" "[.[]|select((.workflow==\"$WF\") and (.ts>=$START_MS))|.key]|unique|length")

jq -nc --arg repo "$REPO_SLUG" --arg bkitVersion "$BKIT_VER" --arg workflow "$WF" --arg step "$WF-close-workflow" --arg parentSha "$(git rev-parse HEAD)" \
  --argjson linesAdded "$LINES_ADDED" --argjson linesDeleted "$LINES_DELETED" --argjson linesChanged "$LINES_CHANGED" --argjson filesChanged "$FILES_CHANGED" \
  --argjson taskCount "$TASK_COUNT" --argjson durationSeconds "$DURATION_S" --argjson deferrals "$DEFERRALS_COUNT" --argjson failures "$FAILURES_COUNT" \
  --argjson frictionAdded "$FRICTION_ADDED" --argjson deferralsAdded "$DEFERRALS_ADDED" --argjson failuresAdded "$FAILURES_ADDED" \
  '.ts=(now*1000|floor)|.kind="outcome"|.workflow=$workflow|.repo=$repo|.bkitVersion=$bkitVersion|.step=$step|.parentSha=$parentSha|.linesAdded=$linesAdded|.linesDeleted=$linesDeleted|.linesChanged=$linesChanged|.filesChanged=$filesChanged|.taskCount=$taskCount|.durationSeconds=$durationSeconds|.deferrals=$deferrals|.failures=$failures|.frictionAdded=$frictionAdded|.deferralsAdded=$deferralsAdded|.failuresAdded=$failuresAdded' \
  >> "$STATS" 2>/dev/null || echo "[bkit-telemetry] append failed: $STATS" >&2

(cd "$REPO_ROOT" && pnpm bkit telemetry summary --phase="$WF") 2>/dev/null || echo "[bkit-telemetry] summary unavailable"
