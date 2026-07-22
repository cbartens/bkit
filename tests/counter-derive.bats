#!/usr/bin/env bats
# counter-derive.bats — Cross-process derivation tests for #58 (WS-2, sub-plan 1).
#
# Rule obeyed by every test in this file: no counter value may cross from one
# `bash -c` to the next except through status.jsonl on disk. Sequential
# `bash -c` invocations ARE the separate processes the orchestrator actually
# runs in — a single `bash -c` carrying state in a shell variable is the
# banned shape `tests/counter-bus.bats` ships today (that suite exercises the
# helpers, not the cross-process contract).
#
# Run: bats tests/counter-derive.bats
# Requires: bats >= 1.0

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
# Template-relative by default (#58 T2.0) — see tests/counter-bus.bats.
COUNTER_BUS="${BKIT_COUNTER_BUS:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-counter-bus.sh}"
STATUS_FOLD_SH="${BKIT_STATUS_FOLD_SH:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-status-fold.sh}"

setup() {
  TMPD="$(mktemp -d)"
  STATUS="$TMPD/status.jsonl"
}

teardown() {
  rm -rf "$TMPD"
}

# ---------------------------------------------------------------------------
# T2.2 — per-attempt row counting across separate processes
# ---------------------------------------------------------------------------

@test "T2.2: per-attempt row counting across separate bash -c processes; post-write current == pre-write next" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"

  # Iteration 1
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_next '$STATUS' build build-run-tests"
  [ "$status" -eq 0 ]
  [ "$output" = "1" ]
  jq -nc --arg p "sha0001" --arg t "2026-01-01T00:01:00Z" \
    '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",attempt:1,parentSha:$p,at:$t}' >> "$STATUS"
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_current '$STATUS' build build-run-tests"
  [ "$status" -eq 0 ]
  [ "$output" = "1" ]

  # Iteration 2 — distinct parentSha (a real retry)
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_next '$STATUS' build build-run-tests"
  [ "$status" -eq 0 ]
  [ "$output" = "2" ]
  jq -nc --arg p "sha0002" --arg t "2026-01-01T00:02:00Z" \
    '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",attempt:2,parentSha:$p,at:$t}' >> "$STATUS"
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_current '$STATUS' build build-run-tests"
  [ "$status" -eq 0 ]
  [ "$output" = "2" ]

  # Iteration 3
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_next '$STATUS' build build-run-tests"
  [ "$status" -eq 0 ]
  [ "$output" = "3" ]
  jq -nc --arg p "sha0003" --arg t "2026-01-01T00:03:00Z" \
    '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",attempt:3,parentSha:$p,at:$t}' >> "$STATUS"
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_current '$STATUS' build build-run-tests"
  [ "$status" -eq 0 ]
  [ "$output" = "3" ]
}

# ---------------------------------------------------------------------------
# T2.3 — active-run scoping (vs. PRIOR_STRATEGY's deliberately opposite all-runs)
# ---------------------------------------------------------------------------

@test "T2.3: active-run scoping — completed run + fresh workflow-started derives 1, not 4; PRIOR_STRATEGY (all-runs) still sees the old run" {
  # Run A: 3 DONE rows + workflow-done
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  for i in 1 2 3; do
    jq -nc --arg p "shaA$i" --arg t "2026-01-01T00:0${i}:00Z" --arg strat "STANDARD" \
      '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",attempt:($ARGS.positional[0]|tonumber),parentSha:$p,at:$t,strategy:$strat}' \
      --args "$i" >> "$STATUS"
  done
  jq -nc --arg t "2026-01-01T00:04:00Z" '{type:"workflow-done",workflow:"build",at:$t}' >> "$STATUS"

  # Run B: fresh workflow-started, no step rows
  jq -nc --arg t "2026-01-01T01:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_next '$STATUS' build build-run-tests"
  [ "$status" -eq 0 ]
  [ "$output" = "1" ]

  # Sibling assertion: the shipped PRIOR_STRATEGY jq expression (ALL-RUNS) over
  # the SAME fixture returns run A's strategy, not empty — the asymmetry is
  # asserted, not merely commented.
  run bash -c ". '$STATUS_FOLD_SH'; jq -s -r --arg s 'build-run-tests' \"\$BKIT_STATUS_FOLD\"' fold | [.[] | .steps[] | select(.step==\$s and .status==\"DONE\")] | last.strategy // \"\"' '$STATUS'"
  [ "$status" -eq 0 ]
  [ "$output" = "STANDARD" ]
}

