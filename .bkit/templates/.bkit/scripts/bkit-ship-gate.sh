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
#                                      [--repo <o/r>] [--branch <name>] [--explain]
#                                      [--required-lanes <a,b,c>]
#
# Run selection (decided before exit codes can mean anything):
#   gh api /repos/{o}/{r}/actions/workflows/{ciWorkflow}/runs?head_sha=<sha>
#     - workflow-scoped (NOT repo-wide), then select the most recent
#       `completed` run of that workflow at that exact head. If runs exist but
#       none completed → code 11 (in progress, not absent). Selecting the most
#       recent COMPLETED run — not merely the most recent run — is load-bearing:
#       a re-dispatch still in flight must not mask a finished run at the head.
#
# Capstone resolution:
#   gh api /repos/{o}/{r}/actions/runs/{id}/jobs --paginate --slurp
#     - find the capstone job by name; if absent → code 13.
#     - `--slurp` is REQUIRED: without it `--paginate` emits one JSON document
#       PER PAGE (per_page=100), and a >100-job run turns every downstream
#       `jq` into a multi-document stream — `jq length` then yields "0\n0\n0",
#       which `[ … -gt 0 ]` rejects as a non-integer and the lane check below
#       silently stops running. `--slurp` collapses the pages into one array.
#
# Exit codes — one per condition, never collapsed:
#    0  Capstone present in selected run, concluded `success`              → proceed
#   10  No run of the CI workflow exists at head                            → refuse
#   11  Runs exist at head but none completed                               → refuse (poll)
#   12  Selected run concluded failure                                      → refuse
#   13  Selected run exists but capstone job ABSENT                         → refuse
#   14  Green run exists, but at a SUPERSEDED SHA (needs --branch)          → refuse
#   15  Selected run concluded `cancelled`                                  → refuse
#   16  A lane named in `bkit.shipGateRequiredLanes` concluded `skipped`  → refuse
#   20  API error / rate limit / auth                                       → refuse
#
# Code 14 requires `--branch`: the head-keyed run query is filtered SERVER-SIDE,
# so a superseded head returns an empty list and is indistinguishable from
# "never validated" (code 10) without a second, branch-scoped query. Callers that
# omit `--branch` get code 10 for both; both route the same way in bkit-ship.md.
#
# Code 16 is OPT-IN and fires ONLY for lanes the consumer names in
# `bkit.shipGateRequiredLanes` (package.json) or `--required-lanes a,b,c`.
# Default is the empty list: a skipped lane is REPORTED, never refused.
#
# It used to refuse on ANY skipped non-capstone lane, which made the gate
# unsatisfiable for the CI shape bkit itself ships. The jobs API reports no
# REASON for a skip, so the gate cannot tell a planned skip from a vacuous one —
# but the capstone can, and does: it takes every lane result as an input and
# asserts the plan was followed. A lane whose `if:` is event-scoped (the shipped
# template gates `@live` on a push to dev — real side effects must not fire off a
# PR) can NEVER run pre-merge, so a pre-merge gate demanding it refuses every PR
# forever. That is not a policy choice; it is unsatisfiable by construction. So
# the capstone's green settles it, as this header always claimed, and codes 10-15
# still carry the real anti-vacuity guarantees: a run exists, at THIS head,
# completed, not cancelled, capstone present, capstone green. Name lanes in
# `shipGateRequiredLanes` only if your capstone does NOT assert them itself.
# BKIT_SHIP_GATE_OVERRIDE remains the audited escape hatch.
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
  sed -n '2,60p' "$0" >&2
}

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

ACTION=""
HEAD_SHA=""
CAPSTONE=""
REQUIRED_LANES=""
WORKFLOW=""
REPO=""
BRANCH=""
EXPLAIN=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    assert) ACTION="assert" ;;
    --head) HEAD_SHA="${2:-}"; shift ;;
    --capstone) CAPSTONE="${2:-}"; shift ;;
    --required-lanes) REQUIRED_LANES="${2:-}"; shift ;;
    --workflow) WORKFLOW="${2:-}"; shift ;;
    --repo) REPO="${2:-}"; shift ;;
    --branch) BRANCH="${2:-}"; shift ;;
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
  err "usage: bkit-ship-gate.sh assert --head <sha> [--capstone <job>] [--workflow <file>] [--repo <o/r>] [--branch <name>] [--explain]"
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

