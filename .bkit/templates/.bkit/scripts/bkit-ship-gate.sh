#!/usr/bin/env bash
# bkit-ship-gate.sh — Tier-1 merge gate for ship (#384).
#
# Refuses to merge unless the capstone job (bkit.capstoneJob, default
# bkit-tests-check) is present and concluded `success` at the current PR head
# SHA. The design's organising choice: every load-bearing rule of its class
# (failure unrecoverable — ci.yml:130-131 gives merged-PR dev pushes only
# run_level=light) lives only in prose; this script extracts it into a tested
# executable.
#
# Contract:
#   bkit-ship-gate.sh assert --head <sha> [--capstone <job>] [--workflow <file>]
#                                      [--repo <o/r>] [--explain]
#
# Run selection (decided before exit codes can mean anything):
#   gh api /repos/{o}/{r}/actions/workflows/{ciWorkflow}/runs?head_sha=<sha>
#     - workflow-scoped (NOT repo-wide), then select the most recent
#       `completed` run of that workflow at that exact head. If runs exist but
#       none completed → code 11 (in progress, not absent).
#
# Capstone resolution:
#   gh api /repos/{o}/{r}/actions/runs/{id}/jobs --paginate
#     - find the capstone job by name; if absent → code 13.
#
# Exit codes — one per condition, never collapsed:
#    0  Capstone present in selected run, concluded `success`              → proceed
#   10  No run of the CI workflow exists at head                            → refuse
#   11  Runs exist at head but none completed                               → refuse (poll)
#   12  Selected run concluded failure                                      → refuse
#   13  Selected run exists but capstone job ABSENT                         → refuse
#   14  Green run exists, but at a SUPERSEDED SHA                           → refuse
#   15  Selected run concluded `cancelled`                                  → refuse
#   16  Capstone green but a lane concluded `skipped` (not full)            → refuse
#   20  API error / rate limit / auth                                       → refuse
#
# `BKIT_SHIP_GATE_OVERRIDE=<sha>` is honoured ONLY when it equals the refused
# head SHA (caller asserts "I know this head is the one I validated"); any
# other value is ignored. On override, the gate appends its own override
# `status.jsonl` row at $STATUS_PATH (best-effort).
#
# All diagnostics on stderr behind `[bkit-ship-gate]`. `--explain` prints a
# human-readable note on stdout for code 0 (cache-skip provenance etc.).

set -euo pipefail

PREFIX="[bkit-ship-gate]"
err() { printf '%s %s\n' "$PREFIX" "$*" >&2; }

print_usage() {
  sed -n '2,46p' "$0" >&2
}

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

ACTION=""
HEAD_SHA=""
CAPSTONE=""
WORKFLOW=""
REPO=""
EXPLAIN=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    assert) ACTION="assert" ;;
    --head) HEAD_SHA="${2:-}"; shift ;;
    --capstone) CAPSTONE="${2:-}"; shift ;;
    --workflow) WORKFLOW="${2:-}"; shift ;;
    --repo) REPO="${2:-}"; shift ;;
    --explain) EXPLAIN=1 ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      err "unknown flag: $1"
      exit 2
      ;;
  esac
  shift || true
done

if [ "$ACTION" != "assert" ]; then
  err "usage: bkit-ship-gate.sh assert --head <sha> [--capstone <job>] [--workflow <file>] [--repo <o/r>] [--explain]"
  exit 2
fi

if [ -z "$HEAD_SHA" ]; then
  err "--head <sha> is required"
  exit 2
fi

# ---------------------------------------------------------------------------
# Config resolution (defaults from package.json per Task 1's config surface)
# ---------------------------------------------------------------------------

CAPSTONE_DEFAULT="bkit-tests-check"
WORKFLOW_DEFAULT="ci.yml"

if [ -z "$CAPSTONE" ] && [ -f "package.json" ] && command -v jq >/dev/null 2>&1; then
  CAPSTONE=$(jq -r '.bkit.capstoneJob // "bkit-tests-check"' package.json 2>/dev/null || printf '%s' "$CAPSTONE_DEFAULT")
fi
[ -n "$CAPSTONE" ] || CAPSTONE="$CAPSTONE_DEFAULT"

