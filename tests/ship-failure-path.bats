#!/usr/bin/env bats
# tests/ship-failure-path.bats — Task 5 sub-concern I: hardened Failure Path.
#
# Verifies four structural invariants of the Failure Path block in
# bkit-ship.md that MUST hold before AND after the Task 7 structural rewrite:
#
#   1. The rebase --abort precedes the workflow-failed status append (a
#      mid-rebase abort discards writes that came before it — Finding 4 /
#      Comment 1 mechanism 2).
#   2. The Failure Path status write resolves via BOOK_ROOT (not
#      --git-common-dir) — Finding 4 (wrong-tree status writes).
#   3. No '2>/dev/null || true' silencing inside the Failure Path block.
#   4. The .deferred-blocked writer is wired (Step 5 sweep FAIL touches the
#      sentinel under BOOK_ROOT) — Finding 2 (no writer).
#
# Run: bats tests/ship-failure-path.bats

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
SHIP_MD="$REPO_ROOT/.bkit/workflows/bkit-ship.md"

# Extract the Failure Path block (## 🤖 Failure Path up to the next top-level
# '## ' step header or horizontal rule that closes the section).
failure_path_block() {
  sed -n '/^## .*Failure Path/,/^---$/p' "$SHIP_MD"
}

# ---------------------------------------------------------------------------
# 1. Abort ordered BEFORE the status append
# ---------------------------------------------------------------------------

@test "failure-path: rebase --abort precedes the workflow-failed status append" {
  block="$(failure_path_block)"
  abort_line=$(echo "$block" | grep -n 'git rebase --abort' | head -1 | cut -d: -f1)
  append_line=$(echo "$block" | grep -n 'workflow-failed' | head -1 | cut -d: -f1)
  [ -n "$abort_line" ] || { echo "no 'git rebase --abort' found in Failure Path" >&2; false; }
  [ -n "$append_line" ] || { echo "no 'workflow-failed' append found in Failure Path" >&2; false; }
  [ "$abort_line" -lt "$append_line" ]
}

# ---------------------------------------------------------------------------
# 2. BOOK_ROOT honoured for status writes
# ---------------------------------------------------------------------------

@test "failure-path: STATUS resolves via BOOK_ROOT (not bare --git-common-dir)" {
  block="$(failure_path_block)"
  # The STATUS= line must reference $BOOK_ROOT, not $REPO_ROOT directly.
  echo "$block" | grep -q 'STATUS=.*BOOK_ROOT'
}

@test "failure-path: BOOK_ROOT resolution present (RUNTIME_DEVPUSHES conditional)" {
  block="$(failure_path_block)"
  echo "$block" | grep -q 'BOOK_ROOT'
  # The conditional must spell out RUNTIME_DEVPUSHES (review-1 m4).
  echo "$block" | grep -q 'RUNTIME_DEVPUSHES'
}

# ---------------------------------------------------------------------------
# 3. No silencing idiom inside the Failure Path block
# ---------------------------------------------------------------------------

@test "failure-path: no '2>/dev/null || true' git-call silencing" {
  block="$(failure_path_block)"
  count=$(echo "$block" | grep -c '2>/dev/null || true' || true)
  [ "$count" -eq 0 ]
}

# ---------------------------------------------------------------------------
# 4. .deferred-blocked writer wired under BOOK_ROOT
# ---------------------------------------------------------------------------

@test "deferred-sweep FAIL writes .deferred-blocked sentinel via touch under BOOK_ROOT" {
  # The writer lives in Step 5's FAIL routing. Search the full file (the writer
  # is outside the Failure Path block itself).
  touch_line=$(grep -n 'touch.*\.deferred-blocked' "$SHIP_MD" | head -1)
  [ -n "$touch_line" ] || { echo "no 'touch ... .deferred-blocked' writer found" >&2; false; }
  echo "$touch_line" | grep -q 'BOOK_ROOT'
}

@test "failure-path: .deferred-blocked is NOT removed in the status/commit block (reader preserved)" {
  # The Failure Path must NOT rm -f .deferred-blocked in its bash block — that
  # sentinel is what step 4's handover condition reads. Only Step 1 clears it.
  block="$(failure_path_block)"
  # The first sub-step (the ```bash block that updates status) must not contain
  # an rm -f targeting .deferred-blocked.
  bash_block=$(echo "$block" | sed -n '/```bash/,/```/p' | head -200)
  rm_count=$(echo "$bash_block" | grep -c 'rm -f.*\.deferred-blocked' || true)
  [ "$rm_count" -eq 0 ]
}
