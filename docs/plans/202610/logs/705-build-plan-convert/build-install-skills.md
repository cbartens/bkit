# Build Skills Installed

## Technologies Identified

TypeScript (workflow step table and its tests in `.bkit/core/engine/`), Vitest, markdown workflow prose (`.bkit/core/workflows/bkit-build.md`), the shipped workflow catalogue and mirrored instructions (`.bkit/core/.bkit/workflows.md`, `.bkit/instructions.md`), JSONL ledger append (`docs/knowledge.jsonl`), pnpm scripts, and Prettier / prose lint.

## Already Installed

vitest, test-driven-development, systematic-debugging, verification-before-completion, using-git-worktrees, writing-skills, writing-plans, executing-plans, subagent-driven-development, requesting-code-review, receiving-code-review, finishing-a-development-branch, dispatching-parallel-agents, brainstorming, find-skills, using-superpowers, plus the bkit-auto / bkit-build / bkit-debug / bkit-design / bkit-plan / bkit-ship skills.

## Newly Installed

None

## Not Found

None. No `npx skills find` was run, because no technology gap exists: the plan is TypeScript engine and test edits plus markdown workflow / catalogue / ledger edits inside this repo, already covered by `vitest`, `test-driven-development` and the bkit-* workflow skills. pnpm, Prettier and the JSONL ledgers are repo tooling driven by `package.json` scripts, not skill-shaped work, so `.agents/skills/` was left untouched.
