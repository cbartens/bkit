#!/usr/bin/env bats
# tests/ship-failure-path.bats — Task 5 sub-concern I: hardened Failure Path.
#
# Verifies the structural invariants of the Failure Path block in
# bkit-ship.md that MUST hold before AND after the Task 7 structural rewrite,
# plus the #412 single-write contract (group 5):
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

# ---------------------------------------------------------------------------
# 5. Single-write contract (#412)
#
# The Failure Path used to make TWO commits and TWO pushes: a dev-tree
# `ship FAILED` commit in sub-step 1, then a `ship aborted` push of the
# handover onto feat/{FID}. That split one failure's bookkeeping across two
# branches, left the branch half to die with the worktree, and mutated a
# still-open PR's validated head. One flush, one target, decided by the
# runtime.
# ---------------------------------------------------------------------------

@test "failure-path: exactly one 'git push' in the whole path" {
  block="$(failure_path_block)"
  count=$(echo "$block" | grep -cE 'git (-C "[^"]+" )?push' || true)
  [ "$count" -eq 1 ]
}

@test "failure-path: exactly one commit in the whole path" {
  block="$(failure_path_block)"
  count=$(echo "$block" | grep -c 'commit -m' || true)
  [ "$count" -eq 1 ]
}

@test "failure-path: the 'ship aborted' second commit is gone" {
  block="$(failure_path_block)"
  count=$(echo "$block" | grep -c 'ship aborted' || true)
  [ "$count" -eq 0 ]
}

@test "failure-path: the push target is RUNTIME_DEVPUSHES-conditional" {
  block="$(failure_path_block)"
  echo "$block" | grep -q 'if \[ "$RUNTIME_DEVPUSHES" = "true" \]'
  echo "$block" | grep -q 'push origin "\$TARGET"'
}

@test "failure-path: push target asserted non-empty before pushing" {
  block="$(failure_path_block)"
  echo "$block" | grep -q '\[ -n "$TARGET" \]'
}

@test "failure-path: runtime is detected in-block, never inherited across shells" {
  block="$(failure_path_block)"
  # Once in the state step (tree resolution), once in the flush step: shell
  # state does not survive a Bash-block boundary, so an inherited
  # RUNTIME_DEVPUSHES resolves to the dev tree by omission.
  count=$(echo "$block" | grep -c 'bkit_runtime_detect' || true)
  [ "$count" -ge 2 ]
}

@test "failure-path: dev ops assert the checkout is actually on dev" {
  block="$(failure_path_block)"
  echo "$block" | grep -q 'checkout dev'
  echo "$block" | grep -q 'branch --show-current)" = "dev"'
}

@test "failure-path: no step routes back into the Failure Path (self-loop)" {
  block="$(failure_path_block)"
  count=$(echo "$block" | grep -c '→ \*\*Failure Path\*\*' || true)
  [ "$count" -eq 0 ]
}

@test "failure-path: branch-side artifacts reconciled into BOOK_ROOT before staging" {
  block="$(failure_path_block)"
  echo "$block" | grep -q 'SRC_WT'
  echo "$block" | grep -q 'LOGDIR_REL'
}

@test "routing sentinels are gitignored (rendered file AND template source)" {
  for f in "$REPO_ROOT/.gitignore" "$REPO_ROOT/.bkit/templates/gitignore"; do
    grep -q 'docs/plans/\*/logs/\*\*/\.deferred-blocked' "$f"
    grep -q 'docs/plans/\*/logs/\*\*/\.rebase-failed' "$f"
  done
}

# ---------------------------------------------------------------------------
# 6. Staging blocks resolve BOOK_PATHS themselves
#
# An empty BOOK_PATHS makes `git add` a silent no-op: it exits 0, stages
# nothing, and the flush reports "no bookkeeping delta" — or, on the Close
# path, `commit --allow-empty` lands an empty commit. Both look like success.
# BOOK_ROOT fails loudly instead (paths resolve to /docs/...), so this
# invariant is scoped to the two blocks that stage.
# ---------------------------------------------------------------------------

# Every fenced bash block that runs `git add $BOOK_PATHS`.
staging_blocks() {
  awk '/```bash/ { n++; blk[n]="" } n { blk[n] = blk[n] "\n" $0 }
       END { for (i = 1; i <= n; i++) if (blk[i] ~ /git .*add \$BOOK_PATHS/) print blk[i] "\n===BLOCK==="  }' "$SHIP_MD"
}

@test "staging blocks assign BOOK_PATHS in the same block that consumes it" {
  count=0
  while IFS= read -r -d '' block; do
    [ -n "$(echo "$block" | tr -d '[:space:]')" ] || continue
    count=$((count + 1))
    echo "$block" | grep -q 'BOOK_PATHS=' \
      || { echo "block stages \$BOOK_PATHS without assigning it:" >&2; echo "$block" >&2; false; }
  done < <(staging_blocks | awk -v RS='===BLOCK===' '{ printf "%s%c", $0, 0 }')
  # Failure Path flush + conflict-resolve push + Close flush.
  [ "$count" -eq 3 ]
}

@test "staging blocks refuse to stage an empty BOOK_PATHS" {
  while IFS= read -r -d '' block; do
    [ -n "$(echo "$block" | tr -d '[:space:]')" ] || continue
    echo "$block" | grep -q '\[ -n "\$BOOK_PATHS" \]' \
      || { echo "staging block lacks the non-empty BOOK_PATHS guard:" >&2; echo "$block" >&2; false; }
  done < <(staging_blocks | awk -v RS='===BLOCK===' '{ printf "%s%c", $0, 0 }')
}
