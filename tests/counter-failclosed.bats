#!/usr/bin/env bats
# counter-failclosed.bats — Fail-closed integration tests for #58 T2.7/T2.9.
#
# T2.7: today's dev decide_next/check_max fail OPEN on an unset/empty/
# non-integer counter — `[ "" -gt 3 ]` is indistinguishable from "condition
# false", so an unusable counter silently CONTINUES. This suite asserts the
# HARDENED contract (empty stdout, exit 2, never continue) and is therefore
# EXPECTED TO BE RED against the current, unhardened bkit-counter-bus.sh —
# both the template (until sub-plan 2's T3.8 hardens it) and against `dev`
# (captured below as red-vs-dev.txt). Hardening `decide_next`/`check_max`
# themselves is OUT OF SCOPE for this sub-plan (KN-26 — see #58 Breaking
# Changes item 1); it ships atomically with the derivation conversion in
# `58-workflow-counters-plan-2.md`'s T3.8. Do NOT harden the guard here to
# make these tests pass early.
#
# T2.9: count-0 is a LEGAL answer at a position-3 routing site (routing on a
# prior/not-yet-executed step), and MAX=0 is a valid threshold
# (MAX_CHALLENGE_REMEDIATE_ATTEMPT=1 -> THRESHOLD=0, the corpus's only live
# zero-threshold). These cases use valid, non-empty integers, so they pass
# against TODAY's unhardened decide_next/counter_count without any guard
# hardening (the fail-open bug is specifically about empty/non-integer
# inputs, not about the value 0 itself) — recorded honestly below, not
# claimed RED where the empirical behaviour is green.
#
# Run: bats tests/counter-failclosed.bats
# Requires: bats >= 1.0

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
# Template-relative by default (#58 T2.0) — see tests/counter-bus.bats.
COUNTER_BUS="${BKIT_COUNTER_BUS:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-counter-bus.sh}"
COUNTER_CONFIG="${BKIT_COUNTER_CONFIG:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-counter-bus-config.sh}"
STATUS_FOLD_SH="${BKIT_STATUS_FOLD_SH:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-status-fold.sh}"

setup() {
  TMPD="$(mktemp -d)"
  STATUS="$TMPD/status.jsonl"
}

teardown() {
  rm -rf "$TMPD"
}

# ---------------------------------------------------------------------------
# T2.7 — fail-closed contract (RED against today's unhardened guard, and
# against dev — see the red-vs-dev.txt capture below)
# ---------------------------------------------------------------------------

@test "T2.7: decide_next — unset counter must refuse (empty stdout, exit 2), never continue" {
  run bash -c ". '$COUNTER_BUS'; unset TEST_ATTEMPT; decide_next TEST_ATTEMPT \"\$TEST_ATTEMPT\" 3 step-14 failure-path 2>/dev/null"
  [ "$status" -eq 2 ]
  [ -z "$output" ]
}

@test "T2.7: decide_next — empty counter must refuse (empty stdout, exit 2), never continue" {
  run bash -c ". '$COUNTER_BUS'; TEST_ATTEMPT=''; decide_next TEST_ATTEMPT \"\$TEST_ATTEMPT\" 3 step-14 failure-path 2>/dev/null"
  [ "$status" -eq 2 ]
  [ -z "$output" ]
}

@test "T2.7: decide_next — non-integer counter (abc) must refuse (empty stdout, exit 2)" {
  run bash -c ". '$COUNTER_BUS'; decide_next TEST_ATTEMPT abc 3 step-14 failure-path 2>/dev/null"
  [ "$status" -eq 2 ]
  [ -z "$output" ]
}

@test "T2.7: decide_next — non-integer counter (1.5) must refuse (empty stdout, exit 2)" {
  run bash -c ". '$COUNTER_BUS'; decide_next TEST_ATTEMPT 1.5 3 step-14 failure-path 2>/dev/null"
  [ "$status" -eq 2 ]
  [ -z "$output" ]
}

