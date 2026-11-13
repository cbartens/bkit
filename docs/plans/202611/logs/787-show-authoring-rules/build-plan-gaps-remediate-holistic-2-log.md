Verdict: CONCERNS
Strategy: PIVOT
Fixed: 5

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: installed docs/templates/*.md were stale — ran `pnpm tsx .bkit/core/engine/cli.ts upgrade`; the 36 templates.test.ts dogfood cases pass in the gate run (docs/templates/*.md)
DONE — Gap 2: installed guardrails hooks were stale — same upgrade re-rendered .cursor/.claude/.codex hook copies; the three T6 mirror cases pass (.claude/hooks, .cursor/hooks, .codex/hooks)
DONE — Gap 3: installed rules block was stale — same upgrade re-rendered the managed block; rules-sync.test.ts passes (.agents/rules.md)
DONE — Gap 4: TASK 11/12 upgrade and drift — upgrade run, `pnpm bkit check` exits 0 (was 245 pending writes). The pnpm build and scratch-consumer install named by TASK 12 were not re-run in this round
DONE — Gap 5: Codex fetch-plus-edit test — deleted guardrails-codex-fetch-edit.integration.test.ts; added `keeps a fetch-plus-edit command advised within each host budget` to gateguard-parity.integration.test.ts (claude: checklist and silent retry; antigravity: fetch denial names the authoring pointer; codex: 2000-byte cap, omission notice, authoring pointer, retry advises again); lint clean; docs/testing.md row updated
DONE — Extra regression found by the gate: the repo-only dogfood tail (outside the managed block) of the four installed GateGuard hooks declared a second `isAgentReadPath` that collided with the engine's new one (a SyntaxError in the opencode ES module, a silent override in the CJS hooks); renamed the tail's function to isDogfoodAgentReadPath in .claude/hooks, .cursor/hooks, .codex/hooks and .opencode/plugin bkit-gateguard files; gateguard-dogfood and gateguard-opencode tests pass (96/96); `pnpm bkit check` exits 0
BLOCKED — Group gate: no run exited 0. The last full run (tc4.log) failed on land.test.ts "dev moved before every push" (7650ms timeout under machine load; passes alone, 43/43) and on lint of my own parity test (conditional expects), which is fixed and lints clean. A final rerun (tc5.log) was started before the instruction not to start another and was not read
NOTE — Final gate rerun (tc5.log): only machine-lock.integration.test.ts "a named lock is machine-wide" failed (9265 passed; lint, format, typecheck pass); it passes alone (43/43) and is affected by other repos holding the machine lock. Flake with no code change; verdict stays CONCERNS
