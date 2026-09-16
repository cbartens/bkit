#!/usr/bin/env bats
# roadmap-cadence.bats — #380 Sub-plan 2 Task 10, Derived Test Matrix row 14.
#
# Boundary: real jq + real fs — no mocks. Sources the shipped template copy
# directly (mirrors tests/roadmap-fold.bats's REPO_ROOT convention). Exercises
# the discrete, sourceable `bkit_roadmap_cadence_eval` shell/jq expression —
# never inline orchestrator prose.
#
# All fixture `ts` values are offsets from a real "now" epoch-ms baseline
# (never small literals like 1/2/3) — the staleness-days comparison is
# computed against the REAL current time, so a fixture row stamped at epoch
# ms `1` would look catastrophically stale and make every row-count assertion
# false-positive on the staleness branch instead of the build-cycles branch.

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
CADENCE_SH="${BKIT_ROADMAP_CADENCE_SH:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-roadmap-cadence.sh}"

setup() {
  TMPD="$(mktemp -d)"
  ROADMAP="$TMPD/roadmap.jsonl"
  STATS="$TMPD/stats.jsonl"
  : >"$ROADMAP"
  : >"$STATS"
  NOW_MS=$(($(date -u +%s) * 1000))
}

teardown() {
  rm -rf "$TMPD"
}

row() {
  # row TS KEY STATUS
  printf '{"ts":%s,"kind":"feature","key":"%s","status":"%s"}\n' "$1" "$2" "$3"
}

fire_row() {
  # fire_row TS COUNT
  printf '{"ts":%s,"kind":"counter","counterName":"ROADMAP_CADENCE_FIRE","counterValue":%s,"counterSource":"shell-bus"}\n' "$1" "$2"
}

@test "fires at the 10th distinct BUILT FID (default buildCycles=10)" {
  for i in $(seq 1 9); do
    row "$((NOW_MS + i))" "fid-$i" "BUILT" >>"$ROADMAP"
  done
  run bash -c ". '$CADENCE_SH'; bkit_roadmap_cadence_eval '$ROADMAP' '$STATS' 10 90"
  [ "$status" -eq 0 ]
  [[ "$output" == SKIP\ 9 ]]

  row "$((NOW_MS + 10))" "fid-10" "BUILT" >>"$ROADMAP"
  run bash -c ". '$CADENCE_SH'; bkit_roadmap_cadence_eval '$ROADMAP' '$STATS' 10 90"
  [ "$status" -eq 0 ]
  [[ "$output" == FIRE\ 10 ]]
}

@test "repeat BUILT rows for ONE FID do not advance the count (dedup by key)" {
  for i in $(seq 1 15); do
    row "$((NOW_MS + i))" "fid-1" "BUILT" >>"$ROADMAP"
  done
  run bash -c ". '$CADENCE_SH'; bkit_roadmap_cadence_eval '$ROADMAP' '$STATS' 10 90"
  [ "$status" -eq 0 ]
  [[ "$output" == SKIP\ 1 ]]
}

@test "staleness fallback fires from an old fire row even below the build-cycle threshold" {
  OLD_FIRE_MS=$((NOW_MS - (200 * 86400 * 1000)))
  fire_row "$OLD_FIRE_MS" "0" >>"$STATS"
  row "$((OLD_FIRE_MS + 1000))" "fid-only" "BUILT" >>"$ROADMAP"
  run bash -c ". '$CADENCE_SH'; bkit_roadmap_cadence_eval '$ROADMAP' '$STATS' 10 90"
  [ "$status" -eq 0 ]
  [[ "$output" == FIRE\ 1 ]]
}

@test "firing rebaselines: a 25-FID gap yields exactly one fire (count resets after the fresh FIRE row)" {
  for i in $(seq 1 25); do
    row "$((NOW_MS + i))" "fid-$i" "BUILT" >>"$ROADMAP"
  done
  run bash -c ". '$CADENCE_SH'; bkit_roadmap_cadence_eval '$ROADMAP' '$STATS' 10 90"
  [ "$status" -eq 0 ]
  [[ "$output" == FIRE\ 25 ]]

  # Simulate the caller appending the FIRE row (rebaseline) at "now" — the
  # fresh fire row's ts is AFTER every BUILT row above.
  fire_row "$((NOW_MS + 100))" "25" >>"$STATS"

  # No new BUILT rows since the fire: must SKIP with count 0, never refire on
  # the stale 25 from before rebaselining.
  run bash -c ". '$CADENCE_SH'; bkit_roadmap_cadence_eval '$ROADMAP' '$STATS' 10 90"
  [ "$status" -eq 0 ]
  [[ "$output" == SKIP\ 0 ]]
}

@test "absent bkit.roadmap keys fall back to the 10/90 defaults" {
  for i in $(seq 1 10); do
    row "$((NOW_MS + i))" "fid-$i" "BUILT" >>"$ROADMAP"
  done
  # Empty-string thresholds simulate a jq `// 10` read that resolved to
  # nothing (absent bkit.roadmap.* key) — the evaluator must still apply the
  # 10/90 defaults, not treat the empty string as a literal.
  run bash -c ". '$CADENCE_SH'; bkit_roadmap_cadence_eval '$ROADMAP' '$STATS' '' ''"
  [ "$status" -eq 0 ]
  [[ "$output" == FIRE\ 10 ]]
}

@test "fail-open: absent roadmap.jsonl and stats.jsonl resolve to SKIP 0 on a fresh install, never a non-zero exit" {
  run bash -c ". '$CADENCE_SH'; bkit_roadmap_cadence_eval '$TMPD/missing.jsonl' '$TMPD/missing-stats.jsonl' 10 90"
  [ "$status" -eq 0 ]
  [[ "$output" == SKIP\ 0 ]]
}
