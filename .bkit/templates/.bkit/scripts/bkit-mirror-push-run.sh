#!/usr/bin/env bash
# bkit-mirror-push-run.sh — copy the `dev` push run's capstone verdict onto a release PR.
#
# A same-repo `dev` -> default-branch PR has the same head SHA the `dev` push run already
# tests. In mirror mode the planner switches every test lane off and the PR's capstone runs
# this script instead: it waits for the push run at that head and passes only when that run's
# capstone passed. The PR check is still a real, non-skipped job — a skipped required check
# can read as passed on the PR even while the push run is red.
#
# Contract:
#   bkit-mirror-push-run.sh --head <sha> [--branch dev] [--repo <o/r>] [--workflow <file>]
#                           [--capstone <job>] [--absent-minutes 10] [--max-minutes 170]
#                           [--interval 30]
#
# Each poll runs `bkit-ship-gate.sh assert --event push --branch <branch>` at <sha>; the
# gate owns run selection, capstone lookup and its exit codes. This script owns waiting.
#
#   gate 0              -> exit 0   push run's capstone passed
#   gate 11             -> wait     push run still in progress
#   gate 10 / 14        -> wait, then exit 3 after --absent-minutes (no push run at this head:
#                                    the commit carried [skip ci], or CI never fired)
#   gate 20             -> wait; exit 20 after 3 API errors in a row
#   gate 12 / 13 / 15 / 16 -> exit 1   push run red, cancelled, capstone absent or skipped
#   anything else       -> exit 1
#   --max-minutes hit   -> exit 4   still in progress (keep it below the job's timeout-minutes
#                                    so the failure names its cause)
#   bad arguments       -> exit 2
#
# BKIT_SHIP_GATE_OVERRIDE is stripped from the gate's environment: the override is a
# per-head escape hatch for /bkit-ship, never a way to green a required check.
# BKIT_MIRROR_GATE_SH overrides the gate path (tests).

set -euo pipefail

PREFIX="[bkit-mirror-push-run]"
err() { printf '%s %s\n' "$PREFIX" "$*" >&2; }

HEAD_SHA=""
BRANCH="dev"
REPO="${GITHUB_REPOSITORY:-}"
WORKFLOW=""
CAPSTONE=""
ABSENT_MINUTES=10
MAX_MINUTES=170
INTERVAL=30

while [ "$#" -gt 0 ]; do
  case "$1" in
    --head) HEAD_SHA="${2:-}"; shift ;;
    --branch) BRANCH="${2:-}"; shift ;;
    --repo) REPO="${2:-}"; shift ;;
    --workflow) WORKFLOW="${2:-}"; shift ;;
    --capstone) CAPSTONE="${2:-}"; shift ;;
    --absent-minutes) ABSENT_MINUTES="${2:-}"; shift ;;
    --max-minutes) MAX_MINUTES="${2:-}"; shift ;;
    --interval) INTERVAL="${2:-}"; shift ;;
    -h|--help)
      sed -n '2,30p' "$0" >&2
      exit 0
      ;;
    *)
      err "unknown flag: $1"
      exit 2
      ;;
  esac
  shift
done

if [ -z "$HEAD_SHA" ] || [ -z "$BRANCH" ]; then
  err "usage: bkit-mirror-push-run.sh --head <sha> [--branch dev] [--repo <o/r>] [--absent-minutes N] [--max-minutes N] [--interval S]"
  exit 2
fi
for n in "$ABSENT_MINUTES" "$MAX_MINUTES" "$INTERVAL"; do
  case "$n" in
    ''|*[!0-9]*)
      err "--absent-minutes / --max-minutes / --interval take whole numbers (got '$n')"
      exit 2
      ;;
  esac
done

GATE_SH="${BKIT_MIRROR_GATE_SH:-$(cd "$(dirname "$0")" && pwd)/bkit-ship-gate.sh}"
if [ ! -f "$GATE_SH" ]; then
  err "gate script not found: $GATE_SH"
  exit 2
fi

GATE_ARGS=(assert --head "$HEAD_SHA" --branch "$BRANCH" --event push)
[ -n "$REPO" ] && GATE_ARGS+=(--repo "$REPO")
[ -n "$WORKFLOW" ] && GATE_ARGS+=(--workflow "$WORKFLOW")
[ -n "$CAPSTONE" ] && GATE_ARGS+=(--capstone "$CAPSTONE")

START=$(date +%s)
API_ERRORS=0
LAST_STATE=""

while :; do
  set +e
  GATE_ERR=$(env -u BKIT_SHIP_GATE_OVERRIDE bash "$GATE_SH" "${GATE_ARGS[@]}" 2>&1 >/dev/null)
  CODE=$?
  set -e
  ELAPSED_MIN=$(( ($(date +%s) - START) / 60 ))

  case "$CODE" in
    0)
      printf '%s %s push run at %s passed its capstone — release PR mirrors green.\n' "$PREFIX" "$BRANCH" "$HEAD_SHA"
      exit 0
      ;;
    11)
      API_ERRORS=0
      [ "$LAST_STATE" = "running" ] || err "$BRANCH push run at $HEAD_SHA is in progress — waiting (up to ${MAX_MINUTES}m)."
      LAST_STATE="running"
      ;;
    10|14)
      API_ERRORS=0
      if [ "$ELAPSED_MIN" -ge "$ABSENT_MINUTES" ]; then
        printf '%s\n' "$GATE_ERR" >&2
        err "no $BRANCH push run exists at $HEAD_SHA after ${ELAPSED_MIN}m. A [skip ci] commit at the $BRANCH tip dispatches none: push a commit without it to $BRANCH, then re-run this check."
        exit 3
      fi
      [ "$LAST_STATE" = "absent" ] || err "no $BRANCH push run at $HEAD_SHA yet — waiting up to ${ABSENT_MINUTES}m for one to appear."
      LAST_STATE="absent"
      ;;
    20)
      API_ERRORS=$((API_ERRORS + 1))
      if [ "$API_ERRORS" -ge 3 ]; then
        printf '%s\n' "$GATE_ERR" >&2
        err "GitHub API failed $API_ERRORS times in a row — cannot read the $BRANCH push run."
        exit 20
      fi
      err "GitHub API error ($API_ERRORS/3) — retrying."
      ;;
    *)
      printf '%s\n' "$GATE_ERR" >&2
      err "$BRANCH push run at $HEAD_SHA is not green (gate exit $CODE) — fix $BRANCH, or re-run the failed push run, then re-run this check."
      exit 1
      ;;
  esac

  if [ "$ELAPSED_MIN" -ge "$MAX_MINUTES" ]; then
    err "$BRANCH push run at $HEAD_SHA still not finished after ${ELAPSED_MIN}m (limit ${MAX_MINUTES}m)."
    exit 4
  fi
  sleep "$INTERVAL"
done
