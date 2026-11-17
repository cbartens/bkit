Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 12: Codex denies key reads under an ask-tier command (.bkit/core/.codex/hooks/bkit-guardrails.cjs, mirror .codex/hooks/bkit-guardrails.cjs)
DONE — TASK 13: decideShell denies any key-kind shellSecretRead whatever non-deny tier wins (.bkit/core/.codex/hooks/bkit-guardrails.cjs)
DONE — TASK 14: redactUrlParts strips schemeless user-info (.bkit/core/engine/checks/before/files.ts)
BLOCKED — TASK 15: test `.bkit/core/engine/commands/install/install.integration.test.ts` `the codex-setup private-key action is self-contained in a fresh consumer` — the advisory now carries the recipe inline (codex.ts), but the test fails on `pointsAtOwnDoc` because the install output also names docs/testing.md in unrelated lines (template-added and "No project document covers" advisory), so it can never pass as written
DONE — TASK 15: codex-setup advisory carries the key-read check inline (.bkit/core/engine/install/modules/codex.ts)
DONE — TASK 16: test already scoped to the codex-setup block; passes (.bkit/core/engine/commands/install/install.integration.test.ts)
