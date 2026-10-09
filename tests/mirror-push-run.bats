#!/usr/bin/env bats
# tests/mirror-push-run.bats — bkit-mirror-push-run.sh: a release PR's capstone copies the
# `dev` push run's verdict. Every case below is one that must RED, plus the two green paths.
#
# Waiting logic runs against a scripted gate (BKIT_MIRROR_GATE_SH) that replays one exit
# code per call from $SEQ, so polling is tested without a clock. The end-to-end cases run
# the real bkit-ship-gate.sh against the tests/fixtures/gh `gh` stub.
#
# Run: bats tests/mirror-push-run.bats

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
MIRROR_SH="${BKIT_MIRROR_PUSH_RUN_SH:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-mirror-push-run.sh}"
GH_FIXTURE_ROOT="$REPO_ROOT/tests/fixtures/gh"

setup() {
  WORK="$(mktemp -d)"
  export SEQ="$WORK/seq"
  export CALLS="$WORK/calls"
  FAKE_GATE="$WORK/fake-gate.sh"
  cat >"$FAKE_GATE" <<'EOF'
#!/usr/bin/env bash
# Records its argv + override env, then exits with the next code in $SEQ.
printf '%s|override=%s\n' "$*" "${BKIT_SHIP_GATE_OVERRIDE:-}" >>"$CALLS"
code=$(head -n 1 "$SEQ")
tail -n +2 "$SEQ" >"$SEQ.next" && mv "$SEQ.next" "$SEQ"
echo "[bkit-ship-gate] fake gate exit $code" >&2
exit "${code:-99}"
EOF
  chmod +x "$FAKE_GATE"
}

teardown() {
  rm -rf "$WORK"
}

# Run the mirror against the scripted gate; remaining args go to the script.
run_mirror() {
  run env BKIT_MIRROR_GATE_SH="$FAKE_GATE" bash "$MIRROR_SH" --head abc123 --repo example/example --interval 0 "$@"
}

codes() { printf '%s\n' "$@" >"$SEQ"; }

@test "green push run capstone -> exit 0" {
  codes 0
  run_mirror
  [ "$status" -eq 0 ]
  [[ "$output" == *"passed its capstone"* ]]
}

@test "asks the gate for the push run on dev at the PR head" {
  codes 0
  run_mirror
  [ "$status" -eq 0 ]
  grep -q -- "assert --head abc123 --branch dev --event push --repo example/example" "$CALLS"
}

@test "waits through in-progress polls, then mirrors green" {
  codes 11 11 11 0
  run_mirror
  [ "$status" -eq 0 ]
  [ "$(wc -l <"$CALLS")" -eq 4 ]
}

@test "waits through in-progress polls, then mirrors red (exit 1)" {
  codes 11 11 12
  run_mirror
  [ "$status" -eq 1 ]
  [[ "$output" == *"not green (gate exit 12)"* ]]
}

@test "red push run -> exit 1 with the gate's reason" {
  codes 12
  run_mirror
  [ "$status" -eq 1 ]
  [[ "$output" == *"fake gate exit 12"* ]]
}

@test "cancelled push run -> exit 1" {
  codes 15
  run_mirror
  [ "$status" -eq 1 ]
}

@test "capstone absent from the push run -> exit 1" {
  codes 13
  run_mirror
  [ "$status" -eq 1 ]
}

@test "required lane skipped in the push run -> exit 1" {
  codes 16
  run_mirror
  [ "$status" -eq 1 ]
}

@test "unknown gate exit -> exit 1 (never a pass)" {
  codes 7
  run_mirror
  [ "$status" -eq 1 ]
}

@test "no push run past the absent window -> exit 3 naming [skip ci]" {
  codes 10
  run_mirror --absent-minutes 0
  [ "$status" -eq 3 ]
  [[ "$output" == *"[skip ci]"* ]]
}

@test "superseded-head answer (14) counts as absent, not green" {
  codes 14
  run_mirror --absent-minutes 0
  [ "$status" -eq 3 ]
}

@test "no push run yet inside the absent window keeps waiting" {
  codes 10 10 0
  run_mirror --absent-minutes 10
  [ "$status" -eq 0 ]
  [ "$(wc -l <"$CALLS")" -eq 3 ]
}

@test "still in progress at --max-minutes -> exit 4" {
  codes 11
  run_mirror --max-minutes 0
  [ "$status" -eq 4 ]
  [[ "$output" == *"still not finished"* ]]
}

@test "two API errors are retried; the third in a row -> exit 20" {
  codes 20 20 0
  run_mirror
  [ "$status" -eq 0 ]
  codes 20 20 20
  run_mirror
  [ "$status" -eq 20 ]
}

@test "BKIT_SHIP_GATE_OVERRIDE never reaches the gate" {
  codes 0
  run env BKIT_SHIP_GATE_OVERRIDE=abc123 BKIT_MIRROR_GATE_SH="$FAKE_GATE" bash "$MIRROR_SH" --head abc123 --interval 0
  [ "$status" -eq 0 ]
  grep -q "override=$" "$CALLS"
}

@test "usage: missing --head or a non-numeric minute value exits 2" {
  run env BKIT_MIRROR_GATE_SH="$FAKE_GATE" bash "$MIRROR_SH"
  [ "$status" -eq 2 ]
  run env BKIT_MIRROR_GATE_SH="$FAKE_GATE" bash "$MIRROR_SH" --head abc123 --max-minutes soon
  [ "$status" -eq 2 ]
}

# ---------------------------------------------------------------------------
# End to end — the real bkit-ship-gate.sh behind the gh fixture stub
# ---------------------------------------------------------------------------

@test "e2e: green push run beside the PR's own in-flight run -> exit 0" {
  run env PATH="$GH_FIXTURE_ROOT/bin:$PATH" bash "$MIRROR_SH" --head release-push-green --repo example/example --interval 0
  [ "$status" -eq 0 ]
}

@test "e2e: red push run is not masked by a newer green PR run -> exit 1" {
  run env PATH="$GH_FIXTURE_ROOT/bin:$PATH" bash "$MIRROR_SH" --head release-push-red-pr-green --repo example/example --interval 0
  [ "$status" -eq 1 ]
  [[ "$output" == *"FAILURE"* ]]
}

@test "e2e: only the PR's own run exists -> absent, not in progress (exit 3)" {
  run env PATH="$GH_FIXTURE_ROOT/bin:$PATH" bash "$MIRROR_SH" --head release-pr-only --repo example/example --interval 0 --absent-minutes 0
  [ "$status" -eq 3 ]
}