# Required lanes: comma-separated on the flag, JSON array in package.json.
# Absent/empty/malformed all resolve to the empty list — report, never refuse.
if [ -z "$REQUIRED_LANES" ] && [ -f "package.json" ] && command -v jq >/dev/null 2>&1; then
  REQUIRED_LANES=$(jq -r '
    (.bkit.shipGateRequiredLanes // [])
    | if type == "array" then map(select(type == "string")) | join(",") else "" end
  ' package.json 2>/dev/null || printf '')
fi

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
  # No run at THIS head. The query above is filtered SERVER-SIDE by head_sha, so
  # a head that has since been superseded returns the same empty list as a head
  # that was never validated. Separating code 14 from code 10 therefore needs a
  # SECOND, branch-scoped query — only possible when the caller passed --branch.
  if [ -n "$BRANCH" ]; then
    RECENT_JSON=$(gh api "/repos/$REPO/actions/workflows/$WORKFLOW/runs?branch=$BRANCH&status=success&per_page=1" 2>/dev/null || printf '')
    STALE=$(printf '%s' "$RECENT_JSON" | jq -r '
      .workflow_runs // []
      | sort_by(.updated_at)
      | last // empty
    ' 2>/dev/null || printf '')
    if [ -n "$STALE" ]; then
      SELECTED_HEAD_SHA=$(printf '%s' "$STALE" | jq -r '.head_sha // empty' 2>/dev/null || printf '')
      STALE_URL=$(printf '%s' "$STALE" | jq -r '.html_url // empty' 2>/dev/null || printf '')
      err "no run at head $HEAD_SHA; latest green on $BRANCH is at a SUPERSEDED head ($SELECTED_HEAD_SHA) — re-validate"
      refuse 14 "$STALE_URL"
    fi
  fi
  err "no run of $WORKFLOW exists at head $HEAD_SHA (total_count=0)"
  refuse 10
fi

# ---------------------------------------------------------------------------
# 2. Run selection — most recent `completed` run at THIS head
#
# Every element is already at $HEAD_SHA (server-side filter), so the only real
# choice is WHICH run. Filtering to `completed` BEFORE taking the most recent is
# what makes the contract true: a re-dispatch still in flight is newer by
# updated_at, and selecting it would report "none completed" over a run that has
# in fact completed at this exact head.
# ---------------------------------------------------------------------------

SELECTED=$(printf '%s' "$RUNS_JSON" | jq -r --arg head "$HEAD_SHA" '
  .workflow_runs
  | map(select(.head_sha == $head and .status == "completed"))
  | sort_by(.updated_at)
  | last // empty
' 2>/dev/null || printf '')

# ---------------------------------------------------------------------------
# 3. Runs exist but none completed → code 11 (in progress, not absent)
# ---------------------------------------------------------------------------

if [ -z "$SELECTED" ]; then
  IN_FLIGHT=$(printf '%s' "$RUNS_JSON" | jq -r '
    .workflow_runs // [] | sort_by(.updated_at) | last // empty
  ' 2>/dev/null || printf '')
  IN_FLIGHT_STATUS=$(printf '%s' "$IN_FLIGHT" | jq -r '.status // empty' 2>/dev/null || printf '')
  IN_FLIGHT_URL=$(printf '%s' "$IN_FLIGHT" | jq -r '.html_url // empty' 2>/dev/null || printf '')
  err "runs exist at head $HEAD_SHA but none completed (status=${IN_FLIGHT_STATUS:-unknown}) — caller may poll"
  refuse 11 "$IN_FLIGHT_URL"
fi

SELECTED_ID=$(printf '%s' "$SELECTED" | jq -r '.id // empty' 2>/dev/null || printf '')
SELECTED_CONCLUSION=$(printf '%s' "$SELECTED" | jq -r '.conclusion // empty' 2>/dev/null || printf '')
SELECTED_HEAD_SHA=$(printf '%s' "$SELECTED" | jq -r '.head_sha // empty' 2>/dev/null || printf '')
SELECTED_URL=$(printf '%s' "$SELECTED" | jq -r '.html_url // empty' 2>/dev/null || printf '')

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

# `--slurp` collapses `--paginate`'s one-document-per-page output into a single
# JSON array; without it every jq below silently becomes a multi-document stream
# on any run with more than 100 jobs. Normalise back to one `{jobs:[…]}` object
# so the filters downstream stay single-document regardless of page count.
JOBS_JSON=""
JOBS_RAW=""
if ! JOBS_RAW=$(gh api "/repos/$REPO/actions/runs/$SELECTED_ID/jobs" --paginate --slurp); then
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

# Accept both shapes: `--slurp` gives `[{jobs:[…]}, …]` (one entry per page);
# a single un-slurped object is wrapped so the same filter covers both.
JOBS_JSON=$(printf '%s' "$JOBS_RAW" | jq -c '
  (if type == "array" then . else [.] end)
  | {jobs: (map(.jobs // []) | add // [])}
' 2>/dev/null || printf '{"jobs":[]}')

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

# The jobs API reports no REASON for a skip: a job skipped by a job-level `if:`
# is never assigned to a runner, so it carries an EMPTY `steps` array — there is
# no observable difference between a planned skip and a vacuous one. (An earlier
# revision tried to read a `cache`/`restore` step name as cache-skip provenance;
# no skipped job ever carries steps, so that carve-out could only ever match a
# hand-authored fixture. A cache HIT concludes `success` with step-level skips
# and a `cache_skip` output — never `skipped`.)
#
# The capstone CAN tell them apart — it takes every lane result as an input and
# asserts the plan was followed — so its green settles it. Skipped lanes are
# REPORTED for the human reading the log, and refuse ONLY when the consumer has
# explicitly named one in `bkit.shipGateRequiredLanes`.
SKIPPED_LANE_NAMES=$(printf '%s' "$JOBS_JSON" | jq -r --arg capstone "$CAPSTONE" '
  .jobs
  | map(select(.name != $capstone and .conclusion == "skipped"))
  | map(.name // "<unnamed>")
  | join(", ")
' 2>/dev/null || printf '')

SKIPPED_LANE_COUNT=$(printf '%s' "$JOBS_JSON" | jq -r --arg capstone "$CAPSTONE" '
  .jobs
  | map(select(.name != $capstone and .conclusion == "skipped"))
  | length
' 2>/dev/null || printf '0')

if [ "${SKIPPED_LANE_COUNT:-0}" -gt 0 ]; then
  err "note: $SKIPPED_LANE_COUNT lane(s) concluded 'skipped' at head $HEAD_SHA: $SKIPPED_LANE_NAMES"
  err "note: capstone '$CAPSTONE' is green and owns the planned-vs-vacuous judgement for those lanes"
fi

# Refuse only for lanes the consumer explicitly declared required.
if [ -n "$REQUIRED_LANES" ] && [ "${SKIPPED_LANE_COUNT:-0}" -gt 0 ]; then
  SKIPPED_REQUIRED=$(printf '%s' "$JOBS_JSON" | jq -r \
    --arg capstone "$CAPSTONE" --arg required "$REQUIRED_LANES" '
    ($required | split(",") | map(select(length > 0))) as $req
    | .jobs
    | map(select(.name != $capstone and .conclusion == "skipped"))
    | map(.name // "<unnamed>")
    | map(select(. as $n | $req | index($n)))
    | join(", ")
  ' 2>/dev/null || printf '')
  if [ -n "$SKIPPED_REQUIRED" ]; then
    err "required lane(s) concluded 'skipped' at head $HEAD_SHA — vacuous green: $SKIPPED_REQUIRED"
    err "declared in bkit.shipGateRequiredLanes (or --required-lanes): $REQUIRED_LANES"
    refuse 16 "$SELECTED_URL"
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