# ---------------------------------------------------------------------------
# T2.4 — subPlan isolation
# ---------------------------------------------------------------------------

@test "T2.4: subPlan isolation — rows for subPlan 1 do not count toward subPlan 2" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  for i in 1 2; do
    jq -nc --arg p "sp1-$i" --arg t "2026-01-01T00:0${i}:00Z" --argjson sp 1 \
      '{type:"step-done",workflow:"build",step:"build-plan-verify",status:"DONE",attempt:($ARGS.positional[0]|tonumber),parentSha:$p,at:$t,subPlan:$sp}' \
      --args "$i" >> "$STATUS"
  done
  jq -nc --arg p "sp1-3" --arg t "2026-01-01T00:03:00Z" --argjson sp 1 \
    '{type:"step-done",workflow:"build",step:"build-plan-verify",status:"DONE",attempt:3,parentSha:$p,at:$t,subPlan:$sp}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_next '$STATUS' build build-plan-verify --sub-plan 2"
  [ "$status" -eq 0 ]
  [ "$output" = "1" ]

  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_next '$STATUS' build build-plan-verify --sub-plan 1"
  [ "$status" -eq 0 ]
  [ "$output" = "4" ]
}

# ---------------------------------------------------------------------------
# T2.4b — build-challenge-tests (#58): empty `--sub-plan ""` characterisation
# (build-challenge.md Finding 2 / build-challenge-1.md F1, ACCEPTED / non-
# blocking). Pins TODAY's behaviour so a future change to it is a visible
# diff, not a silent drift: an OMITTED --sub-plan and a PASSED-BUT-EMPTY
# --sub-plan "" both degrade to "no filter" (count ALL subPlans), because
# `--argjson sp "${_cc_subplan:-null}"` (bkit-counter-bus.sh:126) fires its
# `:-null` default for both the unset AND the empty-string case. A
# non-numeric value (e.g. --sub-plan bad) is unaffected by this test and
# remains fail-closed (exit 2) per counter-failclosed.bats.
# ---------------------------------------------------------------------------

@test "T2.4b: empty --sub-plan \"\" degrades to no-filter (counts ALL subPlans) — characterisation of an ACCEPTED LOW finding, not a fix" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  jq -nc --arg p "sp1-1" --arg t "2026-01-01T00:01:00Z" --argjson sp 1 \
    '{type:"step-done",workflow:"build",step:"build-plan-verify",status:"DONE",attempt:1,parentSha:$p,at:$t,subPlan:$sp}' >> "$STATUS"
  jq -nc --arg p "sp2-1" --arg t "2026-01-01T00:02:00Z" --argjson sp 2 \
    '{type:"step-done",workflow:"build",step:"build-plan-verify",status:"DONE",attempt:1,parentSha:$p,at:$t,subPlan:$sp}' >> "$STATUS"

  # Explicit, correctly-scoped filters: 1 row each.
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' build build-plan-verify --sub-plan 1"
  [ "$status" -eq 0 ]
  [ "$output" = "1" ]
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' build build-plan-verify --sub-plan 2"
  [ "$status" -eq 0 ]
  [ "$output" = "1" ]

  # Omitted flag: no filter, counts both (2) — this is the baseline the
  # empty-string case is characterised AGAINST.
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' build build-plan-verify"
  [ "$status" -eq 0 ]
  [ "$output" = "2" ]

  # Passed-but-empty --sub-plan "": TODAY conflates with "omitted" and also
  # counts both (2), NOT 1 and NOT exit-2. If a future change makes this
  # exit 2 (fail closed) or count 0, this assertion goes red — surfacing the
  # behaviour change instead of it drifting silently.
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' build build-plan-verify --sub-plan ''"
  [ "$status" -eq 0 ]
  [ "$output" = "2" ]

  # A non-numeric --sub-plan remains fail-closed regardless (unaffected by
  # the empty-string degradation this test pins).
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' build build-plan-verify --sub-plan bad"
  [ "$status" -eq 2 ]
}

