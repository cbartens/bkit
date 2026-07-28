#!/usr/bin/env bats
# tests/ship-worktree-ownership.bats — Task 5 sub-concern II: Step 12 ownership
# scoping.
#
# Verifies that `git worktree remove --force` is scoped to worktrees this run
# created (Finding 6: `git add -A` on a shared worktree → Step 12 force-removes
# whatever build/debug left dirty).
#
# Two layers:
#   A. Prose verification — bkit-ship.md documents the ownership-bit check.
#   B. Behavioural simulation — the ownership logic (marker absent → skip,
#      present → remove, marker survives a simulated crash) holds.
#
# Run: bats tests/ship-worktree-ownership.bats

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
SHIP_MD="$REPO_ROOT/.bkit/workflows/bkit-ship.md"

# ---------------------------------------------------------------------------
# A. Prose verification
# ---------------------------------------------------------------------------

@test "prose: Step 12 checks an ownership marker before worktree remove --force" {
  # The fenced bash in Step 12 must gate `worktree remove --force` on an
  # ownership marker file (not unconditionally).
  step12=$(sed -n '/^## .*Step 12/,/^---$/p' "$SHIP_MD")
  [ -n "$step12" ] || { echo "Step 12 section not found" >&2; false; }
  echo "$step12" | grep -q 'worktree-owned'
  echo "$step12" | grep -q 'worktree remove'
  # The marker must be checked (if/conditional), not just touched.
  echo "$step12" | grep -q 'if.*worktree-owned\|-f.*worktree-owned'
}

@test "prose: ownership marker written at worktree creation to the outbox" {
  # Step 2's worktree-creation path must touch the ownership marker in the
  # outbox (outside the worktree — survives worktree remove/crash).
  step2=$(sed -n '/^## .*Step 2/,/^###.*Gate/p' "$SHIP_MD")
  [ -n "$step2" ] || { echo "Step 2 section not found" >&2; false; }
  echo "$step2" | grep -q 'worktree-owned'
  echo "$step2" | grep -q 'bkit-outbox'
}

@test "prose: absent-default = not mine (skip, do not remove)" {
  step12=$(sed -n '/^## .*Step 12/,/^---$/p' "$SHIP_MD")
  # The else/skip branch must log that the worktree is "not mine".
  echo "$step12" | grep -qi 'not mine\|ownership.*absent\|skipping removal'
}

# ---------------------------------------------------------------------------
# B. Behavioural simulation
# ---------------------------------------------------------------------------
#
# The ownership logic from Step 12, distilled:
#   if [ -f "$OUTBOX/.worktree-owned" ]; then
#     git worktree remove "$WORKTREE_PATH" --force
#   else
#     echo "not mine, skipping"
#   fi
#
# We simulate a real git worktree + outbox to exercise the three properties
# from the Done-when: absent → no removal; present → removal fires; survives
# simulated crash.

@test "behaviour: ownership marker absent → worktree NOT removed" {
  _setup_worktree_scenario
  # Do NOT write the ownership marker.
  _run_step12_ownership_check "$TEST_REPO" "$TEST_FID"
  # Worktree must still exist.
  [ -d "$TEST_REPO/.worktrees/$TEST_FID" ]
}

@test "behaviour: ownership marker present → worktree removed" {
  _setup_worktree_scenario
  # Write the ownership marker (as Step 2 would).
  mkdir -p "$TEST_REPO/.git/bkit-outbox/$TEST_FID"
  touch "$TEST_REPO/.git/bkit-outbox/$TEST_FID/.worktree-owned"
  _run_step12_ownership_check "$TEST_REPO" "$TEST_FID"
  # Worktree must be gone.
  [ ! -d "$TEST_REPO/.worktrees/$TEST_FID" ]
}

@test "behaviour: ownership marker survives simulated crash (outbox outside worktree)" {
  _setup_worktree_scenario
  mkdir -p "$TEST_REPO/.git/bkit-outbox/$TEST_FID"
  touch "$TEST_REPO/.git/bkit-outbox/$TEST_FID/.worktree-owned"
  # Simulate a crash that destroys the worktree dir WITHOUT going through
  # `git worktree remove` (e.g. `rm -rf` by an external process).
  rm -rf "$TEST_REPO/.worktrees/$TEST_FID"
  # The marker must still exist in the outbox.
  [ -f "$TEST_REPO/.git/bkit-outbox/$TEST_FID/.worktree-owned" ]
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_setup_worktree_scenario() {
  TEST_TMP="$(mktemp -d)"
  TEST_REPO="$TEST_TMP/repo"
  TEST_FID="999-test-fid"
  # Create a real git repo with a feature branch worktree.
  git init -q "$TEST_REPO"
  ( cd "$TEST_REPO" && git config user.email t@t.t && git config user.name t && \
    git commit -q --allow-empty -m "init" )
  mkdir -p "$TEST_REPO/.worktrees"
  git -C "$TEST_REPO" worktree add -q "$TEST_REPO/.worktrees/$TEST_FID" -b "feat/$TEST_FID" HEAD
  export TEST_TMP TEST_REPO TEST_FID
}

# Run the Step 12 ownership-check logic (distilled from bkit-ship.md's fenced
# bash block) against a real git repo.
_run_step12_ownership_check() {
  local repo="$1" fid="$2"
  local common_dir
  common_dir="$(git -C "$repo" rev-parse --path-format=absolute --git-common-dir)"
  local worktree_path="$repo/.worktrees/$fid"
  local outbox="$common_dir/bkit-outbox/$fid"
  if [ -d "$worktree_path" ]; then
    if [ -f "$outbox/.worktree-owned" ]; then
      git -C "$repo" worktree remove "$worktree_path" --force
      git -C "$repo" worktree prune
    else
      echo "[bkit-ship] worktree $worktree_path exists but ownership marker absent — not mine, skipping removal" >&2
    fi
  fi
}

teardown() {
  if [ -n "${TEST_TMP:-}" ]; then rm -rf "$TEST_TMP"; fi
}
