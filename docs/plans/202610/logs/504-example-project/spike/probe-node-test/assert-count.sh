#!/usr/bin/env bash
# Throwaway probe: does an executed-count assertion behave deterministically
# around `node --test` with a TAP reporter? Mirrors the capstone step the design
# now claims ("assert an executed-test count >= 1").
set -u
GLOB="$1"
out=$(node --test --test-reporter=tap "$GLOB" 2>&1)
rc=$?
tests=$(printf '%s\n' "$out" | sed -n 's/^# tests \([0-9][0-9]*\)$/\1/p' | tail -1)
pass=$(printf '%s\n' "$out" | sed -n 's/^# pass \([0-9][0-9]*\)$/\1/p' | tail -1)
echo "node_rc=$rc tests=${tests:-<none>} pass=${pass:-<none>}"
if [ "$rc" -ne 0 ]; then echo "ASSERT_RESULT=FAIL(node_rc)"; exit 1; fi
if [ "${pass:-0}" -lt 1 ]; then echo "ASSERT_RESULT=FAIL(executed_count=0)"; exit 1; fi
echo "ASSERT_RESULT=PASS"
exit 0
