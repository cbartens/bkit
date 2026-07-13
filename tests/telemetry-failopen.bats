#!/usr/bin/env bats
# telemetry-failopen.bats — Boundary test: shell exit codes for telemetry append failure.
#
# Forces the telemetry-append failure path (write to a read-only/non-existent path)
# and asserts shell exit 0 — locked SC #2 from bkit-telemetry design spec.
#
# Tests the EXACT idiom used in workflow files:
#   jq -nc '...' >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"
#
# Run: bats tests/telemetry-failopen.bats

setup() {
  TMPDIR_LOCAL=$(mktemp -d)
  export TMPDIR_LOCAL
}

teardown() {
  rm -rf "$TMPDIR_LOCAL"
}

@test "best-effort append: jq success writes to file and exits 0" {
  FILE="$TMPDIR_LOCAL/stats.jsonl"
  # Run the exact idiom from the workflow
  jq -nc \
    --arg repo "test/repo" \
    --arg bkitVersion "1.0.0" \
    --arg step "test-step" \
    --arg counterName "TEST_ATTEMPT" \
    --argjson counterValue 1 \
    --arg counterSource "model-self-report" \
    --arg parentSha "abc123" \
    '. | .ts = (now*1000|floor) | .kind = "counter" | .workflow = "test" | .repo = $repo | .bkitVersion = $bkitVersion | .step = $step | .counterName = $counterName | .counterValue = $counterValue | .counterSource = $counterSource | .parentSha = $parentSha' \
    >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"
  # Exit code must be 0 (bats fails the test if the command exits non-zero)
  [ -f "$FILE" ]
  # File must contain a valid JSON line
  jq -e '.kind == "counter"' "$FILE"
}

@test "best-effort append: write to read-only directory exits 0 (fail-open)" {
  # Create a read-only directory to force write failure
  RODIR="$TMPDIR_LOCAL/readonly"
  mkdir -p "$RODIR"
  chmod 555 "$RODIR"
  FILE="$RODIR/stats.jsonl"
  # Run the best-effort idiom — must NOT exit non-zero even on failure
  OUTPUT=$(jq -nc \
    --arg repo "test/repo" \
    --arg bkitVersion "1.0.0" \
    --arg step "test-step" \
    --arg counterName "TEST_ATTEMPT" \
    --argjson counterValue 1 \
    --arg counterSource "model-self-report" \
    --arg parentSha "abc123" \
    '. | .ts = (now*1000|floor) | .kind = "counter" | .workflow = "test" | .repo = $repo | .bkitVersion = $bkitVersion | .step = $step | .counterName = $counterName | .counterValue = $counterValue | .counterSource = $counterSource | .parentSha = $parentSha' \
    >> "$FILE" 2>/dev/null || echo "[bkit-telemetry] append failed: $FILE")
  # Exit must be 0 — the || echo catches the failure and echoes, returning 0
  [ $? -eq 0 ]
  # The fallback message must appear in output
  echo "$OUTPUT" | grep -q "\[bkit-telemetry\] append failed"
}

@test "best-effort append: non-existent parent directory exits 0 (fail-open)" {
  FILE="$TMPDIR_LOCAL/nonexistent/nested/stats.jsonl"
  OUTPUT=$(jq -nc \
    --arg repo "test/repo" \
    --arg bkitVersion "1.0.0" \
    --arg step "test-step" \
    --arg counterName "TEST_ATTEMPT" \
    --argjson counterValue 1 \
    --arg counterSource "model-self-report" \
    --arg parentSha "abc123" \
    '. | .ts = (now*1000|floor) | .kind = "counter" | .workflow = "test" | .repo = $repo | .bkitVersion = $bkitVersion | .step = $step | .counterName = $counterName | .counterValue = $counterValue | .counterSource = $counterSource | .parentSha = $parentSha' \
    >> "$FILE" 2>/dev/null || echo "[bkit-telemetry] append failed: $FILE")
  [ $? -eq 0 ]
  echo "$OUTPUT" | grep -q "\[bkit-telemetry\] append failed"
}

@test "portable ms ts: now*1000|floor produces a number >= 1000000000000" {
  # Validate that the portable jq ms timestamp is in the expected range (>= year 2001 in ms)
  TS=$(jq -nc '(now*1000|floor)')
  [ "$TS" -ge 1000000000000 ]
}

@test "SC #4 — comply grader-unavailable path: || echo guard exits 0 when pnpm bkit comply unavailable" {
  # Simulate grader unavailable: call a non-existent binary.
  # The || echo idiom from the wired close gate MUST guarantee exit 0.
  OUTPUT=$(nonexistent_bkit_comply_binary --phase ship 2>/dev/null || echo "[bkit-comply] grader unavailable, skipping")
  [ $? -eq 0 ]
  echo "$OUTPUT" | grep -q "\[bkit-comply\] grader unavailable"
}

@test "SC #4 — comply || echo guard exits 0 when command fails with exit 1" {
  # Use `false` as a stand-in for a grader that exits 1.
  OUTPUT=$(false || echo "[bkit-comply] grader unavailable, skipping")
  [ $? -eq 0 ]
  echo "$OUTPUT" | grep -q "\[bkit-comply\] grader unavailable"
}

@test "outcome append: all required size fields present in emitted row" {
  FILE="$TMPDIR_LOCAL/stats.jsonl"
  jq -nc \
    --arg repo "test/repo" \
    --arg bkitVersion "1.0.0" \
    --arg step "ship-close-workflow" \
    --argjson prNumber 42 \
    --argjson lines_added 100 \
    --argjson lines_deleted 20 \
    --argjson lines_changed 120 \
    --argjson files_changed 5 \
    --argjson task_count 9 \
    --argjson duration_seconds 3600 \
    --argjson deferrals 1 \
    --argjson failures 0 \
    '. | .ts = (now*1000|floor) | .kind = "outcome" | .workflow = "ship" | .repo = $repo | .bkitVersion = $bkitVersion | .step = $step | .prNumber = $prNumber | .lines_added = $lines_added | .lines_deleted = $lines_deleted | .lines_changed = $lines_changed | .files_changed = $files_changed | .task_count = $task_count | .duration_seconds = $duration_seconds | .deferrals = $deferrals | .failures = $failures' \
    >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"
  [ -f "$FILE" ]
  # Validate all fields present
  jq -e '.kind == "outcome" and .lines_added == 100 and .lines_deleted == 20 and .lines_changed == 120 and .files_changed == 5 and .task_count == 9 and .duration_seconds == 3600 and .deferrals == 1 and .failures == 0' "$FILE"
}