if [ -z "$WORKFLOW" ] && [ -f "package.json" ] && command -v jq >/dev/null 2>&1; then
  WORKFLOW=$(jq -r '.bkit.ciWorkflow // "ci.yml"' package.json 2>/dev/null || printf '%s' "$WORKFLOW_DEFAULT")
fi
[ -n "$WORKFLOW" ] || WORKFLOW="$WORKFLOW_DEFAULT"

if [ -z "$REPO" ]; then
  if command -v gh >/dev/null 2>&1; then
    REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || printf '')
  fi
fi
if [ -z "$REPO" ]; then
  err "could not resolve repo (pass --repo <o/r> or run inside a gh-authenticated checkout)"
  exit 20
fi

OVERRIDE_SHA="${BKIT_SHIP_GATE_OVERRIDE:-}"

# ---------------------------------------------------------------------------
# Refusal helpers
# ---------------------------------------------------------------------------

print_refusal_context() {
  local run_url="${1:-}"
  err "required head:  $HEAD_SHA"
  if [ -n "${SELECTED_HEAD_SHA:-}" ] && [ "$SELECTED_HEAD_SHA" != "$HEAD_SHA" ]; then
    err "head tested:   $SELECTED_HEAD_SHA  (SUPERSEDED)"
  fi
  if [ -n "$run_url" ]; then
    err "run:           $run_url"
  fi
}

# Override is honoured ONLY when the caller pinned the EXACT head being refused.
# Any other value (empty, a different SHA) is ignored — the refusal stands.
maybe_override() {
  if [ -n "$OVERRIDE_SHA" ] && [ "$OVERRIDE_SHA" = "$HEAD_SHA" ]; then
    # ${STATUS_PATH:-} is safe under `set -u` (default empty). When empty the
    # gate can no longer fall back to a literal-brace default path — the inner
    # `{YYYYMM}`/`{FID}` groups never expand (the comment above flagged this).
    # The caller (workflow Step 6) exports STATUS_PATH before invoking the gate;
    # the stderr fallback below keeps the override visible even if it is unset
    # or unwritable, so the documented rollback grep never misses it.
    local status="${STATUS_PATH:-}"
    if command -v jq >/dev/null 2>&1; then
      local row
      row=$(jq -nc --arg t "$(date -u +%FT%TZ)" --arg sha "$HEAD_SHA" \
        '{type:"ship-gate-override", at:$t, head:$sha, assertedBy:"bkit-ship-gate.sh"}') || row=""
      if [ -n "$status" ] && printf '%s\n' "$row" >> "$status" 2>/dev/null; then
        : # audit row landed in the canonical status.jsonl
      else
        # NEVER invisible: STATUS_PATH unset/unwritable → emit to stderr so the
        # documented rollback grep (deployments.md § Ship gate) still surfaces it.
        err "override audit row (STATUS_PATH unset/unwritable: '${status:-<unset>}'), emitting to stderr:"
        printf '%s\n' "$row" >&2
      fi
    fi
    if [ "$EXPLAIN" = "1" ]; then
      printf '[bkit-ship-gate] override honoured for head %s (BKIT_SHIP_GATE_OVERRIDE matches refused head)\n' "$HEAD_SHA"
    fi
    exit 0
  fi
}

refuse() {
  local code="$1"
  local run_url="${2:-}"
  print_refusal_context "$run_url"
  maybe_override
  exit "$code"
}

# ---------------------------------------------------------------------------
# 1. Run-list query (workflow-scoped, head-keyed)
# ---------------------------------------------------------------------------

RUNS_JSON=""
if ! RUNS_JSON=$(gh api "/repos/$REPO/actions/workflows/$WORKFLOW/runs?head_sha=$HEAD_SHA"); then
  # API error — sample rate_limit to shape the code-20 message.
  err "workflow runs query failed for $REPO/$WORKFLOW at head $HEAD_SHA"
  if command -v gh >/dev/null 2>&1; then
    RATELIMIT=$(gh api rate_limit 2>/dev/null || printf '')
    if [ -n "$RATELIMIT" ]; then
      REMAINING=$(printf '%s' "$RATELIMIT" | jq -r '.rate.remaining // empty' 2>/dev/null || printf '')
      RESET=$(printf '%s' "$RATELIMIT" | jq -r '.rate.reset // empty' 2>/dev/null || printf '')
      if [ "${REMAINING:-1}" = "0" ]; then
        err "rate limit exhausted (remaining=0, reset at $RESET) — dispatch, do not push"
      else
        err "API error (rate remaining=$REMAINING) — auth / network / unknown; distinct from 'no run'"
      fi
    else
      err "API error — rate_limit query also failed; auth / network / unknown API blip (distinct from 'no run')"
    fi
  fi
  refuse 20
