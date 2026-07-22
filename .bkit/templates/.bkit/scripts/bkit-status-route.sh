#!/usr/bin/env sh
# bkit-status-route.sh — Durable routing-state reads/writes for workflow
# orchestrators (#58 follow-up: DEBUG_MODE / PUSH_MODE / verdicts / STRATEGY).
#
# Requires BKIT_STATUS_FOLD (source bkit-status-fold.sh first), except ladder_next.
#
# Usage:
#   . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || exit 2
#   . "$REPO_ROOT/.bkit/scripts/bkit-status-route.sh"
#
# Contract (fail-closed: exit 2, nothing on stdout, diagnostic on stderr):
#   route_get_debug_mode STATUS_FILE
#   route_get_push_mode STATUS_FILE
#   route_append_debug_mode STATUS_FILE MODE
#   route_append_push_mode STATUS_FILE MODE
#   route_last_verdict STATUS_FILE WORKFLOW STEP [--sub-plan N]
#   route_last_failures STATUS_FILE WORKFLOW STEP [--sub-plan N]
#   route_last_strategy STATUS_FILE WORKFLOW STEP [--sub-plan N]   # ALL-RUNS
#   ladder_next [PRIOR]   # ''→STANDARD→PIVOT→FINAL→FINAL
#
# debugMode/pushMode/verdict/failures: ACTIVE-RUN scoped.
# route_last_strategy: ALL-RUNS (PRIOR_STRATEGY precedent).
# shellcheck disable=SC2016

_route_die() {
  echo "[bkit-telemetry] $1" >&2
  return 2
}

_route_need_fold() {
  [ -n "$BKIT_STATUS_FOLD" ] || _route_die "BKIT_STATUS_FOLD not sourced — run '. bkit-status-fold.sh' first"
}

_route_need_file() {
  [ -f "$1" ] && [ -r "$1" ] || return 2
}

# Active-run field: run-level (workflow-meta merge) wins; else last step with field.
_route_get_run_or_step_field() {
  _rg_file="$1"
  _rg_workflow="$2"
  _rg_field="$3"
  _route_need_fold || return 2
  _route_need_file "$_rg_file" || return 2
  _rg_result=$(
    jq -s -r --arg w "$_rg_workflow" --arg f "$_rg_field" \
      "$BKIT_STATUS_FOLD"'
        fold
        | map(select(.workflow==$w))
        | last
        | (. // {}) as $run
        | if (($run[$f] // null)|type)=="string" and ($run[$f] // "")!="" then $run[$f]
          else
            (($run.steps // [])
              | map(select((.[$f] // null) != null and .[$f] != ""))
              | last
              | .[$f] // "")
          end
      ' "$_rg_file" 2>/dev/null
  ) || return 2
  printf '%s' "$_rg_result"
}

route_get_debug_mode() {
  _rdm=$(_route_get_run_or_step_field "$1" debug debugMode) || return 2
  case "$_rdm" in
    NORMAL | SOAK) printf '%s\n' "$_rdm"; return 0 ;;
    *) _route_die "route_get_debug_mode: missing or invalid debugMode"; return 2 ;;
  esac
}

route_get_push_mode() {
  _rpm=$(_route_get_run_or_step_field "$1" debug pushMode) || return 2
  case "$_rpm" in
    PR | LOCAL) printf '%s\n' "$_rpm"; return 0 ;;
    *) _route_die "route_get_push_mode: missing or invalid pushMode"; return 2 ;;
  esac
}

route_append_debug_mode() {
  _rad_file="$1"
  _rad_mode="$2"
  case "$_rad_mode" in
    NORMAL | SOAK) ;;
    *) _route_die "route_append_debug_mode: MODE must be NORMAL|SOAK"; return 2 ;;
  esac
  _route_need_file "$_rad_file" || return 2
  jq -nc --arg t "$(date -u +%FT%TZ)" --arg m "$_rad_mode" \
    '{type:"workflow-meta",workflow:"debug",at:$t,debugMode:$m}' >> "$_rad_file" || return 2
  return 0
}

route_append_push_mode() {
  _rap_file="$1"
  _rap_mode="$2"
  case "$_rap_mode" in
    PR | LOCAL) ;;
    *) _route_die "route_append_push_mode: MODE must be PR|LOCAL"; return 2 ;;
  esac
  _route_need_file "$_rap_file" || return 2
  jq -nc --arg t "$(date -u +%FT%TZ)" --arg m "$_rap_mode" \
    '{type:"workflow-meta",workflow:"debug",at:$t,pushMode:$m}' >> "$_rap_file" || return 2
  return 0
}

