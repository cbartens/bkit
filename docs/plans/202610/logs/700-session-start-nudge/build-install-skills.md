# Build Skills Installed

## Technologies Identified

Derived from `docs/plans/202610/700-session-start-nudge-plan.md` (Agent Execution Runbook, Tasks 1–5):

- **Claude Code hooks** — `SessionStart` hook writing one JSON document with `additionalContext`; exit 0 (Task 1).
- **Cursor hooks** — `sessionStart` hook writing `{ "additional_context": … }`; `failClosed` semantics (Task 1).
- **opencode plugins** — ES-module plugin, dual `setup(ctx)` / `server()` shape, first-tool-result append (Task 2).
- **Codex hooks** — `PreToolUse` hook, stdin/stdout family, `additionalContext` output (Task 3).
- **Antigravity hooks** — `PreToolUse` hook, deny-once delivery (Task 3).
- **POSIX shell scripting** — fail-open hooks, accumulate + `EXIT`-trap JSON write, `printf` JSON safety, POSIX-portable (Task 1).
- **Node.js CommonJS/ESM hook scripts** — `.cjs` / `.js` hooks (Tasks 2, 3).
- **Vitest integration tests** — `.bkit/core/engine/audits/hooks/*.integration.test.ts` (all tasks).

## Already Installed

Pre-existing folders in `.agents/skills/`:

`bkit-auto`, `bkit-build`, `bkit-debug`, `bkit-design`, `bkit-plan`, `bkit-ship`, `brainstorming`, `dispatching-parallel-agents`, `executing-plans`, `find-skills`, `finishing-a-development-branch`, `receiving-code-review`, `requesting-code-review`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `using-git-worktrees`, `using-superpowers`, `verification-before-completion`, `vitest`, `writing-plans`, `writing-skills`.

`vitest` already covers the Vitest testing technology — no gap.

## Newly Installed

- `hook-development` — `anthropics/claude-code@Hook Development` — https://skills.sh/anthropics/claude-code/hook-development
  - Publisher: `anthropics` (official). Installs 14.4K; repo `anthropics/claude-code` 153.4K stars. Covers `SessionStart` / `PreToolUse` / `PostToolUse` hooks, context loading and validation — matches the Claude Code `SessionStart` advisory in Task 1.
- `bash-defensive-patterns` — `wshobson/agents@bash-defensive-patterns` — https://skills.sh/wshobson/agents/bash-defensive-patterns
  - Installs 13.5K (≥ 1000); repo `wshobson/agents` 41.7K stars (≥ 100). Covers defensive shell error handling, traps and cross-platform safety — matches the POSIX shell hook work (accumulate + `EXIT` trap, `printf` JSON safety, fail-open) in Task 1.

Both verified present under `.agents/skills/`. Neither skill contains embedded directives (scanned for override / egress / secret patterns — no hits).

## Not Found

- **Cursor hooks** — no matching skill surfaced by `npx skills find "claude code hooks"` / `"agent hooks"`; no official-publisher or quality-passing candidate.
- **opencode plugin** — only candidate `igorwarzocha/opencode-workflows@create-opencode-plugin` (345 installs, archived, 122 stars) failed the quality hurdle (< 1000 installs); no official publisher found.
- **Codex hooks** — `npx skills find codex` returned no relevant hook-authoring skill; no official-publisher or quality-passing candidate.
- **Antigravity hooks** — `npx skills find antigravity` returned no relevant hook-authoring skill; no official-publisher or quality-passing candidate.
- **Node.js CommonJS/ESM hook scripts** — `npx skills find "node.js cli"` returned no relevant hook-authoring skill; no official-publisher or quality-passing candidate.
