#!/usr/bin/env bats
# tests/fixtures/gh/smoke.bats — fixtures/gh stub-harness smoke test (#384 SP1 T2).
#
# Proves the PATH-shimmed `gh` (tests/fixtures/gh/bin/gh) dispatches argv → JSON
# fixture deterministically. This is the foundation bkit-ship-gate.sh will rest on
# (tests/ship-gate.bats). Run: bats tests/fixtures/gh/smoke.bats

GH_FIXTURE_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")" && pwd)"

setup() {
  export PATH="$GH_FIXTURE_ROOT/bin:$PATH"
}

@test "stub: gh api runs?head_sha=green-capstone returns the captured workflow_runs list" {
  run gh api "/repos/example/example/actions/workflows/ci.yml/runs?head_sha=green-capstone"
  [ "$status" -eq 0 ]
  echo "$output" | jq -e '.workflow_runs[0].id == 1001 and .workflow_runs[0].conclusion == "success"'
}

@test "stub: gh api runs/<id>/jobs returns the captured jobs list, --paginate is accepted" {
  run gh api "/repos/example/example/actions/runs/1001/jobs" --paginate
  [ "$status" -eq 0 ]
  echo "$output" | jq -e '[.jobs[] | select(.name == "bkit-tests-check")] | length == 1'
}

@test "stub: gh api runs?head_sha=<unknown> returns total_count 0 (CONFLICTING / no-run shape)" {
  run gh api "/repos/example/example/actions/workflows/ci.yml/runs?head_sha=totally-unknown-sha"
  [ "$status" -eq 0 ]
  echo "$output" | jq -e '.total_count == 0 and (.workflow_runs | length) == 0'
}

@test "stub: BKIT_FAKE_GH_API_ERROR=1 — every api call exits 1 with stderr (code-20 path)" {
  run env BKIT_FAKE_GH_API_ERROR=1 gh api "/repos/example/example/actions/workflows/ci.yml/runs?head_sha=green-capstone"
  [ "$status" -eq 1 ]
  [[ "$output" == *"fake API error"* ]]
}

@test "stub: gh api rate_limit returns the requested fixture state (BKIT_FAKE_RATELIMIT_STATE)" {
  run env BKIT_FAKE_RATELIMIT_STATE=exhausted gh api rate_limit
  [ "$status" -eq 0 ]
  echo "$output" | jq -e '.rate.remaining == 0'
}

@test "stub: non-api argv exits 1 (loud on unmocked boundary, per FAKE_BIN/gh precedent)" {
  run gh auth status
  [ "$status" -ne 0 ]
}

@test "stub: BKIT_FAKE_RATELIMITED=1 — run-list query fails with rate-limit stderr BUT rate_limit still answers" {
  run env BKIT_FAKE_RATELIMITED=1 gh api "/repos/example/example/actions/workflows/ci.yml/runs?head_sha=green-capstone"
  [ "$status" -eq 1 ]
  [[ "$output" == *"HTTP 403 rate limit exceeded"* ]]
  # The gate samples rate_limit AFTER the run-list fails — must still answer.
  # Tests pair BKIT_FAKE_RATELIMITED=1 with BKIT_FAKE_RATELIMIT_STATE=exhausted
  # so the gate sees a coherent exhausted rate_limit alongside the 403.
  run env BKIT_FAKE_RATELIMITED=1 BKIT_FAKE_RATELIMIT_STATE=exhausted gh api rate_limit
  [ "$status" -eq 0 ]
  echo "$output" | jq -e '.rate.remaining == 0'
}
