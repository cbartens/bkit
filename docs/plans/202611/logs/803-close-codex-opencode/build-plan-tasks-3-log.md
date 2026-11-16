Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 4: Deny Codex shell reads of private-key files — key path preferred in shellSecretRead, Codex decideShell denies key reads, .env stays advisory, instructions.md entries, mirrors re-rendered; index/guardrails-cursor/instructions-sources tests pass except guardrails-cursor 'dense script linear time' (1050ms vs 1000ms limit, load average ~29, unrelated timing) (.bkit/core/.codex/hooks/bkit-guardrails.cjs)
DONE — TASK 5: Real Codex run recorded — outcome not-shown on codex-cli 0.166.0: Codex ran cat of a synthetic key, but a control deny (bkit tests jump) was also not denied, so the hook did not run (hook trust bypassed via --dangerously-bypass-hook-trust; no interactive trusted session was run); nothing verified on a real host (tests/experiments/hooks/results/2026-11-14/bkit-codex-key-deny.json)
DONE — TASK 6: codex-setup advisory now 'Four things' with status 'configured to deny, not verified on a real Codex host' and .env/direnv line; providers.md and prompts.md use the same phrase; dist rebuilt and staged; install test passes (.bkit/core/engine/install/modules/codex.ts)