# ---------------------------------------------------------------------------
# build-challenge-tests (#58): jq-injection-via-step-name — real boundary
# proof of build-challenge-2.md's "Probed and found SAFE" item 1 (jq
# injection via status.jsonl string content). That finding was confirmed by
# manual repro in the challenge report but had NO automated guard anywhere
# in the corpus before this test. Every model/attacker-controlled string
# enters jq via `--arg`/`--argjson` (data-only) and the fold program is a
# fixed constant string, so a step NAMED `evil$(touch X)` must count purely
# as data — no command execution, no cross-step bleed.
# ---------------------------------------------------------------------------

@test "build-challenge-tests: a step named with a shell-metacharacter payload counts as pure data — no command execution, no false match against the real step name" {
  MARKER="$TMPD/PWNED_STEPNAME"
  EVIL_STEP='evil$(touch '"$MARKER"')'
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  jq -nc --arg p "s1" --arg t "2026-01-01T00:01:00Z" --arg step "$EVIL_STEP" \
    '{type:"step-done",workflow:"build",step:$step,status:"DONE",attempt:1,parentSha:$p,at:$t}' >> "$STATUS"

  # Exact-name match on the malicious step counts it (data, not code).
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' build \"\$1\"" _ "$EVIL_STEP"
  [ "$status" -eq 0 ]
  [ "$output" = "1" ]

  # The real step name (build-plan-verify) does NOT match the payload — no
  # cross-step bleed from the injected content.
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' build build-plan-verify"
  [ "$status" -eq 0 ]
  [ "$output" = "0" ]

  # The payload never executed: the marker file must not exist.
  [ ! -e "$MARKER" ]
}

# ---------------------------------------------------------------------------
# T2.5 — fold dedup, both directions
# ---------------------------------------------------------------------------

@test "T2.5a: fold dedup — two rows differing only in parentSha survive as 2 (distinct retries)" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  jq -nc --arg p "shaAAA" --arg t "2026-01-01T00:00:01Z" \
    '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",attempt:1,parentSha:$p,at:$t}' >> "$STATUS"
  jq -nc --arg p "shaBBB" --arg t "2026-01-01T00:00:01Z" \
    '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",attempt:2,parentSha:$p,at:$t}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' build build-run-tests"
  [ "$status" -eq 0 ]
  [ "$output" = "2" ]
}

@test "T2.5b: fold dedup — two byte-identical rows collapse to 1 (replays)" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  ROW=$(jq -nc --arg p "shaCCC" --arg t "2026-01-01T00:00:01Z" \
    '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",attempt:1,parentSha:$p,at:$t}')
  printf '%s\n' "$ROW" >> "$STATUS"
  printf '%s\n' "$ROW" >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' build build-run-tests"
  [ "$status" -eq 0 ]
  [ "$output" = "1" ]
}

# ---------------------------------------------------------------------------
# T2.8 — SOAK marker (soakEntryAt)
# ---------------------------------------------------------------------------

@test "T2.8: SOAK marker — --since soakEntryAt excludes rows before the marker" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"debug",at:$t}' >> "$STATUS"
  jq -nc --arg p "s1" --arg t "2026-01-01T00:01:00Z" \
    '{type:"step-done",workflow:"debug",step:"debug-failure-soak",status:"DONE",attempt:1,parentSha:$p,at:$t}' >> "$STATUS"
  jq -nc --arg p "s2" --arg t "2026-01-01T00:02:00Z" \
    '{type:"step-done",workflow:"debug",step:"debug-failure-soak",status:"DONE",attempt:2,parentSha:$p,at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:03:00Z" '{type:"workflow-meta",workflow:"debug",at:$t,soakEntryAt:$t}' >> "$STATUS"
  jq -nc --arg p "s3" --arg t "2026-01-01T00:04:00Z" \
    '{type:"step-done",workflow:"debug",step:"debug-failure-soak",status:"DONE",attempt:1,parentSha:$p,at:$t}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_next '$STATUS' debug debug-failure-soak --since soakEntryAt"
  [ "$status" -eq 0 ]
  [ "$output" = "2" ]

  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' debug debug-failure-soak"
  [ "$status" -eq 0 ]
  [ "$output" = "3" ]
}