@test "T2.7: decide_next — unset MAX must refuse (empty stdout, exit 2)" {
  run bash -c ". '$COUNTER_BUS'; unset MAX_TEST_ATTEMPT; decide_next TEST_ATTEMPT 2 \"\$MAX_TEST_ATTEMPT\" step-14 failure-path 2>/dev/null"
  [ "$status" -eq 2 ]
  [ -z "$output" ]
}

@test "T2.7: decide_next — empty MAX must refuse (empty stdout, exit 2)" {
  run bash -c ". '$COUNTER_BUS'; decide_next TEST_ATTEMPT 2 '' step-14 failure-path 2>/dev/null"
  [ "$status" -eq 2 ]
  [ -z "$output" ]
}

@test "T2.7: decide_next — over-cap still routes to failure-path, exit 1" {
  run bash -c ". '$COUNTER_BUS'; decide_next TEST_ATTEMPT 4 3 step-14 failure-path 2>/dev/null"
  [ "$status" -eq 1 ]
  [ "$output" = "failure-path" ]
}

@test "T2.7: decide_next — at-cap continues, exit 0" {
  run bash -c ". '$COUNTER_BUS'; decide_next TEST_ATTEMPT 3 3 step-14 failure-path"
  [ "$status" -eq 0 ]
  [ "$output" = "step-14" ]
}

@test "T2.7: check_max — unset/empty counter must refuse (exit 2), not exit 0" {
  run bash -c ". '$COUNTER_BUS'; unset X; check_max X \"\$X\" 3 2>/dev/null"
  [ "$status" -eq 2 ]
}

@test "T2.7: RED-vs-dev capture — dev's decide_next fail-opens on an unset counter (documented, not fixed here)" {
  DEV_BUS="$TMPD/dev-bus.sh"
  if ! git show dev:.bkit/scripts/bkit-counter-bus.sh > "$DEV_BUS" 2>/dev/null; then
    skip "dev ref unavailable in this environment (e.g. shallow clone) — cannot capture red-vs-dev.txt here"
  fi
  # Capture stdout only for the assertion (stderr carries bash's own
  # "integer expected" diagnostic, which is a separate, expected fact — not
  # part of the fail-open stdout/exit-code proof).
  run bash -c ". '$DEV_BUS'; unset TEST_ATTEMPT; decide_next TEST_ATTEMPT \"\$TEST_ATTEMPT\" 3 step-14 failure-path 2>$TMPD/dev-stderr.txt"
  DEV_STDOUT="$output"
  DEV_EXIT="$status"
  DEV_STDERR="$(cat "$TMPD/dev-stderr.txt" 2>/dev/null || true)"
  # Write the proof to a SCRATCH file only (T2.7/G3) — this suite must never
  # mutate the tracked docs/ tree on every run (see committed
  # red-vs-dev.txt's own header for why). The committed artifact is a
  # deliberate, one-time capture; re-running the suite must reproduce its
  # substance without rewriting it.
  SCRATCH_LOG="$TMPD/red-vs-dev.txt"
  TRACKED_LOG="$REPO_ROOT/docs/plans/202607/logs/58-workflow-counters/red-vs-dev.txt"
  {
    echo "=== RED-vs-dev proof (#58 T2.7) — captured $(date -u +%FT%TZ) ==="
    echo "dev's .bkit/scripts/bkit-counter-bus.sh: decide_next TEST_ATTEMPT \"\" 3 step-14 failure-path"
    echo "exit=${DEV_EXIT}"
    echo "stdout=${DEV_STDOUT}"
    echo "stderr=${DEV_STDERR}"
    echo "Expected (hardened, this suite's contract): empty stdout, exit 2 (refused)."
    echo "Actual (dev, fail-open): stdout='step-14', exit=0 — an unset counter silently CONTINUES."
  } > "$SCRATCH_LOG"
  # The proof: dev prints 'step-14' on stdout and exits 0 (the fail-open) —
  # NOT 'command not found', which would mean the template-relative wiring
  # (T2.0) is broken rather than proving the documented defect.
  [ "$DEV_STDOUT" = "step-14" ]
  [ "$DEV_EXIT" -eq 0 ]
  # Provenance check (not regeneration): the freshly-derived scratch capture
  # must match the tracked artifact apart from the "captured <timestamp>"
  # line and the stderr line (which embeds a fresh, per-run mktemp path) —
  # proving the committed red-vs-dev.txt genuinely came from running this
  # same proof against dev's bus, not a hand-typed transcript, without this
  # suite ever writing to the tracked path.
  if [ -f "$TRACKED_LOG" ]; then
    diff <(grep -Ev '^(=== RED-vs-dev proof|stderr=)' "$SCRATCH_LOG") \
         <(grep -Ev '^(=== RED-vs-dev proof|stderr=)' "$TRACKED_LOG")
  fi
}

