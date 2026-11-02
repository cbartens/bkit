# Build Skills Installed

## Technologies Identified

TypeScript (bkit engine), Vitest (tests), GitHub Actions YAML (`bkit-cloud.yml`, `openai/codex-action`), Linear and Jira trackers (read through `bkit issues fetch`, fixture tests only), Node CLI.

## Already Installed

bkit-auto, bkit-build, bkit-debug, bkit-design, bkit-plan, bkit-ship, brainstorming, dispatching-parallel-agents, executing-plans, find-skills, finishing-a-development-branch, receiving-code-review, requesting-code-review, subagent-driven-development, systematic-debugging, test-driven-development, using-git-worktrees, using-superpowers, verification-before-completion, writing-plans, writing-skills

## Newly Installed

- `.agents/skills/vitest` - `antfu/skills@vitest` - https://skills.sh/antfu/skills/vitest (45.4K installs, repo 6032 stars)

## Not Found

- GitHub Actions: only candidates were Go-specific (`samber/cc-skills-golang@golang-continuous-integration`), an unrelated fingerprint gate (`liarjsdev/liarjs-skills@fingerprint-ci-gate`) and a gh-cli skill; none matched the workflow-YAML need, so none was installed.
- TypeScript: top results were niche (shoehorn migration, deep-modules setup, MCP builder, better-auth); none a general match, so none was installed.
- Linear, Jira: not searched; the work uses fixture tests only and no tracker SDK.
