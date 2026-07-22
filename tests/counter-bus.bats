#!/usr/bin/env bats
# counter-bus.bats — Unit tests for bkit-counter-bus.sh helpers (#58 / WS3-T2).
#
# Covers:
#   1. Generic threshold helpers: check_max, decide_next
#   2. bkit-counter-bus-config.sh MAX_* constants
#
# The four inert BKIT_COUNTER_* persistence primitives (counter_init/inc/
# get/reset) and the integration-style scenarios that exercised them inside
# a single `bash -c` were DELETED at #58 WS-6/T6.2: shell state does not
# survive across orchestrator Bash calls, so those primitives were never
# reachable from a real workflow call site (Defect 2 — the helpers write
# BKIT_COUNTER_{NAME} while every call site reads ${NAME}; the two never
# meet). Derivation-and-fail-closed coverage for the real per-block contract
# lives in tests/counter-derive.bats and tests/counter-failclosed.bats.
#
# Run: bats tests/counter-bus.bats
# Requires: bats >= 1.0

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
# Template-relative by default (#58 T2.0): every code task in this feature
# edits .bkit/templates/.bkit/scripts/, and `bkit install` (which produces
# the installed .bkit/scripts/ mirror) runs exactly ONCE, at T8.3. An
# installed-copy default would make every suite here unrunnable until T8.3.
# The installed copy is exercised only at T8.3's byte-identical diff and
# Manual Step 6's fresh-consumer install.
COUNTER_BUS="${BKIT_COUNTER_BUS:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-counter-bus.sh}"
COUNTER_CONFIG="${BKIT_COUNTER_CONFIG:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-counter-bus-config.sh}"

# ---------------------------------------------------------------------------
# Setup / teardown
# ---------------------------------------------------------------------------

setup() {
  # Each test runs in a subshell sourced environment.
  # We use a helper subprocess pattern for exit-code tests.
  :
}

# ---------------------------------------------------------------------------
# 5. check_max
# ---------------------------------------------------------------------------

@test "check_max: exits 0 when value <= max (equal)" {
  bash -c ". '$COUNTER_BUS' && check_max VERIFY 3 3"
  [ "$?" -eq 0 ]
}

@test "check_max: exits 0 when value < max" {
  bash -c ". '$COUNTER_BUS' && check_max VERIFY 2 3"
  [ "$?" -eq 0 ]
}

@test "check_max: exits 1 when value > max (one over)" {
  bash -c ". '$COUNTER_BUS' && check_max VERIFY 4 3" && false || true
  run bash -c ". '$COUNTER_BUS' && check_max VERIFY 4 3"
  [ "$status" -eq 1 ]
}

@test "check_max: exits 1 when value >> max" {
  run bash -c ". '$COUNTER_BUS' && check_max VERIFY 99 3"
  [ "$status" -eq 1 ]
}

@test "check_max: prints overflow message to stderr when exceeded" {
  run bash -c ". '$COUNTER_BUS' && check_max VERIFY_ATTEMPT 4 3 2>&1"
  [[ "$output" == *"counter VERIFY_ATTEMPT exceeded max=3"* ]]
  [[ "$output" == *"value=4"* ]]
}

@test "check_max: cannot silently continue past MAX (exit 1 enforces)" {
  # The caller MUST handle the exit 1; this test proves exit 1 propagates.
  # Redirect stderr so only stdout (BLOCKED) is in output.
  run bash -c ". '$COUNTER_BUS'; check_max VERIFY_ATTEMPT 4 3 2>/dev/null && echo CONTINUED || echo BLOCKED"
  [ "$output" = "BLOCKED" ]
}

# ---------------------------------------------------------------------------
# 6. decide_next
# ---------------------------------------------------------------------------

@test "decide_next: prints CONTINUE_STEP and exits 0 when value <= max" {
  run bash -c ". '$COUNTER_BUS' && decide_next VERIFY 2 3 step-verify step-fail"
  [ "$status" -eq 0 ]
  [ "$output" = "step-verify" ]
}

@test "decide_next: prints EXCEEDED_STEP and exits 1 when value > max" {
  run bash -c ". '$COUNTER_BUS' && decide_next VERIFY 4 3 step-verify failure-path 2>/dev/null"
  [ "$status" -eq 1 ]
  [ "$output" = "failure-path" ]
}

@test "decide_next: boundary exactly at max — exits 0 (continue)" {
  run bash -c ". '$COUNTER_BUS' && decide_next VERIFY 3 3 step-verify failure-path"
  [ "$status" -eq 0 ]
  [ "$output" = "step-verify" ]
}

# ---------------------------------------------------------------------------
# 7. bkit-counter-bus-config.sh — MAX_* constants are set and positive
# ---------------------------------------------------------------------------

@test "config: MAX_VERIFY_ATTEMPT is set and >= 1" {
  result=$(bash -c ". '$COUNTER_CONFIG' && echo \$MAX_VERIFY_ATTEMPT")
  [ -n "$result" ]
  [ "$result" -ge 1 ]
}

@test "config: MAX_TEST_ATTEMPT is set and >= 1" {
  result=$(bash -c ". '$COUNTER_CONFIG' && echo \$MAX_TEST_ATTEMPT")
  [ -n "$result" ]
  [ "$result" -ge 1 ]
}

@test "config: MAX_DEBUG_ATTEMPT is set and >= 1" {
  result=$(bash -c ". '$COUNTER_CONFIG' && echo \$MAX_DEBUG_ATTEMPT")
  [ -n "$result" ]
  [ "$result" -ge 1 ]
}

@test "config: MAX_NORMAL_ATTEMPT is set and >= 1" {
  result=$(bash -c ". '$COUNTER_CONFIG' && echo \$MAX_NORMAL_ATTEMPT")
  [ -n "$result" ]
  [ "$result" -ge 1 ]
}

@test "config: MAX_SOAK_ATTEMPT is set and >= 1" {
  result=$(bash -c ". '$COUNTER_CONFIG' && echo \$MAX_SOAK_ATTEMPT")
  [ -n "$result" ]
  [ "$result" -ge 1 ]
}

@test "config: MAX_MERGE_ATTEMPT is set and >= 1" {
  result=$(bash -c ". '$COUNTER_CONFIG' && echo \$MAX_MERGE_ATTEMPT")
  [ -n "$result" ]
  [ "$result" -ge 1 ]
}
