# Build Skills Installed

## Technologies Identified

TypeScript and Node.js (CLI engine), pnpm (dependency installation), POSIX shell and Bash (hooks and router scripts), Vitest (unit and integration tests), YAML and GitHub Actions (router and `openai/codex-action`), and GitHub, Linear and Jira APIs (tracker facts and fixture tests).

## Already Installed

bkit-auto, bkit-build, bkit-debug, bkit-design, bkit-plan, bkit-ship, brainstorming, dispatching-parallel-agents, executing-plans, find-skills, finishing-a-development-branch, property-based-testing, receiving-code-review, requesting-code-review, subagent-driven-development, systematic-debugging, test-driven-development, using-git-worktrees, using-superpowers, verification-before-completion, vitest, writing-plans, writing-skills.

## Newly Installed

- `.agents/skills/typescript-best-practices`: `cursor/plugins@typescript-best-practices`, [source](https://skills.sh/cursor/plugins/typescript-best-practices). Official Cursor publisher; 9.4K installs and 15,423 repository stars.
- `.agents/skills/pnpm`: `antfu/skills@pnpm`, [source](https://skills.sh/antfu/skills/pnpm). 22.7K installs and 6,042 repository stars.
- `.agents/skills/bash-defensive-patterns`: `wshobson/agents@bash-defensive-patterns`, [source](https://skills.sh/wshobson/agents/bash-defensive-patterns). 14K installs and 42,222 repository stars.
- `.agents/skills/github-actions-hardening`: `github/awesome-copilot@github-actions-hardening`, [source](https://skills.sh/github/awesome-copilot/github-actions-hardening). Official GitHub publisher; 2.4K installs.

The four folders, their `SKILL.md` files, lock sources and nonempty hashes were verified. Host discovery passed for Codex, Claude Code, Cursor, OpenCode and Antigravity. The installer created the missing Claude Code copies explicitly; no bundled skill script was executed. These are temporary feature skills, so the permanent registry is unchanged.

Guidance boundaries: TypeScript's requests to load additional principle skills do not authorize more installation. Bash-only `[[ ]]` and `pipefail` advice does not override POSIX portability. The pnpm skill describes versions 11 and 12; the repository's pinned version and scripts control. The Actions skill's separate report and review-only process does not replace bkit's implementation or challenge contracts.

## Not Found

- Node.js: `mcollina/skills@nodejs-core` passed the quality bar (2K installs, 1,963 stars), but its installed instructions target Node.js core, C++ addons and V8. It was removed with the skills CLI. `wshobson/agents@nodejs-backend-patterns` concerns application backends rather than this CLI engine.
- YAML: `vercel-labs/json-render@yaml` concerns JSON-render UI specifications; `akin-ozer/cc-devops-skills@k8s-yaml-validator` and `@k8s-yaml-generator` concern Kubernetes and have fewer than 1,000 installs. No standalone YAML skill was accepted; the Actions skill covers the relevant workflow surface.
- Linear: `openai/skills@linear` and `linear/linear-release@linear-release-setup` concern tracker operations or release setup. The plan changes existing tracker readers and recorded replies, with no new SDK or tracker-management work.
- Jira: `affaan-m/ecc@jira-integration`, `microsoft/hve-core@jira` and `anthropics/claude-tag-plugins@jira-api` concern operational integration or issue management rather than the existing bkit reader's fixture contract. No Jira skill was accepted.
- Codex Action: `openai/skills@migrate-to-codex` concerns migration, and `openai/codex-plugin-cc@codex-cli-runtime` concerns CLI execution rather than authoring the GitHub Action job. No dedicated action-authoring match was accepted.

All nine technology searches completed successfully after restricted-network attempts emitted no output and were cancelled. The successful searches used host-approved network access; no search was treated as an empty result.
