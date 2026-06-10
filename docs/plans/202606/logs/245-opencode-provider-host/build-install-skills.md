# Build Skills Installed

## Technologies Identified

- TypeScript (`.bkit/src/*.ts` — transforms, modules, manifest, CLI flag)
- opencode (sst/opencode — new render target host; agent config, plugin hook, provider config)
- JavaScript / Node.js plugin (GateGuard `gateguard.js` — `tool.execute.before` hook)
- Vitest (unit + integration tests)
- pnpm (build + package management)
- GitHub Actions (unified `bkit-cloud.yml` cloud-agent lane)

## Already Installed

- `brainstorming`
- `dispatching-parallel-agents`
- `executing-plans`
- `find-skills`
- `finishing-a-development-branch`
- `pnpm`
- `receiving-code-review`
- `requesting-code-review`
- `subagent-driven-development`
- `systematic-debugging`
- `test-driven-development`
- `typescript-advanced-types`
- `using-git-worktrees`
- `using-superpowers`
- `verification-before-completion`
- `vitest`
- `writing-plans`
- `writing-skills`

## Newly Installed

- `.agents/skills/opencode-qa` — `code-yeongyu/oh-my-opencode@opencode-qa` (opencode agent/tool QA patterns)
- `.agents/skills/github-actions-docs` — `xixu-me/skills@github-actions-docs` (GitHub Actions reference docs for authoring `bkit-cloud.yml`)

## Not Found

- opencode primitives / host-config reference: index entries `different-ai/openwork@opencode-primitives` and `different-ai/openwork@opencode-bridge` resolve to a stale registry — those slugs no longer exist in the upstream repo. No viable replacement with direct opencode host-config coverage found; consult `sst/opencode` docs directly.