# ---------------------------------------------------------------------------
# T2.9 — count-0 is legal at a position-3 routing site; MAX=0 is a valid
# threshold. These use valid non-empty integers, so they pass against
# TODAY's unhardened guard (recorded honestly — the fail-open bug is about
# empty/non-integer inputs, not the value 0).
# ---------------------------------------------------------------------------

@test "T2.9: counter_count over zero matching rows prints 0, exit 0 (legal, not an error)" {
  jq -nc --arg t "2026-01-01T00:00:00Z" '{type:"workflow-started",workflow:"build",at:$t}' >> "$STATUS"
  run bash -c ". '$STATUS_FOLD_SH'; . '$COUNTER_BUS'; counter_count '$STATUS' build build-challenge-remediate"
  [ "$status" -eq 0 ]
  [ "$output" = "0" ]
}

@test "T2.9: decide_next with MAX=0 — value 0 continues (0 rows, first pass; live site: bkit-build.md:786-787 challenge-remediate first-pass routing)" {
  run bash -c ". '$COUNTER_BUS'; decide_next CHALLENGE_REMEDIATE_ATTEMPT 0 0 step-11 failure-path"
  [ "$status" -eq 0 ]
  [ "$output" = "step-11" ]
}

@test "T2.9: decide_next with MAX=0 — value 1 exceeds, routes to failure-path (live site: bkit-debug.md:443 SOAK budget)" {
  run bash -c ". '$COUNTER_BUS'; decide_next CHALLENGE_REMEDIATE_ATTEMPT 1 0 step-11 failure-path 2>/dev/null"
  [ "$status" -eq 1 ]
  [ "$output" = "failure-path" ]
}

@test "T2.9: RED-PROOF — a falsy-rejection regression ([ -z ] || [ -eq 0 ]) would wrongly reject a legal 0 (verified by temporary edit, then restore)" {
  cp "$COUNTER_BUS" "$TMPD/bus-original.sh"
  # Simulate the "reject empty-or-zero" reflex a careless hardening pass
  # might introduce into decide_next.
  sed 's/if \[ "\$_val" -gt "\$_max" \]; then/if [ -z "$_val" ] || [ "$_val" -eq 0 ] || [ "$_val" -gt "$_max" ]; then/' \
    "$TMPD/bus-original.sh" > "$TMPD/bus-regressed.sh"
  run bash -c ". '$TMPD/bus-regressed.sh'; decide_next CHALLENGE_REMEDIATE_ATTEMPT 0 0 step-11 failure-path 2>/dev/null"
  # The regressed guard wrongly routes the legal 0 to failure-path instead
  # of continuing — proving this suite's case above actually exercises the
  # falsy-rejection failure mode, not a vacuous assertion.
  [ "$status" -eq 1 ]
  [ "$output" = "failure-path" ]
  # Nothing on disk was mutated (bus-regressed.sh is a tmp copy); COUNTER_BUS
  # itself was never touched, so there is nothing to restore.
  diff "$COUNTER_BUS" "$TMPD/bus-original.sh"
}
