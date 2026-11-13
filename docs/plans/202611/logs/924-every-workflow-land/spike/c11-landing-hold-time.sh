#!/bin/sh
# Claim C11: on bkit's own repo, one local landing holds the landing lock (scratch worktree add,
# frozen install, `bkit tests changed --base=DEV_AT --fallback=bkit:gate:static-unit`) for well
# under the proposed TIMEOUTS.LAND_LOCK_WAIT of 15 minutes.
# Landing replayed: $1 (default 2d3c9cc37, a real squash landing on dev); DEV_AT = its parent.
set -u
ROOT=$(git rev-parse --show-toplevel)
SPIKE=$(cd "$(dirname "$0")" && pwd)
NEW=$(git -C "$ROOT" rev-parse "${1:-2d3c9cc37}")
DEV_AT=$(git -C "$ROOT" rev-parse "$NEW^")
DIR="$SPIKE/land-tree"
now() { date +%s; }
echo "NEW=$NEW DEV_AT=$DEV_AT files=$(git -C "$ROOT" diff --name-only "$DEV_AT" "$NEW" | wc -l | tr -d ' ')"
t0=$(now)
git -C "$ROOT" worktree add -q --detach "$DIR" "$DEV_AT"; echo "worktree add exit=$?"
(cd "$DIR" && git -c core.hooksPath=/dev/null cherry-pick --allow-empty -x "$NEW" > /dev/null 2>&1; echo "cherry-pick (the caller's build) exit=$?")
t1=$(now)
(cd "$DIR" && pnpm install --frozen-lockfile > "$SPIKE/c11-install.log" 2>&1; echo "pnpm install --frozen-lockfile exit=$?")
t2=$(now)
echo "tests lock holder at gate start:"; bash -c ". '$ROOT/scripts/ci/bkit-machine-lock.sh'; local_stack_lock_holder tests" || echo "  (none)"
(cd "$DIR" && node dist/cli.js tests changed --base="$DEV_AT" --fallback=bkit:gate:static-unit --lock-wait-s=1800 > "$SPIKE/c11-gate.out" 2> "$SPIKE/c11-gate.err"; echo "bkit tests changed exit=$?")
t3=$(now)
echo "--- gate stdout"; grep -v '^  - ' "$SPIKE/c11-gate.out"
echo "--- lock-wait lines from stderr"; grep -E 'machine-lock|waiting for tests' "$SPIKE/c11-gate.err" | head -5
echo "--- gate stage lines"; grep -E '\[bkit:gate:changed\]' "$SPIKE/c11-gate.err" | head -20
echo "--- timings (s): setup+build=$((t1-t0)) install=$((t2-t1)) checks=$((t3-t2)) total=$((t3-t0))"
git -C "$ROOT" worktree remove --force "$DIR"; echo "worktree remove exit=$?"
