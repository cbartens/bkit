#!/usr/bin/env bats
# tests/ship-gate.bats — Tier-1 merge-gate tests for bkit-ship-gate.sh (#384 SP1 T4).
#
# Proves the gate's exit-code contract holds against captured `gh` JSON fixtures
# BEFORE any prose in bkit-ship.md is touched (the rewrite in SP2 T7 turns the
# Tier-2 invariant GREEN; this suite is the Seam-1 artifact SP2 re-verifies).
#
# Reuses the existing PATH-shim `gh` idiom from tests/bkit-runtime.bats:44-58
# (FAKE_BIN temp dir + chmod +x + prepend to PATH); the genuinely-new piece is
# the fixture-file dispatch layer under tests/fixtures/gh/ (Task 2).
#
# 10 named cases — one per exit code in the design's table (codes 0/10/11/12/13/
# 14/15/16/20), plus the cache_skip vs vacuous-skipped distinction.
#
# Run: bats tests/ship-gate.bats

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
# Template-relative by default (same convention as tests/bkit-runtime.bats:39):
# the code task edits .bkit/templates/.bkit/scripts/, and `bkit install` (which
# produces the installed .bkit/scripts/ mirror) is deferred to the batch mirror
# regen. An installed-copy default would make this suite unrunnable until then.
GATE_SH="${BKIT_SHIP_GATE_SH:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-ship-gate.sh}"
GH_FIXTURE_ROOT="$REPO_ROOT/tests/fixtures/gh"

setup() {
  # PATH-shim the fixture `gh` (extends the bkit-runtime.bats:44-58 idiom with
  # fixture-file dispatch — Task 2).
  export PATH="$GH_FIXTURE_ROOT/bin:$PATH"
}

# Helper: run the gate with a fixed repo so it never tries `gh repo view`.
run_gate() {
  run bash "$GATE_SH" assert --repo "example/example" "$@"
}

# ---------------------------------------------------------------------------
# 1. Code 0 — green capstone at head
# ---------------------------------------------------------------------------

@test "accepts-green-capstone-at-head (exit 0)" {
  run_gate --head green-capstone
  [ "$status" -eq 0 ]
}

@test "accepts-green-capstone-at-head --explain prints the success note" {
  run_gate --head green-capstone --explain
  [ "$status" -eq 0 ]
  [[ "$output" == *"capstone bkit-tests-check=success at head green-capstone"* ]]
}

# ---------------------------------------------------------------------------
# 2. Code 12 — failed run
# ---------------------------------------------------------------------------

@test "rejects-failed-run (exit 12)" {
  run_gate --head failed
  [ "$status" -eq 12 ]
  [[ "$output" == *"[bkit-ship-gate] selected run concluded FAILURE"* ]]
  [[ "$output" == *"required head:  failed"* ]]
}

# ---------------------------------------------------------------------------
# 3. Code 10 — no run at head (CONFLICTING PR / total_count 0)
# ---------------------------------------------------------------------------

@test "rejects-no-run-at-head (exit 10)" {
  run_gate --head conflicting-no-run
  [ "$status" -eq 10 ]
  [[ "$output" == *"[bkit-ship-gate] no run of ci.yml exists at head conflicting-no-run (total_count=0)"* ]]
}

# ---------------------------------------------------------------------------
# 4. Code 11 — runs exist but none completed
# ---------------------------------------------------------------------------

@test "rejects-none-completed (exit 11)" {
  run_gate --head in-progress
  [ "$status" -eq 11 ]
  [[ "$output" == *"[bkit-ship-gate] runs exist at head in-progress but none completed"* ]]
}

# ---------------------------------------------------------------------------
# 5. Code 14 — green run at a SUPERSEDED head
# ---------------------------------------------------------------------------

@test "rejects-stale-green-at-superseded-head (exit 14)" {
  # The head-keyed run query is filtered SERVER-SIDE, so a superseded head comes
  # back empty and is indistinguishable from "never validated" — code 14 is only
  # separable via the second, branch-scoped query --branch enables. Fixture
  # runs/branch-feat-superseded.json holds a green at 'older-sha-stale-green'.
  run_gate --head superseded-green-target --branch feat/superseded
  [ "$status" -eq 14 ]
  [[ "$output" == *"latest green on feat/superseded is at a SUPERSEDED head (older-sha-stale-green)"* ]]
  [[ "$output" == *"required head:  superseded-green-target"* ]]
  [[ "$output" == *"SUPERSEDED"* ]]
}

@test "without --branch a superseded head is code 10, not 14 (no invented attribution)" {
  # Same head as above, but no --branch: the gate cannot tell "superseded" from
  # "never ran" and must NOT guess. Collapsing to 10 is the honest answer.
  run_gate --head superseded-green-target
  [ "$status" -eq 10 ]
  [[ "$output" == *"no run of ci.yml exists at head superseded-green-target"* ]]
}

# ---------------------------------------------------------------------------
# 6. Code 13 — capstone job ABSENT
# ---------------------------------------------------------------------------

