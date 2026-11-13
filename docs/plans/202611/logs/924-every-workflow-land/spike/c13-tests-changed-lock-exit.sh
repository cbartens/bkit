#!/bin/sh
# Claim C13: a non-zero exit from the landing's changed-files check
# (`bkit tests changed --base=DEV_AT --fallback=bkit:gate:static-unit`) means the checks are red,
# so "Red -> stop, route to /bkit-debug" is the right response to any non-zero exit.
# Disproved by a non-zero exit when no test ran or failed: the machine-wide tests lock held by
# another run on this machine.
set -u
ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"
echo "--- tests-lock holder before the run"
bash -c '. scripts/ci/bkit-machine-lock.sh; local_stack_lock_holder tests' ; echo "holder exit=$?"
echo "--- node dist/cli.js tests changed --base=HEAD~1 --fallback=bkit:gate:static-unit --lock-wait-s=3"
node dist/cli.js tests changed --base=HEAD~1 --fallback=bkit:gate:static-unit --lock-wait-s=3 > "${TMPDIR:-/tmp}/c13.out" 2> "${TMPDIR:-/tmp}/c13.err"
echo "exit=$?"
echo "--- stdout"; cat "${TMPDIR:-/tmp}/c13.out"
echo "--- stderr (last 8 lines)"; tail -n 8 "${TMPDIR:-/tmp}/c13.err"
rm -f "${TMPDIR:-/tmp}/c13.out" "${TMPDIR:-/tmp}/c13.err"
