#!/usr/bin/env sh
# bkit-counter-bus.sh — Shell counter bus helpers for bkit workflow orchestrators.
#
# Provides deterministic counter primitives so *_ATTEMPT counters and MAX_*
# comparisons live in fenced shell, not orchestrator prose (#58 / WS3).
#
# Usage:
#   . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
#
# Counter state is stored in shell variables of the form BKIT_COUNTER_{NAME}.
# All helpers are POSIX-portable (no bashisms, no process substitution).
#
# Contract:
#   counter_init NAME [VALUE]   — set counter to VALUE (default 0)
#   counter_inc  NAME           — increment counter by 1; print new value
#   counter_get  NAME           — print current value (0 if unset)
#   counter_reset NAME          — reset counter to 0
#   check_max NAME VALUE MAX    — exit 0 if VALUE <= MAX, exit 1 if exceeded
#   decide_next NAME VALUE MAX CONTINUE_STEP EXCEEDED_STEP
#                               — print next step id; exit code = branch
#                                 exit 0 = continue (VALUE <= MAX)
#                                 exit 1 = exceeded (VALUE > MAX)

# ---------------------------------------------------------------------------
# counter_init NAME [VALUE]
# ---------------------------------------------------------------------------
counter_init() {
  _cname="$1"
  _cval="${2:-0}"
  eval "BKIT_COUNTER_${_cname}=${_cval}"
}

# ---------------------------------------------------------------------------
# counter_inc NAME
# Increments BKIT_COUNTER_{NAME} by 1; prints the new value.
# ---------------------------------------------------------------------------
counter_inc() {
  _cname="$1"
  _cur=$(counter_get "$_cname")
  _new=$(( _cur + 1 ))
  eval "BKIT_COUNTER_${_cname}=${_new}"
  printf '%s\n' "$_new"
}

# ---------------------------------------------------------------------------
# counter_get NAME
# Prints current value of BKIT_COUNTER_{NAME} (0 if unset).
# ---------------------------------------------------------------------------
counter_get() {
  _cname="$1"
  eval "_val=\${BKIT_COUNTER_${_cname}:-0}"
  printf '%s\n' "$_val"
}

# ---------------------------------------------------------------------------
# counter_reset NAME
# Resets BKIT_COUNTER_{NAME} to 0.
# ---------------------------------------------------------------------------
counter_reset() {
  _cname="$1"
  eval "BKIT_COUNTER_${_cname}=0"
}

# ---------------------------------------------------------------------------
# check_max NAME VALUE MAX
# Returns exit 0 (continue) when VALUE <= MAX; exit 1 when VALUE > MAX.
# Prints "[bkit-telemetry] counter NAME exceeded MAX_*=MAX (value=VALUE)" on overflow.
# ---------------------------------------------------------------------------
check_max() {
  _cname="$1"
  _val="$2"
  _max="$3"
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
# ---------------------------------------------------------------------------
decide_next() {
  _cname="$1"
  _val="$2"
  _max="$3"
  _cont="$4"
  _excd="$5"
  if [ "$_val" -gt "$_max" ]; then
    echo "[bkit-telemetry] counter ${_cname} exceeded max=${_max} (value=${_val})" >&2
    printf '%s\n' "$_excd"
    return 1
  fi
  printf '%s\n' "$_cont"
  return 0
}