@test "T2.8b: SOAK marker absent — --since soakEntryAt counts all rows (fresh-budget default)" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"debug",at:$t}' >> "$STATUS"
  jq -nc --arg p "s1" --arg t "2026-01-01T00:01:00Z" \
    '{type:"step-done",workflow:"debug",step:"debug-failure-soak",status:"DONE",attempt:1,parentSha:$p,at:$t}' >> "$STATUS"
  jq -nc --arg p "s2" --arg t "2026-01-01T00:02:00Z" \
    '{type:"step-done",workflow:"debug",step:"debug-failure-soak",status:"DONE",attempt:2,parentSha:$p,at:$t}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' debug debug-failure-soak --since soakEntryAt"
  [ "$status" -eq 0 ]
  [ "$output" = "2" ]
}

@test "T2.8c: two SOAK entries within the same wall-clock second fold to one marker" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"debug",at:$t}' >> "$STATUS"
  jq -nc --arg p "s1" --arg t "2026-01-01T00:01:00Z" \
    '{type:"step-done",workflow:"debug",step:"debug-failure-soak",status:"DONE",attempt:1,parentSha:$p,at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:02:00Z" '{type:"workflow-meta",workflow:"debug",at:$t,soakEntryAt:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:02:00Z" '{type:"workflow-meta",workflow:"debug",at:$t,soakEntryAt:$t}' >> "$STATUS"
  jq -nc --arg p "s2" --arg t "2026-01-01T00:03:00Z" \
    '{type:"step-done",workflow:"debug",step:"debug-failure-soak",status:"DONE",attempt:1,parentSha:$p,at:$t}' >> "$STATUS"

  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' debug debug-failure-soak --since soakEntryAt"
  [ "$status" -eq 0 ]
  [ "$output" = "1" ]
}

# ---------------------------------------------------------------------------
# T2.10 — run-boundary interleave characterisation (bkit-build.md's shipped
# `(.[-1] // {})` condition — the LAST run overall, not the last `build` run)
# ---------------------------------------------------------------------------

@test "T2.10: run-boundary interleave — resuming build after an interleaved completed debug run (characterisation)" {
  # build left IN_PROGRESS with 2 build-run-tests rows, no workflow-done
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  jq -nc --arg p "b1" --arg t "2026-01-01T00:01:00Z" \
    '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",attempt:1,parentSha:$p,at:$t}' >> "$STATUS"
  jq -nc --arg p "b2" --arg t "2026-01-01T00:02:00Z" \
    '{type:"step-done",workflow:"build",step:"build-run-tests",status:"DONE",attempt:2,parentSha:$p,at:$t}' >> "$STATUS"

  # a complete debug run interleaves after it
  jq -nc --arg t "2026-01-01T00:03:00Z" '{type:"workflow-started",workflow:"debug",at:$t}' >> "$STATUS"
  jq -nc --arg t "2026-01-01T00:04:00Z" '{type:"workflow-done",workflow:"debug",at:$t}' >> "$STATUS"

  # bkit-build.md's shipped condition: `(.[-1] // {})` — the LAST run
  # overall, not the last run of THIS workflow.
  run bash -c ". '$STATUS_FOLD_SH'; jq -s -r \"\$BKIT_STATUS_FOLD\"' fold | (.[-1] // {}) | {workflow, status}' '$STATUS'"
  [ "$status" -eq 0 ]
  LAST_WORKFLOW=$(echo "$output" | jq -r '.workflow')
  LAST_STATUS=$(echo "$output" | jq -r '.status')
  # Characterisation: today's shipped `(.[-1] // {})` finds the interleaved
  # `debug` run (DONE), NOT the in-progress `build` run — so a resuming
  # `build` (per bkit-build.md:338's test) will NOT see `workflow=="build" &&
  # status=="IN_PROGRESS"` and will append a FRESH `workflow-started` for
  # `build`, resetting the budget. Pin this as today's actual behaviour.
  [ "$LAST_WORKFLOW" = "debug" ]
  [ "$LAST_STATUS" = "DONE" ]

  # Consequence for the derivation: counter_next scoped to the ACTIVE `build`
  # run after this reset sees the fresh run, not the 2 prior rows — the
  # budget resets. This is the "Defect 3 by a side door" characterised (not
  # fixed) here; run-boundary semantics are #209's substrate (deferral row
  # 58-status-jsonl-run-boundary-keys-on-last-run-overall).
  jq -nc --arg t "2026-01-01T00:05:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_next '$STATUS' build build-run-tests"
  [ "$status" -eq 0 ]
  [ "$output" = "1" ]
}
