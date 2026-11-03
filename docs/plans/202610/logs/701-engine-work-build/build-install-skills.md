# Build Skills Installed

**Issue:** `#701 — Engine work in build verify and ship`
**Phase:** Build — skill-install pass, before Group 1.

## Technologies Identified

Derived from `docs/plans/202610/701-engine-work-build-plan.md`:

- **TypeScript** — every task edits `.bkit/core/engine/**/*.ts`: `tests.ts` (`green`'s `verdict` / `fixable` / `logLine` mapping table, `plan-check`'s `matrix` / `supersession` kinds), the new `tasks.ts` (`tick` / `open` / `currency`), `plan-blocks.ts` (three table readers), `branches.ts` (`--disabled-tests`), `ledgers.ts` (`triage`), `challenge.ts`, `registry.ts`. Union extension, narrowing and a closed `boolean | null` vocabulary carry the work.
- **Vitest** — all 47 `Derived Test Matrix` rows are `Unit`; every task's `TEST FIRST` and `DONE WHEN` runs `pnpm vitest run`. `branches.test.ts`, `ledgers.test.ts` and `tasks.test.ts` drive real temp git repos and a real test-file subprocess.
- **Git diff semantics** — `git diff --name-only {base}...{against}` and `git diff -S{needle}` (Task 4), added-line hunks with `@@ … +N,M @@` line tracking and `{base}...HEAD` scoping (Task 6), and the worktree this build runs in.
- **JSONL ledgers** — `docs/deferrals.jsonl` rows read and appended through the existing validation path (Task 7).
- **Markdown agent-read prose** — `.bkit/core/prompts/*.md`, `.bkit/core/workflows/*.md`, `.bkit/instructions.md`, the plan template.
- **pnpm + bkit CLI** — `pnpm build`, `pnpm vitest run`, `bkit install`, `bkit check`, and the `dist/` rebuild in Task 11.

No new package, dependency or framework enters the repo (`Pre-Flight` § Package Management).

## Already Installed

21 skill folders present in `.agents/skills/` before this pass:

```
bkit-auto                 bkit-build                bkit-debug
bkit-design               bkit-plan                 bkit-ship
brainstorming             dispatching-parallel-agents
executing-plans           find-skills               finishing-a-development-branch
receiving-code-review     requesting-code-review    subagent-driven-development
systematic-debugging      test-driven-development   using-git-worktrees
using-superpowers         verification-before-completion
writing-plans             writing-skills
```

No installed folder covers a language, runner or tool this plan uses: the `bkit-*` folders are the engine's own generated workflow skills and the rest are the `obra/superpowers` process set. No technology folder (`typescript*`, `vitest`, …) was present.

## Newly Installed

- `typescript-advanced-types` — `wshobson/agents@typescript-advanced-types` — https://skills.sh/wshobson/agents/typescript-advanced-types
  - 93.4K installs, repo 41.8K stars. Matches the requirement: Task 1 pins a closed `fixable` vocabulary (`true` / `false` / `null`) and Task 5 extends `plan-check`'s `problems` kind union — union extension and exhaustive narrowing over a gap-kind table is exactly this skill's subject. Installed safe (0 alerts).
- `vitest` — `antfu/skills@vitest` — https://skills.sh/antfu/skills/vitest
  - 44.1K installs, repo 6.0K stars, publisher maintains the Vitest / Vite stack. Matches the requirement: all 47 matrix rows are `Unit` and every task gates on `pnpm vitest run` over `tests.test.ts` / `tasks.test.ts` / `branches.test.ts` / `ledgers.test.ts` / `plan-blocks.test.ts` / `challenge.test.ts` / `conventions.test.ts`. Installed safe (0 alerts).

Both are project-local under `.agents/skills/` and untracked in `git status` at the time of writing.

`.agents/skills.md` was read, not edited: its `Universal Skills` table sits inside the bkit-managed block (do not edit), and `Project Skills` below `bkit:end` is consumer-owned. Adding these two rows there is a separate call for whoever owns that registry.

## Not Found

- **Git diff / range semantics** — no relevant skill. Searched `npx skills find git`; candidates and why each was skipped:
  - `mattpocock/skills@resolving-merge-conflicts` (551.1K installs) — conflict resolution procedure; this plan runs no conflict resolution.
  - `mattpocock/skills@git-guardrails-claude-code` (507.9K installs) — hook-based command guardrails; nothing about diff ranges.
  - `obra/superpowers@using-git-worktrees` (219.1K installs) — already installed, and it is the worktree isolation this build already uses.
  - None teaches `git diff A...B` merge-base semantics, `-S` pickaxe or added-line hunk numbering. Those are pinned by the plan's own `DONE WHEN` and by `tasks.test.ts` / `branches.test.ts`.
- **JSONL** — no relevant skill. Searched `npx skills find jsonl`; every hit is unrelated (LangSmith datasets, WeChat summaries, fine-tuning). The row contract lives in bkit's own `.bkit/jsonl.md` § Deferral Reason / § Write Idiom.
- **Markdown / prose authoring** — no relevant skill. Searched `npx skills find markdown`; hits are note-app and document conversions (`open.feishu.cn@lark-markdown`, `larksuite/cli@lark-markdown`), not agent-read prose. bkit governs this prose itself through `.bkit/authoring.md` and the `bkit-utility-compress-markdown` prompt, as the repo's `Prose edits` rule requires.
- **pnpm** — `antfu/skills@pnpm` (22.4K installs) clears the quality hurdle but fails relevance: this plan changes no package, dependency or workspace config, and the pnpm surface is only the gate commands. Skipped.
- **Node.js** — `wshobson/agents@nodejs-backend-patterns` (48.8K installs) clears the hurdle but fails relevance: the work is a local CLI command module with no server, HTTP or async-backend surface. Skipped.

**Conclusion:** two skills installed, both matching a load-bearing technology of this plan. Nothing was found for git diff semantics, JSONL or prose authoring — noted as missing, not blocking.
