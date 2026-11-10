Verdict: FAIL
Strategy: STANDARD
Fixed: 4

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 4: 5.1.0 Antigravity hooks.json duplicate groups — mergeManagedList now also matches a group by the bkit hook file name in its command (bkit-*.cjs/js/sh); consumer custom groups kept; dist rebuilt; write.test, core.integration, upgrade.integration pass (.bkit/core/engine/install/write.ts)
DONE — Gap 1: ADVICE_NOTICE_RESERVE restored to 512 (git log -S: lowered to 300 in d6ec5fb5b with composed-advice sizing, no budget test needs 300); hooks tests pass (.bkit/core/hooks/gateguard-engine.js); providers.md reserve line also corrected
DONE — Gap 2: providers.md budgets table OpenCode row now 8,000 characters (.bkit/core/.bkit/providers.md)
DONE — Gap 3: Codex fetch case now calls shellEditContext (checklists + authoring reminder); new test guardrails-codex-fetch-edit.integration.test.ts passes (.bkit/core/.codex/hooks/bkit-guardrails.cjs)
NOTE — 3 mirror-stale assertions ('run pnpm bkit install') fail until the orchestrator's end-of-session upgrade; expected
BLOCKED — Planned test restore: guardrails-cursor.integration.test.ts "stops analysis at each internal bound" — the recorded version asserts the 70-target shell edit output contains `src/f63.ts` (all 64 kept targets named in the text); the current hook names only ~200 characters of targets in the introduction plus " and 56 more)", and the Cursor 2000-byte budget leaves no room for later per-file blocks, so `src/f63.ts` is absent and restoring the recorded line fails the suite. The committed assertion (` and 56 more)`) comes from the earlier Task 12 fix, not this round; I did not edit the test. The tests step must re-record it.
