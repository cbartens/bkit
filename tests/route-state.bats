#!/usr/bin/env bats
# route-state.bats — Cross-process routing-state helpers (#58 follow-up P0–P2).
#
# Every value under test crosses bash -c boundaries only via status.jsonl.
# Run: bats tests/route-state.bats

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
STATUS_FOLD_SH="${BKIT_STATUS_FOLD_SH:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-status-fold.sh}"
STATUS_ROUTE="${BKIT_STATUS_ROUTE:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-status-route.sh}"

setup() {
  TMPD="$(mktemp -d)"
  STATUS="$TMPD/status.jsonl"
}

teardown() {
  rm -rf "$TMPD"
}

# ---------------------------------------------------------------------------
# P0 — debugMode / pushMode
# ---------------------------------------------------------------------------

@test "P0: route_get_debug_mode reads step.debugMode across processes" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"debug",at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:01:00Z" --arg p "sha1" \
    '{type:"step-done",workflow:"debug",step:"debug-worktree-setup",status:"DONE",at:$t,parentSha:$p,debugMode:"NORMAL",pushMode:"PR"}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_get_debug_mode '$STATUS'"
  [ "$status" -eq 0 ]
  [ "$output" = "NORMAL" ]
}

@test "P0: workflow-meta debugMode wins over stale step NORMAL (cross-process)" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"debug",at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:01:00Z" --arg p "sha1" \
    '{type:"step-done",workflow:"debug",step:"debug-worktree-setup",status:"DONE",at:$t,parentSha:$p,debugMode:"NORMAL",pushMode:"LOCAL"}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_append_debug_mode '$STATUS' SOAK"
  [ "$status" -eq 0 ]

  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_get_debug_mode '$STATUS'"
  [ "$status" -eq 0 ]
  [ "$output" = "SOAK" ]
}

@test "P0: route_get_push_mode PR|LOCAL; missing → exit 2" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"debug",at:$t}' >> "$STATUS"
  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_get_push_mode '$STATUS'"
  [ "$status" -eq 2 ]

  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_append_push_mode '$STATUS' PR"
  [ "$status" -eq 0 ]
  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_get_push_mode '$STATUS'"
  [ "$status" -eq 0 ]
  [ "$output" = "PR" ]
}

@test "P0: invalid debugMode → exit 2" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"debug",at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:01:00Z" \
    '{type:"workflow-meta",workflow:"debug",at:$t,debugMode:"WEIRD"}' >> "$STATUS"
  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_get_debug_mode '$STATUS'"
  [ "$status" -eq 2 ]
  # bats merges stderr into $output — diagnostic expected; must not print a mode token
  [[ "$output" != *NORMAL* && "$output" != *SOAK* ]]
}

# ---------------------------------------------------------------------------
# P1 — last verdict / failures
# ---------------------------------------------------------------------------

@test "P1: route_last_verdict + failures across processes; --sub-plan" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:01:00Z" --arg p "sha1" \
    '{type:"step-done",workflow:"build",step:"build-plan-verify",status:"DONE",verdict:"CONCERNS",failures:2,subPlan:1,attempt:1,at:$t,parentSha:$p}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_last_verdict '$STATUS' build build-plan-verify --sub-plan 1"
  [ "$status" -eq 0 ]
  [ "$output" = "CONCERNS" ]
  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_last_failures '$STATUS' build build-plan-verify --sub-plan 1"
  [ "$status" -eq 0 ]
  [ "$output" = "2" ]
}

@test "P1: active-run isolation — completed run does not leak verdict" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:01:00Z" --arg p "shaA" \
    '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",verdict:"FAIL",failures:3,attempt:1,at:$t,parentSha:$p}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:02:00Z" '{type:"workflow-done",workflow:"build",at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:03:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_last_verdict '$STATUS' build build-run-tests"
  [ "$status" -eq 2 ]
}

@test "P1: failures default 0 when field absent but verdict present" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:01:00Z" --arg p "sha1" \
    '{type:"step-done",workflow:"build",step:"build-summary",status:"DONE",verdict:"PASS",attempt:1,at:$t,parentSha:$p}' >> "$STATUS"
  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_last_failures '$STATUS' build build-summary"
  [ "$status" -eq 0 ]
  [ "$output" = "0" ]
}

# ---------------------------------------------------------------------------
# P2 — strategy ladder
# ---------------------------------------------------------------------------

@test "P2: ladder_next transitions" {
  run bash -c ". '$STATUS_ROUTE'; ladder_next ''"
  [ "$status" -eq 0 ]
  [ "$output" = "STANDARD" ]
  run bash -c ". '$STATUS_ROUTE'; ladder_next STANDARD"
  [ "$status" -eq 0 ]
  [ "$output" = "PIVOT" ]
  run bash -c ". '$STATUS_ROUTE'; ladder_next PIVOT"
  [ "$status" -eq 0 ]
  [ "$output" = "FINAL" ]
  run bash -c ". '$STATUS_ROUTE'; ladder_next FINAL"
  [ "$status" -eq 0 ]
  [ "$output" = "FINAL" ]
  run bash -c ". '$STATUS_ROUTE'; ladder_next NOPE"
  [ "$status" -eq 2 ]
}

@test "P2: route_last_strategy is all-runs (PRIOR_STRATEGY shape)" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:01:00Z" --arg p "shaA" \
    '{type:"step-done",workflow:"build",step:"build-failure-diagnose",status:"DONE",verdict:"FAIL",strategy:"PIVOT",attempt:1,at:$t,parentSha:$p}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:02:00Z" '{type:"workflow-done",workflow:"build",at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:03:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; route_last_strategy '$STATUS' build build-failure-diagnose"
  [ "$status" -eq 0 ]
  [ "$output" = "PIVOT" ]

  run bash -c ". '$STATUS_FOLD_SH'; . '$STATUS_ROUTE'; STRATEGY=\$(ladder_next \"\$(route_last_strategy '$STATUS' build build-failure-diagnose)\"); echo \"\$STRATEGY\""
  [ "$status" -eq 0 ]
  [ "$output" = "FINAL" ]
}