@test "rejects-run-missing-capstone (exit 13)" {
  run_gate --head no-capstone
  [ "$status" -eq 13 ]
  [[ "$output" == *"[bkit-ship-gate] capstone job 'bkit-tests-check' ABSENT"* ]]
}

# ---------------------------------------------------------------------------
# 7. Code 15 — cancelled run
# ---------------------------------------------------------------------------

@test "rejects-cancelled-run-at-head (exit 15)" {
  run_gate --head cancelled
  [ "$status" -eq 15 ]
  [[ "$output" == *"[bkit-ship-gate] selected run was CANCELLED at head cancelled"* ]]
}

# ---------------------------------------------------------------------------
# 8. Code 16 — capstone green but a lane concluded 'skipped' (vacuous green)
# ---------------------------------------------------------------------------

@test "rejects-run-with-skipped-lanes (exit 16)" {
  # Fixture jobs/1007.json: 'test' job concluded 'skipped'. GitHub reports no
  # REASON for a skip (a job skipped by a job-level `if:` never reaches a runner
  # and carries steps:[]), so the gate refuses and names the lane.
  run_gate --head skipped-lane
  [ "$status" -eq 16 ]
  [[ "$output" == *"[bkit-ship-gate] capstone green but 1 lane(s) concluded 'skipped'"* ]]
  [[ "$output" == *"vacuous green: test"* ]]
}

# ---------------------------------------------------------------------------
# 9. Pagination — `--paginate` emits one document PER PAGE without `--slurp`
# ---------------------------------------------------------------------------

@test "detects a skipped lane that lands on page 2 of a paginated jobs list (exit 16)" {
  # Regression: gh api --paginate uses per_page=100 and emits one JSON document
  # per page. Without --slurp, `jq length` over that stream yields "0\n1", which
  # `[ … -gt 0 ]` rejects as a non-integer — the lane check then silently stops
  # running and a vacuous green MERGES. Fixture jobs/1009.pages.json puts the
  # skipped lane on page 2 so an un-slurped read cannot see it.
  run_gate --head paginated-skipped-lane
  [ "$status" -eq 16 ]
  [[ "$output" == *"vacuous green: test"* ]]
}

@test "capstone on page 1 of a paginated jobs list still resolves" {
  # Same fixture, asserting the capstone lookup is not broken by pagination:
  # the refusal must be 16 (skipped lane), NOT 13 (capstone absent).
  run_gate --head paginated-skipped-lane
  [ "$status" -ne 13 ]
  [[ "$output" != *"ABSENT from run"* ]]
}

# ---------------------------------------------------------------------------
# 9b. Run selection — most recent COMPLETED, not merely most recent
# ---------------------------------------------------------------------------

@test "a newer in-flight re-dispatch does not mask a completed green at the head (exit 0)" {
  # Fixture runs/green-then-redispatch.json: run 1001 completed/success, run 1099
  # in_progress with a LATER updated_at at the same head. Selecting "most recent
  # run" reports 'none completed' over a run that has in fact completed.
  run_gate --head green-then-redispatch
  [ "$status" -eq 0 ]
}

# ---------------------------------------------------------------------------
# 10. Code 20 — API error / rate limit, distinguished from code 10
# ---------------------------------------------------------------------------

@test "distinguishes-api-error-from-no-run (exit 20 vs 10)" {
  # Same head, two modes:
  #   BKIT_FAKE_GH_API_ERROR=1 → every api call degrades → code 20
  #   (default)                → no run at unknown head → code 10
  run env BKIT_FAKE_GH_API_ERROR=1 bash "$GATE_SH" assert --repo "example/example" --head green-capstone
  [ "$status" -eq 20 ]
  [[ "$output" == *"[bkit-ship-gate] workflow runs query failed"* ]]
  [[ "$output" == *"API error"* ]]

  run env BKIT_FAKE_GH_API_ERROR=1 bash "$GATE_SH" assert --repo "example/example" --head totally-unknown
  [ "$status" -eq 20 ]

  # Without the error injection, the same unknown head resolves to code 10.
  run bash "$GATE_SH" assert --repo "example/example" --head totally-unknown
  [ "$status" -eq 10 ]
}

@test "distinguishes-rate-limit-exhausted-from-generic-api-error (exit 20, rate-limit-shaped message)" {
  # BKIT_FAKE_RATELIMITED=1 + exhausted rate_limit → code 20 with the
  # rate-limit-shaped message (design: sample rate_limit to shape the message).
  run env BKIT_FAKE_RATELIMITED=1 BKIT_FAKE_RATELIMIT_STATE=exhausted bash "$GATE_SH" assert --repo "example/example" --head green-capstone
  [ "$status" -eq 20 ]
  [[ "$output" == *"[bkit-ship-gate] rate limit exhausted (remaining=0"* ]]
}

# ---------------------------------------------------------------------------
# Override semantics — BKIT_SHIP_GATE_OVERRIDE honoured only on refused head
# ---------------------------------------------------------------------------

