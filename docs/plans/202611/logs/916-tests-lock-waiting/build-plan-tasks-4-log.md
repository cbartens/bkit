Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 11: queue folder race — helper now does mkdir($queue) || -d $queue (.bkit/templates/scripts/ci/bkit-machine-lock.sh, copied to scripts/ci/); all 400 takes in the stress test exited 0
BLOCKED — TASK 11: test `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `runs that take a lock at once on a fresh cache never refuse over the queue folder` — it asserts every take has exit 0 and EMPTY stderr, but waiting takers legitimately print the "⏳ ... in line" note on stderr, so it fails even with the fix; it should only flag non-zero exits / "cannot create"
DONE — TASK 12: waiter handler for INT/HUP installed only when inherited disposition is not IGNORE (template + scripts/ci copy); TERM unchanged; waiter-ignores-SIGHUP test passes
DONE — TASK 13: IS_CODEX_HOOK also tests process.argv[1] (.bkit/core/hooks/guardrails-tiers.js); .codex, .cursor, .agents/plugins/bkit hook mirrors re-rendered; symlink test passes
BLOCKED — bkit:gate:static: slop findings defensive.error-obscuring in tests-jump.ts:23,34 and tests-lock.integration.test.ts:493 from group 3, not touched by this group
DONE — TASK 14: replacement test `concurrent first takes on a fresh cache exit 0 with no cannot-create refusal` passes against the TASK 11 fix; no source change needed (.bkit/core/engine/audits/templates/machine-lock.integration.test.ts)