fi

TOTAL_COUNT=$(printf '%s' "$RUNS_JSON" | jq -r '.total_count // 0' 2>/dev/null || printf '0')

if [ "${TOTAL_COUNT:-0}" = "0" ]; then
  err "no run of $WORKFLOW exists at head $HEAD_SHA (total_count=0)"
  refuse 10
fi

# ---------------------------------------------------------------------------
# 2. Run selection — most recent `completed` run at THIS head
# ---------------------------------------------------------------------------

SELECTED=$(printf '%s' "$RUNS_JSON" | jq -r '
  .workflow_runs
  | map(select(.head_sha == $head))
  | sort_by(.updated_at)
  | reverse
  | .[0:1]
  | .[0] // empty
' --arg head "$HEAD_SHA" 2>/dev/null || printf '')

# Stale-green detection: API returned runs but NONE match the queried head.
# The most-recent run (at any head) is the superseded-green candidate.
if [ -z "$SELECTED" ]; then
  STALE=$(printf '%s' "$RUNS_JSON" | jq -r '
    .workflow_runs
    | sort_by(.updated_at)
    | reverse
    | .[0:1]
    | .[0] // empty
  ' 2>/dev/null || printf '')
  if [ -n "$STALE" ]; then
    SELECTED_HEAD_SHA=$(printf '%s' "$STALE" | jq -r '.head_sha // empty' 2>/dev/null || printf '')
    STALE_CONCLUSION=$(printf '%s' "$STALE" | jq -r '.conclusion // empty' 2>/dev/null || printf '')
    STALE_URL=$(printf '%s' "$STALE" | jq -r '.html_url // empty' 2>/dev/null || printf '')
    err "selected run is at a SUPERSEDED head ($SELECTED_HEAD_SHA, conclusion=$STALE_CONCLUSION) — not the requested $HEAD_SHA"
    refuse 14 "$STALE_URL"
  fi
  err "no run could be selected at head $HEAD_SHA"
  refuse 10
fi

SELECTED_ID=$(printf '%s' "$SELECTED" | jq -r '.id // empty' 2>/dev/null || printf '')
SELECTED_STATUS=$(printf '%s' "$SELECTED" | jq -r '.status // empty' 2>/dev/null || printf '')
SELECTED_CONCLUSION=$(printf '%s' "$SELECTED" | jq -r '.conclusion // empty' 2>/dev/null || printf '')
SELECTED_HEAD_SHA=$(printf '%s' "$SELECTED" | jq -r '.head_sha // empty' 2>/dev/null || printf '')
SELECTED_URL=$(printf '%s' "$SELECTED" | jq -r '.html_url // empty' 2>/dev/null || printf '')

if [ "$SELECTED_HEAD_SHA" != "$HEAD_SHA" ]; then
  err "selected run is at a SUPERSEDED head ($SELECTED_HEAD_SHA, conclusion=$SELECTED_CONCLUSION) — not the requested $HEAD_SHA"
  refuse 14 "$SELECTED_URL"
fi

# ---------------------------------------------------------------------------
# 3. Runs exist but none completed → code 11 (in progress, not absent)
# ---------------------------------------------------------------------------

if [ "$SELECTED_STATUS" != "completed" ]; then
  err "runs exist at head $HEAD_SHA but none completed (status=$SELECTED_STATUS) — caller may poll"
  refuse 11 "$SELECTED_URL"
fi

# ---------------------------------------------------------------------------
# 4. Conclusion dispatch
# ---------------------------------------------------------------------------

case "$SELECTED_CONCLUSION" in
  success)
    : # continue to capstone check
    ;;
  failure)
    err "selected run concluded FAILURE at head $HEAD_SHA"
    refuse 12 "$SELECTED_URL"
    ;;
  cancelled)
    err "selected run was CANCELLED at head $HEAD_SHA — dispatch, do not push"
    refuse 15 "$SELECTED_URL"
    ;;
  *)
    err "selected run concluded '$SELECTED_CONCLUSION' at head $HEAD_SHA — not validated"
    refuse 12 "$SELECTED_URL"
    ;;
