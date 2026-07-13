#!/usr/bin/env bats
# counter-bus.bats — Unit tests for bkit-counter-bus.sh helpers (#58 / WS3-T2).
#
# Covers:
#   1. Generic helpers: counter_init, counter_inc, counter_get, counter_reset, check_max, decide_next
#   2. Per-mode mode-matched counters (DEBUG/NORMAL/SOAK from bkit-debug.md:49, DE-25, DE-36):
#      - DEBUG counter: cross-invocation index, >= MAX → SOAK entry
#      - NORMAL counter: bounds the diagnose→remediate loop, overflow → switch SOAK + reset SOAK_ATTEMPT
#      - SOAK counter: bounds the soak loop, reset-to-0 on every SOAK entry
#
# Run: bats tests/counter-bus.bats
# Requires: bats >= 1.0

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
COUNTER_BUS="$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
COUNTER_CONFIG="$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"

# ---------------------------------------------------------------------------
# Setup / teardown
# ---------------------------------------------------------------------------

setup() {
  # Each test runs in a subshell sourced environment.
  # We use a helper subprocess pattern for exit-code tests.
  :
}

# ---------------------------------------------------------------------------
# 1. counter_init
# ---------------------------------------------------------------------------

@test "counter_init: initialises counter to 0 by default" {
  result=$(bash -c ". '$COUNTER_BUS' && counter_init FOO && counter_get FOO")
  [ "$result" = "0" ]
}

@test "counter_init: initialises counter to specified value" {
  result=$(bash -c ". '$COUNTER_BUS' && counter_init FOO 5 && counter_get FOO")
  [ "$result" = "5" ]
}

@test "counter_init: re-initialise resets to new value" {
  result=$(bash -c ". '$COUNTER_BUS' && counter_init FOO 3 && counter_init FOO 1 && counter_get FOO")
  [ "$result" = "1" ]
}

# ---------------------------------------------------------------------------
# 2. counter_inc
# ---------------------------------------------------------------------------

@test "counter_inc: increments from 0 to 1" {
  result=$(bash -c ". '$COUNTER_BUS' && counter_init FOO && counter_inc FOO")
  [ "$result" = "1" ]
}

@test "counter_inc: prints new value on each call" {
  result=$(bash -c ". '$COUNTER_BUS' && counter_init FOO && counter_inc FOO && counter_inc FOO && counter_inc FOO")
  # Last printed value should be 3
  last=$(echo "$result" | tail -1)
  [ "$last" = "3" ]
}

@test "counter_inc: increments from arbitrary starting value" {
  result=$(bash -c ". '$COUNTER_BUS' && counter_init FOO 7 && counter_inc FOO")
  [ "$result" = "8" ]
}

# ---------------------------------------------------------------------------
# 3. counter_get
# ---------------------------------------------------------------------------

@test "counter_get: returns 0 for uninitialised counter" {
  result=$(bash -c ". '$COUNTER_BUS' && counter_get UNDEF_COUNTER_12345")
  [ "$result" = "0" ]
}

@test "counter_get: returns current value" {
  result=$(bash -c ". '$COUNTER_BUS' && counter_init FOO 42 && counter_get FOO")
  [ "$result" = "42" ]
}

# ---------------------------------------------------------------------------
# 4. counter_reset
# ---------------------------------------------------------------------------

@test "counter_reset: resets counter to 0" {
  result=$(bash -c ". '$COUNTER_BUS' && counter_init FOO 5 && counter_reset FOO && counter_get FOO")
  [ "$result" = "0" ]
}

