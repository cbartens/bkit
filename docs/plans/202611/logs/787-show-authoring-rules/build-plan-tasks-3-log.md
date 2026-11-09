Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 10: Ship accurate authoring pointers and coverage guidance — rules, instructions, 36 template notes, providers.md, workflows.md, testing.md updated; core.test.ts passes (.bkit/core/.agents/rules.md)
DONE — TASK 11: Prove fresh-install and upgrade footprints with preserved drivers — named case already passes (147 passed in core.integration.test.ts); no source change needed; build and mirror upgrade are left to the orchestrator (.bkit/core/engine/install/modules/core.integration.test.ts)
DONE — TASK 12: Prove rendered parity, bounds and fresh-consumer dogfood — overrun source was the shell introduction listing every target; it now names the targets that fit 200 characters plus a count (.bkit/core/hooks/guardrails-shell.js); both parity cases pass; guardrails-cursor limit test updated to match; pnpm build, scratch-consumer install and bkit check not run here (orchestrator upgrades once at the end); live delivery stays unverified
NOTE — templates.test.ts: removed the "setup.md § Templates" unaudited entry, since every audit template now contains "§ Doc Templates" and so names that section. Remaining local failures are stale installed mirrors (guardrails hooks, docs/templates, .agents/rules.md) that the orchestrator upgrade regenerates.
BLOCKED — TASK 13: test `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades shipped registrations without dropping consumer hook groups or permissions` — Claude no-duplicate assertion (line 2647) counts "bkit-gateguard.cjs" in JSON.stringify of PreToolUse, but the shipped single Claude group command is `test -f .claude/hooks/bkit-gateguard.cjs && node .claude/hooks/bkit-gateguard.cjs || true`, which names the file twice, so the count is 2 for exactly one group (also 2 in the pre-change shipped file). Needs count of groups/commands, not substring. mergeManagedJson added in write.ts and wired into writeTier2JsonContained; install.md list rule added; write.test.ts mergeManagedJson case passes; all other assertions in the core test pass. No engine build artifact needed beyond the end-of-session upgrade.
