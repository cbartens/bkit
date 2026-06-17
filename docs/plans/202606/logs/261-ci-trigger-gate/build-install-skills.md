# Build Skills Installed

## Technologies Identified

- **Markdown authoring** — workflow instruction files (`.bkit/workflows/bkit-build.md`, `.bkit/workflows/bkit-debug.md`, `.bkit/workflows.md`) and rationale docs (`docs/deployments.md`, `docs/knowledge.md`, `docs/decisions.md`)
- **Vitest / TypeScript** — one new static-grep test file (`.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts`), modeled on the existing `bkit-workflow-lock-snippet.test.ts`
- **GitHub CLI (`gh`)** — gate logic uses `gh pr view --json statusCheckRollup` and `gh pr list`; these appear as bash instructions inside workflow markdown, not as installable runtime deps
- **Git** — `git rev-parse HEAD`, `git commit --allow-empty`, `git push --force-with-lease`; again bash instructions in markdown
- **jq / NDJSON** — `ciDispatch` additive field written via `jq -nc` onto the `status.jsonl` ledger; inline bash in workflow markdown

## Already Installed

- `brainstorming`
- `dispatching-parallel-agents`
- `executing-plans`
- `find-skills`
- `finishing-a-development-branch`
- `receiving-code-review`
- `requesting-code-review`
- `subagent-driven-development`
- `systematic-debugging`
- `test-driven-development`
- `using-git-worktrees`
- `using-superpowers`
- `verification-before-completion`
- `writing-plans`
- `writing-skills`

## Newly Installed

None

## Not Found

None — all technology requirements are covered by already-installed skills or are not installable-skill gaps:

- **Markdown / docs authoring**: `writing-skills` (installed) covers this.
- **Vitest test authoring**: `test-driven-development` (installed) covers the TDD pattern. The WS-6 test is explicitly modeled on an existing `.bkit/src/bkit-workflow-lock-snippet.test.ts`; vitest is already configured in the repo via `vitest.config.ts`. The `antfu/skills@vitest` package was evaluated but rejected — it addresses vitest framework setup and configuration, not static-grep test authoring, and the repo's vitest setup is already in place.
- **GitHub CLI / git / jq**: These appear as bash instructions embedded in workflow markdown files, not as runtime dependencies requiring skill installation.
- **`executing-plans` / `verification-before-completion`**: Already installed; directly applicable to the runbook-driven WS-1..WS-7 task sequence and gate checkpoints.
