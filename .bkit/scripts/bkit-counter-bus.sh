#!/usr/bin/env sh
# bkit-counter-bus.sh — Shell counter bus helpers for bkit workflow orchestrators.
#
# Provides deterministic counter primitives so *_ATTEMPT counters and MAX_*
# comparisons live in fenced shell, not orchestrator prose (#58 / WS3).
#
# Usage:
#   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
#
# All helpers are POSIX-portable (no bashisms, no process substitution).
#
# Contract:
#   counter_count STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]
#                               — count of matching DONE step-done rows
#   counter_next  STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]
#                               — counter_count + 1 (position 1, derive-at-START)
#   counter_current STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]
#                               — counter_count, refuses 0 (position 2, post-own-write)
#   check_max NAME VALUE MAX    — exit 0 if VALUE <= MAX, exit 1 if exceeded
#   decide_next NAME VALUE MAX CONTINUE_STEP EXCEEDED_STEP
#                               — print next step id; exit code = branch
#                                 exit 0 = continue (VALUE <= MAX)
#                                 exit 1 = exceeded (VALUE > MAX)
#
# There is no persisted counter state. Every counter is DERIVED from
# status.jsonl at the point of use (#58) — no `BKIT_COUNTER_*` shell
# variable convention exists, because shell state does not survive across
# orchestrator Bash calls (each fenced block is a fresh process). See the
# THREE POSITIONS note below.
#
# ---------------------------------------------------------------------------
# DERIVATION HELPERS (#58 — derive attempt counters from status.jsonl,
# do not store them). Require BKIT_STATUS_FOLD to already be sourced
# (". $REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" first).
#
#   counter_count STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]
#     Prints the count of `step-done` rows for STEP with status=="DONE" in
#     the ACTIVE run of WORKFLOW (fold | map(select(.workflow==$w)) | last |
#     .steps) — never all-runs (that is PRIOR_STRATEGY's deliberately
#     opposite scoping; see bkit-status-fold.sh's header). `--sub-plan N`
#     additionally requires `.subPlan==N`. `--since FIELD` additionally
#     requires `.at > (run[FIELD] // "")` (used by SOAK's `soakEntryAt`
#     marker). Returns 2, printing NOTHING on stdout, when STATUS_FILE is
#     missing/unreadable, jq fails, or the result is not a non-negative
#     integer. `counter_count` is PUBLIC API in its own right, not an
#     internal helper of the other two below — see position 3.
#
#   THREE POSITIONS, not two — read this before reaching for a helper:
#     1. derive-at-START of the counted step  -> counter_next
#        (= counter_count + 1; the value the artifact filename embeds and
#        the row about to be written will record).
#     2. route AFTER the step's own row has just been written -> counter_current
#        (= counter_count, but REFUSES 0 — return 2 — because the row this
#        same block just wrote makes 0 rows impossible; a 0 here means a
#        dropped row, not a legitimate first attempt).
#     3. route on the count of a DIFFERENT, prior / not-yet-executed step
#        -> counter_count directly. 0 IS a legal answer here (exit 0,
#        continue branch) — the step being counted simply hasn't run yet.
#        Live sites: bkit-build.md:786-787's challenge-remediate first-pass
#        routing (0 prior `build-challenge-remediate` rows -> continue to
#        Step 11, not Failure Path) and bkit-debug.md:443's SOAK budget
#        check in Step 3 (0 `debug-failure-soak` rows before Step 7 has ever
#        run -> continue, not Failure Path). Using counter_current at
#        either of these sites bricks the route on its first legitimate
#        pass (#58 Breaking Changes item 10b) — do NOT "fix" a 0 there by
#        reaching for counter_current; that is the routing helper's job
#        ONLY at position 2.
#
#   counter_next STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]
#     = counter_count + 1. Position 1 (derive-at-START). Returns 2 under the
#     same conditions as counter_count.
#
#   counter_current STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]
#     = counter_count, but returns 2 (refused) when the count is 0. Position
#     2 (post-own-write) ONLY — see the three-position note above.
#
#   Asymmetry with PRIOR_STRATEGY (bkit-build.md / bkit-debug.md / bkit-ship.md):
#   PRIOR_STRATEGY folds status.jsonl with ALL-RUNS scoping — a resumed run
#   deliberately inherits the prior run's strategy so it does not restart
#   the STANDARD -> PIVOT -> FINAL ladder. counter_count/_next/_current are
#   the OPPOSITE: ACTIVE-RUN scoped only, so a resumed run never inherits a
#   spent attempt budget from a run that has already finished (the DE-25
#   starvation this plan must not reintroduce). Two reads of the same log,
#   deliberately opposite scoping — this is not a bug in either direction.
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# counter_count STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]
# Prints the count of `step-done` rows for STEP, status=="DONE", in the
# ACTIVE run of WORKFLOW. Requires BKIT_STATUS_FOLD to be sourced. Returns 2
# (nothing on stdout) on a missing/unreadable file, a jq failure, or a
# non-integer result. 0 is a valid, non-error result (position 3 — see the
# three-position note above this file's header).
# ---------------------------------------------------------------------------
counter_count() {
  _cc_file="$1"
  _cc_workflow="$2"
  _cc_step="$3"
  shift 3
  _cc_subplan=""
  _cc_since=""
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --sub-plan)
        _cc_subplan="$2"
        shift 2
        ;;
      --since)
        _cc_since="$2"
        shift 2
        ;;
      *)
        shift
        ;;
    esac
  done

  if [ -z "$BKIT_STATUS_FOLD" ]; then
    echo "[bkit-telemetry] counter_count: BKIT_STATUS_FOLD not sourced — run '. bkit-status-fold.sh' first" >&2
    return 2
  fi
  [ -f "$_cc_file" ] && [ -r "$_cc_file" ] || return 2

  _cc_result=$(
    jq -s -r --arg w "$_cc_workflow" --arg s "$_cc_step" \
      --argjson sp "${_cc_subplan:-null}" --arg since "$_cc_since" \
      "$BKIT_STATUS_FOLD"'
        fold
        | map(select(.workflow==$w))
        | last
        | (. // {}) as $run
        | ($run.steps // [])
        | map(select(.step==$s and .status=="DONE" and ($sp == null or .subPlan==$sp)))
        | (if $since == "" then . else map(select(.at > ($run[$since] // ""))) end)
        | length
      ' "$_cc_file" 2>/dev/null
  )
  _cc_rc=$?
  if [ "$_cc_rc" -ne 0 ]; then
    return 2
  fi
  case "$_cc_result" in
    '' | *[!0-9]*)
      return 2
      ;;
  esac
  printf '%s\n' "$_cc_result"
  return 0
}

# ---------------------------------------------------------------------------
# counter_next STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]
# = counter_count + 1. Position 1 (derive-at-START) — the value the
# artifact filename embeds and the row about to be written will record.
# Returns 2 under the same conditions as counter_count.
# ---------------------------------------------------------------------------
counter_next() {
  _cn_val=$(counter_count "$@")
  _cn_rc=$?
  [ "$_cn_rc" -eq 0 ] || return 2
  printf '%s\n' "$((_cn_val + 1))"
  return 0
}

# ---------------------------------------------------------------------------
# counter_current STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]
# = counter_count, but returns 2 (refused) when the count is 0. Position 2
# (post-own-write) ONLY — the row this block just wrote makes 0 impossible;
# a 0 here means a dropped row, not a legitimate first attempt. Do NOT use
# at a position-3 site (routing on a prior/not-yet-executed step) — 0 is
# legal there and counter_count must be called directly instead.
# ---------------------------------------------------------------------------
counter_current() {
  _ccu_val=$(counter_count "$@")
  _ccu_rc=$?
  [ "$_ccu_rc" -eq 0 ] || return 2
  [ "$_ccu_val" -eq 0 ] && return 2
  printf '%s\n' "$_ccu_val"
  return 0
}

# ---------------------------------------------------------------------------
# check_max NAME VALUE MAX
# Returns exit 0 (continue) when VALUE <= MAX; exit 1 when VALUE > MAX.
# Prints "[bkit-telemetry] counter NAME exceeded MAX_*=MAX (value=VALUE)" on overflow.
#
# FAIL-CLOSED (#58 T3.8): VALUE and MAX must each be a non-negative integer
# (0 is legal — MAX_CHALLENGE_REMEDIATE_ATTEMPT's THRESHOLD=0 is the corpus's
# only live zero-threshold and must NOT be rejected). An empty or
# non-integer VALUE/MAX prints NOTHING on stdout, emits a diagnostic on
# stderr, and returns 2 — the caller must route any non-0/1 exit to the
# Failure Path. This is the other half of the KN-26 pair: today (before
# WS-3 derives a real value at every call site) an unset counter silently
# takes the continue branch (`[ "" -gt 3 ]` is false); this closes that.
# ---------------------------------------------------------------------------
check_max() {
  _cname="$1"
  _val="$2"
  _max="$3"
  case "$_val" in
    '' | *[!0-9]*)
      echo "[bkit-telemetry] counter ${_cname} unusable value '${_val}' — refusing to continue" >&2
      return 2
      ;;
  esac
  case "$_max" in
    '' | *[!0-9]*)
      echo "[bkit-telemetry] counter ${_cname} unusable max '${_max}' — refusing to continue" >&2
      return 2
      ;;
  esac
  if [ "$_val" -gt "$_max" ]; then
    echo "[bkit-telemetry] counter ${_cname} exceeded max=${_max} (value=${_val})" >&2
    return 1
  fi
  return 0
}

# ---------------------------------------------------------------------------
# decide_next NAME VALUE MAX CONTINUE_STEP EXCEEDED_STEP
# Prints the next step id and exits:
#   exit 0 + CONTINUE_STEP   when VALUE <= MAX
#   exit 1 + EXCEEDED_STEP   when VALUE > MAX
#   exit 2, prints NOTHING   when VALUE or MAX is empty/non-integer
#
# FAIL-CLOSED (#58 T3.8): see check_max's header comment — same contract.
# Callers MUST route exit 2 (and any exit other than 0/1) to the Failure
# Path; do NOT re-add `2>/dev/null` (it hides the only diagnostic) and do
# NOT default a missing/bad value to 0 to make this pass.
# ---------------------------------------------------------------------------
decide_next() {
  _cname="$1"
  _val="$2"
  _max="$3"
  _cont="$4"
  _excd="$5"
  case "$_val" in
    '' | *[!0-9]*)
      echo "[bkit-telemetry] counter ${_cname} unusable value '${_val}' — refusing to continue" >&2
      return 2
      ;;
  esac
  case "$_max" in
    '' | *[!0-9]*)
      echo "[bkit-telemetry] counter ${_cname} unusable max '${_max}' — refusing to continue" >&2
      return 2
      ;;
  esac
  if [ "$_val" -gt "$_max" ]; then
    echo "[bkit-telemetry] counter ${_cname} exceeded max=${_max} (value=${_val})" >&2
    printf '%s\n' "$_excd"
    return 1
  fi
  printf '%s\n' "$_cont"
  return 0
}