_route_last_step_field() {
  _rls_file="$1"
  _rls_workflow="$2"
  _rls_step="$3"
  _rls_field="$4"
  shift 4
  _rls_subplan=""
  _rls_scope="active" # active | all
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --sub-plan)
        _rls_subplan="$2"
        shift 2
        ;;
      --all-runs)
        _rls_scope="all"
        shift
        ;;
      *)
        shift
        ;;
    esac
  done
  _route_need_fold || return 2
  _route_need_file "$_rls_file" || return 2
  if [ "$_rls_scope" = "all" ]; then
    _rls_result=$(
      jq -s -r --arg w "$_rls_workflow" --arg s "$_rls_step" --arg f "$_rls_field" \
        --argjson sp "${_rls_subplan:-null}" \
        "$BKIT_STATUS_FOLD"'
          fold
          | [.[] | select(.workflow==$w) | .steps[]?
              | select(.step==$s and .status=="DONE" and ($sp == null or .subPlan==$sp))]
          | last
          | if .==null then empty else .[$f] // empty end
        ' "$_rls_file" 2>/dev/null
    ) || return 2
  else
    _rls_result=$(
      jq -s -r --arg w "$_rls_workflow" --arg s "$_rls_step" --arg f "$_rls_field" \
        --argjson sp "${_rls_subplan:-null}" \
        "$BKIT_STATUS_FOLD"'
          fold
          | map(select(.workflow==$w))
          | last
          | (. // {}) as $run
          | ($run.steps // [])
          | map(select(.step==$s and .status=="DONE" and ($sp == null or .subPlan==$sp)))
          | last
          | if .==null then empty else .[$f] // empty end
        ' "$_rls_file" 2>/dev/null
    ) || return 2
  fi
  printf '%s' "$_rls_result"
}

route_last_verdict() {
  _rlv_file="$1"
  _rlv_wf="$2"
  _rlv_step="$3"
  shift 3
  _rlv=$(_route_last_step_field "$_rlv_file" "$_rlv_wf" "$_rlv_step" verdict "$@") || return 2
  case "$_rlv" in
    PASS | CONCERNS | FAIL) printf '%s\n' "$_rlv"; return 0 ;;
    *) _route_die "route_last_verdict: missing or invalid verdict"; return 2 ;;
  esac
}

route_last_failures() {
  _rlf_file="$1"
  _rlf_wf="$2"
  _rlf_step="$3"
  shift 3
  # Ensure step exists via verdict first
  _rlf_v=$(_route_last_step_field "$_rlf_file" "$_rlf_wf" "$_rlf_step" verdict "$@") || return 2
  case "$_rlf_v" in
    PASS | CONCERNS | FAIL) ;;
    *) _route_die "route_last_failures: no DONE step"; return 2 ;;
  esac
  _rlf=$(_route_last_step_field "$_rlf_file" "$_rlf_wf" "$_rlf_step" failures "$@") || return 2
  case "$_rlf" in
    '')
      printf '0\n'
      return 0
      ;;
    *[!0-9]*)
      _route_die "route_last_failures: non-integer failures"
      return 2
      ;;
    *)
      printf '%s\n' "$_rlf"
      return 0
      ;;
  esac
}

route_last_strategy() {
  _rls_file="$1"
  _rls_wf="$2"
  _rls_step="$3"
  shift 3
  _route_need_fold || return 2
  _route_need_file "$_rls_file" || return 2
  _rls_subplan=""
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --sub-plan)
        _rls_subplan="$2"
        shift 2
        ;;
      *)
        shift
        ;;
    esac
  done
  _rls_result=$(
    jq -s -r --arg w "$_rls_wf" --arg s "$_rls_step" --argjson sp "${_rls_subplan:-null}" \
      "$BKIT_STATUS_FOLD"'
        fold
        | [.[] | .steps[]? | select(.step==$s and .status=="DONE" and ($sp == null or .subPlan==$sp))]
        | last.strategy // ""
      ' "$_rls_file" 2>/dev/null
  ) || return 2
  case "$_rls_result" in
    '' | STANDARD | PIVOT | FINAL)
      printf '%s\n' "$_rls_result"
      return 0
      ;;
    *)
      _route_die "route_last_strategy: invalid strategy"
      return 2
      ;;
  esac
}

ladder_next() {
  _ln_prior="${1-}"
  case "$_ln_prior" in
    '')
      printf 'STANDARD\n'
      return 0
      ;;
    STANDARD)
      printf 'PIVOT\n'
      return 0
      ;;
    PIVOT | FINAL)
      printf 'FINAL\n'
      return 0
      ;;
    *)
      _route_die "ladder_next: invalid PRIOR"
      return 2
      ;;
  esac
}