@test "override: BKIT_SHIP_GATE_OVERRIDE=<refused-sha> turns a refusal into exit 0 + audit row" {
  STATUS_DIR="$(mktemp -d)"
  export STATUS_PATH="$STATUS_DIR/status.jsonl"
  : > "$STATUS_PATH"
  # 'failed' would normally exit 12; override pinned to that exact head → exit 0.
  run env BKIT_SHIP_GATE_OVERRIDE=failed bash "$GATE_SH" assert --repo "example/example" --head failed --explain
  [ "$status" -eq 0 ]
  [[ "$output" == *"override honoured for head failed"* ]]
  # Audit row appended.
  grep -q '"type":"ship-gate-override"' "$STATUS_PATH"
  grep -q '"head":"failed"' "$STATUS_PATH"
  rm -rf "$STATUS_DIR"
}

@test "override: a SHA that does NOT match the refused head is ignored (refusal stands)" {
  # Override pinned to a DIFFERENT head — must NOT turn the refusal into a pass.
  run env BKIT_SHIP_GATE_OVERRIDE=some-other-sha bash "$GATE_SH" assert --repo "example/example" --head failed
  [ "$status" -eq 12 ]
}

# ---------------------------------------------------------------------------
# Argument / config resolution
# ---------------------------------------------------------------------------

@test "config: --capstone / --workflow overrides resolve from package.json when omitted" {
  # No --capstone passed; the gate reads bkit.capstoneJob from REPO_ROOT/package.json.
  # The green-capstone fixture's capstone is named 'bkit-tests-check' (the default).
  run env bash -c "cd '$REPO_ROOT' && bash '$GATE_SH' assert --repo 'example/example' --head green-capstone"
  [ "$status" -eq 0 ]
}

@test "usage: missing --head exits 2" {
  run_gate
  [ "$status" -eq 2 ]
  [[ "$output" == *"[bkit-ship-gate] --head <sha> is required"* ]]
}

# ---------------------------------------------------------------------------
# Build-challenge remediation regressions (#384) — one case per fixed finding
# that lives in the gate script or the gh stub. Markdown-prose findings are
# covered by bkit-ship-invariants.test.ts.
# ---------------------------------------------------------------------------

# Finding 4 (facet b): STATUS_PATH unset must NOT crash the override under
# `set -euo pipefail`. Old code: `local status="$STATUS_PATH"` → unbound
# variable → exit 1 (escape hatch broken in production). Fix: `${STATUS_PATH:-}`.
@test "F4b: override honoured (exit 0) when STATUS_PATH is unset — no set -u crash" {
  run env -u STATUS_PATH BKIT_SHIP_GATE_OVERRIDE=failed bash "$GATE_SH" assert --repo "example/example" --head failed --explain
  [ "$status" -eq 0 ]
  [[ "$output" == *"override honoured for head failed"* ]]
}

# Finding 4 (facet c): the audit row must NEVER be invisible. When STATUS_PATH
# is set but unwritable, the override still exits 0 AND emits the audit row to
# stderr. Old code: `>> "$status" 2>/dev/null || true` silenced the write → the
# documented rollback grep missed the override. Fix: stderr fallback.
@test "F4c: override audit row emitted to stderr when STATUS_PATH is unwritable (never invisible)" {
  run env STATUS_PATH="/nonexistent-bkit-dir-384/status.jsonl" BKIT_SHIP_GATE_OVERRIDE=failed bash "$GATE_SH" assert --repo "example/example" --head failed --explain
  [ "$status" -eq 0 ]
  [[ "$output" == *"override honoured for head failed"* ]]
  # The stderr fallback must carry the audit row + the "emitting to stderr" note.
  [[ "$output" == *"ship-gate-override"* ]]
  [[ "$output" == *"emitting to stderr"* ]]
}

# Finding 6: `2>&1` on the `gh api` capture merged stderr noise into the JSON,
# corrupting jq parsing into a false refusal (code 10/13). Fix: drop `2>&1` so
# only the non-zero exit drives the code-20 path; stdout stays clean JSON.
@test "F6: stderr noise on a successful gh api call does not corrupt JSON parsing (no 2>&1)" {
  # Inject a deprecation-header-shaped warning on the runs + jobs queries.
  # green-capstone is a green run — the gate MUST resolve exit 0, NOT default
  # to total_count=0 (code 10) or capstone-absent (code 13) from corrupted JSON.
  run env BKIT_FAKE_GH_STDERR_NOISE=1 bash "$GATE_SH" assert --repo "example/example" --head green-capstone
  [ "$status" -eq 0 ]
}

# Finding 8: the test stub extracts the SHA from the URL and builds a path
# `$RUNS_DIR/$SHA.json` unsanitized. Fix: `[[ "$SHA" =~ ^[A-Za-z0-9._-]+$ ]]`
# rejects a `../`-laden SHA before path construction (copy-paste hazard guard).
@test "F8: SHA sanitization rejects '../'-laden SHA (no path traversal out of RUNS_DIR)" {
  run "$GH_FIXTURE_ROOT/bin/gh" api "/repos/o/r/actions/workflows/ci.yml/runs?head_sha=../../etc/passwd"
  [ "$status" -eq 1 ]
  [[ "$output" == *"unsanitized SHA"* ]]
  [[ "$output" == *"rejected"* ]]
}
