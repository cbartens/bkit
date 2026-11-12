# Build Skills Installed

## Technologies Identified

TypeScript (workflow engine: counters.ts, decisions.ts), Vitest (engine tests), Markdown workflow and prompt files (bkit-build.md, bkit-build-plan-verify.md), JUnit report parsing.

## Already Installed

test-driven-development, systematic-debugging, verification-before-completion, property-based-testing, bkit-build, and the other skills present in `.agents/skills/`.

## Newly Installed

- `.agents/skills/vitest` — `antfu/skills@vitest` (47K installs, repo 6060 stars) — https://skills.sh/antfu/skills/vitest
- `.agents/skills/typescript-advanced-types` — `wshobson/agents@typescript-advanced-types` (98.5K installs, repo 42344 stars) — https://skills.sh/wshobson/agents/typescript-advanced-types

Also changed by the installer: `skills-lock.json`, `.claude/skills/` symlinks. Neither skill is listed in `.agents/skills.md`, so ship prunes them (temporary, by design).

## Not Found

- Markdown workflow authoring and JUnit parsing: no external skill needed; `.bkit/authoring.md` covers the former. None searched or skipped on quality grounds.