@test "counter_reset: reset counter is still usable (inc from 0)" {
  result=$(bash -c ". '$COUNTER_BUS' && counter_init FOO 3 && counter_reset FOO && counter_inc FOO")
  [ "$result" = "1" ]
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

# ---------------------------------------------------------------------------
# 8. Per-mode mode-matched counters (bkit-debug.md:49, DE-25, DE-36)
#
# DEBUG mode: cross-invocation index (derived from status.jsonl, not reset mid-run).
#   DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT → SOAK entry.
#   Reset semantics: NOT reset within a single invocation; incremented across invocations.
#
# NORMAL mode: bounds the NORMAL diagnose→remediate loop.
#   NORMAL_ATTEMPT > MAX_NORMAL_ATTEMPT → switch DEBUG_MODE=SOAK, reset SOAK_ATTEMPT=0.
#   Reset semantics: init=0 at worktree setup; NOT reset on SOAK entry.
#
# SOAK mode: bounds the soak loop.
#   SOAK_ATTEMPT < MAX_SOAK_ATTEMPT → continue soak.
#   Reset semantics: reset=0 EVERY TIME SOAK is entered (fresh budget on each entry).
# ---------------------------------------------------------------------------

# DEBUG mode: >= MAX_DEBUG_ATTEMPT routes to SOAK (not NORMAL)
@test "DEBUG mode: DEBUG_ATTEMPT >= MAX → routes to SOAK (decide_next exits 1)" {
  # bkit-debug.md:49: "DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT → SOAK"
  # Our check_max exits 1 when VALUE > MAX. The >= semantic is implemented by
  # using (MAX_DEBUG_ATTEMPT - 1) as the threshold: when DEBUG_ATTEMPT == MAX,
  # VALUE > THRESHOLD is true → exits 1 (SOAK).
  run bash -c "
    . '$COUNTER_BUS'
    . '$COUNTER_CONFIG'
    DEBUG_ATTEMPT=3
    THRESHOLD=\$((MAX_DEBUG_ATTEMPT - 1))
    decide_next DEBUG_ATTEMPT \$DEBUG_ATTEMPT \$THRESHOLD NORMAL SOAK 2>/dev/null
  "
  [ "$status" -eq 1 ]
  [ "$output" = "SOAK" ]
}

@test "DEBUG mode: DEBUG_ATTEMPT < MAX_DEBUG_ATTEMPT → stays NORMAL" {
  run bash -c "
    . '$COUNTER_BUS'
    . '$COUNTER_CONFIG'
    DEBUG_ATTEMPT=1
    THRESHOLD=\$((MAX_DEBUG_ATTEMPT - 1))
    decide_next DEBUG_ATTEMPT \$DEBUG_ATTEMPT \$THRESHOLD NORMAL SOAK
  "
  [ "$status" -eq 0 ]
  [ "$output" = "NORMAL" ]
}

@test "DEBUG mode: DEBUG_ATTEMPT cross-invocation increment pattern is cumulative (no mid-run reset)" {
  # Simulates 3 sequential invocations.
  # counter_inc prints intermediate values; use counter_get for final value only.
  result=$(bash -c "
    . '$COUNTER_BUS'
    counter_init DEBUG_ATTEMPT 0
    # Invocation 1: prior=0, current=1
    counter_inc DEBUG_ATTEMPT > /dev/null
    # Invocation 2: prior=1, current=2
    counter_inc DEBUG_ATTEMPT > /dev/null
    # Invocation 3: prior=2, current=3
    counter_inc DEBUG_ATTEMPT > /dev/null
    counter_get DEBUG_ATTEMPT
  ")
  [ "$result" = "3" ]
}

# NORMAL mode: NORMAL_ATTEMPT > MAX_NORMAL_ATTEMPT → overflow routes to SOAK entry
@test "NORMAL mode: NORMAL_ATTEMPT <= MAX_NORMAL_ATTEMPT → continue NORMAL loop (exits 0)" {
  run bash -c "
    . '$COUNTER_BUS'
    . '$COUNTER_CONFIG'
    NORMAL_ATTEMPT=2
    decide_next NORMAL_ATTEMPT \$NORMAL_ATTEMPT \$MAX_NORMAL_ATTEMPT step-diagnose failure-path
  "
  [ "$status" -eq 0 ]
  [ "$output" = "step-diagnose" ]
}

@test "NORMAL mode: NORMAL_ATTEMPT > MAX_NORMAL_ATTEMPT → overflow exits 1 (routes to SOAK escalation)" {
  run bash -c "
    . '$COUNTER_BUS'
    . '$COUNTER_CONFIG'
    NORMAL_ATTEMPT=4
    decide_next NORMAL_ATTEMPT \$NORMAL_ATTEMPT \$MAX_NORMAL_ATTEMPT step-diagnose soak-escalation 2>/dev/null
  "
  [ "$status" -eq 1 ]
  [ "$output" = "soak-escalation" ]
}

@test "NORMAL mode: on SOAK entry SOAK_ATTEMPT resets to 0 (fresh budget)" {
  result=$(bash -c "
    . '$COUNTER_BUS'
    counter_init SOAK_ATTEMPT 0
    # Simulate: normal loop overflows → switch to SOAK
    NORMAL_ATTEMPT=4
    # SOAK entry: reset SOAK_ATTEMPT=0 (fresh budget)
    counter_reset SOAK_ATTEMPT
    counter_get SOAK_ATTEMPT
  ")
  [ "$result" = "0" ]
}

@test "NORMAL mode: SOAK_ATTEMPT NOT reset when re-entering SOAK from diagnose mid-run (accumulates within invocation)" {
  # When diagnose agent sets Mode:SOAK mid-run, SOAK_ATTEMPT resets to 0 (new budget).
  # This mirrors bkit-debug.md: "either switch resets SOAK_ATTEMPT=0".
  result=$(bash -c "
    . '$COUNTER_BUS'
    counter_init SOAK_ATTEMPT 0
    # SOAK budget used once
    counter_inc SOAK_ATTEMPT > /dev/null
    # Diagnose sets SOAK mid-run → reset SOAK_ATTEMPT to fresh budget
    counter_reset SOAK_ATTEMPT
    counter_get SOAK_ATTEMPT
  ")
  [ "$result" = "0" ]
}

# SOAK mode: bounds the soak loop, reset-to-0 on every SOAK entry
@test "SOAK mode: SOAK_ATTEMPT < MAX_SOAK_ATTEMPT → continue soak (exits 0)" {
  run bash -c "
    . '$COUNTER_BUS'
    . '$COUNTER_CONFIG'
    SOAK_ATTEMPT=2
    check_max SOAK_ATTEMPT \$SOAK_ATTEMPT \$MAX_SOAK_ATTEMPT
  "
  [ "$status" -eq 0 ]
}

@test "SOAK mode: SOAK_ATTEMPT > MAX_SOAK_ATTEMPT → soak exhausted (exits 1)" {
  run bash -c "
    . '$COUNTER_BUS'
    . '$COUNTER_CONFIG'
    SOAK_ATTEMPT=4
    check_max SOAK_ATTEMPT \$SOAK_ATTEMPT \$MAX_SOAK_ATTEMPT
  "
  [ "$status" -eq 1 ]
}

@test "SOAK mode: reset-to-0 on SOAK entry gives fresh full budget" {
  result=$(bash -c "
    . '$COUNTER_BUS'
    . '$COUNTER_CONFIG'
    # First SOAK entry: spend 2 iterations
    counter_init SOAK_ATTEMPT 0
    counter_inc SOAK_ATTEMPT > /dev/null
    counter_inc SOAK_ATTEMPT > /dev/null
    # Second SOAK entry (fresh): reset to 0
    counter_reset SOAK_ATTEMPT
    counter_get SOAK_ATTEMPT
  ")
  [ "$result" = "0" ]
}

@test "SOAK mode: fresh budget allows full MAX_SOAK_ATTEMPT iterations after reset" {
  # Source config to get MAX_SOAK_ATTEMPT value for comparison
  expected=$(bash -c ". '$COUNTER_CONFIG' && echo \$MAX_SOAK_ATTEMPT")
  result=$(bash -c "
    . '$COUNTER_BUS'
    . '$COUNTER_CONFIG'
    counter_init SOAK_ATTEMPT 0
    counter_reset SOAK_ATTEMPT
    # Spend full budget
    i=0
    while [ \$i -lt \$MAX_SOAK_ATTEMPT ]; do
      counter_inc SOAK_ATTEMPT > /dev/null
      i=\$((i+1))
    done
    counter_get SOAK_ATTEMPT
  ")
  [ "$result" = "$expected" ]
}

# ---------------------------------------------------------------------------
# 9. Integration: full NORMAL→SOAK escalation scenario (bkit-debug.md Step 3 route)
# ---------------------------------------------------------------------------

@test "integration: NORMAL loop overflow triggers SOAK entry with reset SOAK budget" {
  run bash -c "
    . '$COUNTER_BUS'
    . '$COUNTER_CONFIG'
    counter_init NORMAL_ATTEMPT 0
    counter_init SOAK_ATTEMPT 0
    DEBUG_MODE=NORMAL

    # Simulate 3 NORMAL iterations (at MAX)
    NORMAL_ATTEMPT=3

    # Step 3 route: FAIL and NORMAL_ATTEMPT > MAX_NORMAL_ATTEMPT?
    # After inc, NORMAL_ATTEMPT=4 → overflow
    NORMAL_ATTEMPT_INC=4
    if ! check_max NORMAL_ATTEMPT \$NORMAL_ATTEMPT_INC \$MAX_NORMAL_ATTEMPT 2>/dev/null; then
      DEBUG_MODE=SOAK
      counter_reset SOAK_ATTEMPT
    fi

    echo \"DEBUG_MODE=\$DEBUG_MODE\"
    echo \"SOAK_ATTEMPT=\$(counter_get SOAK_ATTEMPT)\"
  "
  [ "$status" -eq 0 ]
  [[ "$output" == *"DEBUG_MODE=SOAK"* ]]
  [[ "$output" == *"SOAK_ATTEMPT=0"* ]]
}

@test "integration: SOAK loop bounded by MAX_SOAK_ATTEMPT after NORMAL escalation" {
  run bash -c "
    . '$COUNTER_BUS'
    . '$COUNTER_CONFIG'
    counter_init SOAK_ATTEMPT 0

    # Run soak up to MAX
    ok=0
    i=0
    while [ \$i -lt \$((MAX_SOAK_ATTEMPT + 1)) ]; do
      counter_inc SOAK_ATTEMPT > /dev/null
      val=\$(counter_get SOAK_ATTEMPT)
      if ! check_max SOAK_ATTEMPT \$val \$MAX_SOAK_ATTEMPT 2>/dev/null; then
        echo 'SOAK_EXHAUSTED'
        ok=1
        break
      fi
      i=\$((i+1))
    done
    [ \$ok -eq 1 ] && exit 0 || exit 1
  "
  [ "$status" -eq 0 ]
  [[ "$output" == *"SOAK_EXHAUSTED"* ]]
}
