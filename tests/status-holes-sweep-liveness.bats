#!/usr/bin/env bats
# tests/status-holes-sweep-liveness.bats — the CI "Check Status Holes" step greps the sweep's
# summary line so a silent no-op reds the lane while a hole does not (#699).
# Corpus: tests/fixtures/status-holes/status.jsonl (a closed design run with step holes).

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"

# The literal the lane's `grep -qF` names, read from the workflow file itself.
lane_pattern() {
  grep -o "grep -qF '[^']*'" "$REPO_ROOT/.github/workflows/bkit-ci.yml" | head -1 | sed "s/^grep -qF '//; s/'\$//"
}

@test "the sweep prints the summary line the lane greps for" {
  pattern="$(lane_pattern)"
  [ "$pattern" = "[bkit-status-holes] sweep:" ]
  run bash -c "cd '$REPO_ROOT' && pnpm exec tsx .bkit/core/engine/checks/status-holes.ts tests/fixtures/status-holes/status.jsonl"
  [ "$status" -eq 0 ]
  [[ "$output" == *"$pattern"* ]]
  echo "$output" | grep -qE '^\[bkit-status-holes\] sweep: [0-9]+ file\(s\), [0-9]+ holey$'
  echo "$output" | grep -qF 'sweep: 1 file(s), 1 holey'
}

@test "the lane's grep pattern rejects output without the summary line" {
  pattern="$(lane_pattern)"
  [ -n "$pattern" ]
  out="$BATS_TEST_TMPDIR/no-summary.txt"
  printf '[bkit-status-holes] ADVISORY — fail-open (exit 0 regardless)\n  missing: x\n' > "$out"
  run grep -qF "$pattern" "$out"
  [ "$status" -ne 0 ]
}