esac

# ---------------------------------------------------------------------------
# 5. Capstone resolution — read jobs, find the capstone by name
# ---------------------------------------------------------------------------

JOBS_JSON=""
if ! JOBS_JSON=$(gh api "/repos/$REPO/actions/runs/$SELECTED_ID/jobs" --paginate); then
  err "jobs query failed for run $SELECTED_ID — API error (distinct from 'no capstone')"
  if command -v gh >/dev/null 2>&1; then
    RATELIMIT=$(gh api rate_limit 2>/dev/null || printf '')
    if [ -n "$RATELIMIT" ]; then
      REMAINING=$(printf '%s' "$RATELIMIT" | jq -r '.rate.remaining // empty' 2>/dev/null || printf '')
      err "rate remaining=$REMAINING"
    fi
  fi
  refuse 20 "$SELECTED_URL"
fi

CAPSTONE_JOB=$(printf '%s' "$JOBS_JSON" | jq -r --arg capstone "$CAPSTONE" '
  .jobs
  | map(select(.name == $capstone))
  | .[0] // empty
' 2>/dev/null || printf '')

if [ -z "$CAPSTONE_JOB" ]; then
  err "capstone job '$CAPSTONE' ABSENT from run $SELECTED_ID at head $HEAD_SHA — never vacuous pass"
  refuse 13 "$SELECTED_URL"
fi

CAPSTONE_CONCLUSION=$(printf '%s' "$CAPSTONE_JOB" | jq -r '.conclusion // empty' 2>/dev/null || printf '')

if [ "$CAPSTONE_CONCLUSION" != "success" ]; then
  err "capstone '$CAPSTONE' concluded '$CAPSTONE_CONCLUSION' (not success) at head $HEAD_SHA"
  refuse 12 "$SELECTED_URL"
fi

# ---------------------------------------------------------------------------
# 6. Lane check — any non-success conclusion is a vacuous green unless cache_skip
# ---------------------------------------------------------------------------

# A lane (non-capstone job) concluded `skipped` is suspicious. Distinguish:
#   - cache_skip: a step whose name matches `cache`/`restore` indicates the
#     skip is a cache-hit short-circuit (sound — keyed to the exact commit SHA).
#   - real skip: a lane skipped without a cache marker → vacuous green (code 16).
SKIPPED_LANES=$(printf '%s' "$JOBS_JSON" | jq -r --arg capstone "$CAPSTONE" '
  .jobs
  | map(select(.name != $capstone))
  | map(select(.conclusion == "skipped"))
' 2>/dev/null || printf '[]')

SKIPPED_LANE_COUNT=$(printf '%s' "$SKIPPED_LANES" | jq 'length' 2>/dev/null || printf '0')

if [ "${SKIPPED_LANE_COUNT:-0}" -gt 0 ]; then
  # A skipped lane is vacuous UNLESS it carries a cache-marker step.
  VACUOUS_SKIPPED=$(printf '%s' "$SKIPPED_LANES" | jq -r '
    map(
      select(
        (.steps // [])
        | map(select((.name // "") | test("cache|restore"; "i")))
        | length == 0
      )
    )
    | length
  ' 2>/dev/null || printf '0')

  if [ "${VACUOUS_SKIPPED:-0}" -gt 0 ]; then
    err "capstone green but $VACUOUS_SKIPPED lane(s) concluded 'skipped' without a cache marker at head $HEAD_SHA — vacuous green"
    refuse 16 "$SELECTED_URL"
  fi
  if [ "$EXPLAIN" = "1" ]; then
    printf '[bkit-ship-gate] capstone green at %s; %s skipped lane(s) carried a cache marker (cache_skip provenance — keyed to the exact commit SHA)\n' \
      "$HEAD_SHA" "$SKIPPED_LANE_COUNT"
  fi
fi

# ---------------------------------------------------------------------------
# 7. Green — proceed
# ---------------------------------------------------------------------------

if [ "$EXPLAIN" = "1" ]; then
  printf '[bkit-ship-gate] capstone %s=success at head %s (run %s, %s)\n' \
    "$CAPSTONE" "$HEAD_SHA" "$SELECTED_ID" "$SELECTED_URL"
fi

exit 0
