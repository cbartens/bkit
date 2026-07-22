# Build: Install Skills — #58 workflow-counters

## Technologies Identified

- POSIX `sh` shell scripting (`.bkit/templates/.bkit/scripts/*.sh`)
- `jq` (JSON derivation over `status.jsonl`)
- Markdown orchestrator workflow files (`.bkit/workflows/*.md`)
- `bats` cross-process integration tests (`tests/*.bats`)
- Vitest corpus-audit tests (`.bkit/src/**/*.test.ts`)

## Already Installed

`test-driven-development`, `systematic-debugging`, `writing-plans`, `executing-plans`,
`verification-before-completion`, `subagent-driven-development`, `using-git-worktrees`
(from `obra/superpowers`, per `.agents/skills.md` Universal Skills) — cover the
RED-first / rule-derived-worklist / gated-execution methodology this plan already
mandates explicitly in prose (T5.1/T5.3 RED-first, Gate 2a/2b, per-child Handoff).

## Newly Installed

None.

## Not Found

None searched-and-missing — searches were run (`npx skills find jq`,
`bats`, `shell scripting`, `vitest`) and each returned multiple candidate matches
(e.g. `laurigates/claude-plugins@jq-json-processing`, `wshobson/agents@bats-testing-patterns`,
`sammcj/agentic-coding@shell-scripting`, `antfu/skills@vitest`). None were installed:
this feature's shell/jq/bats/vitest work is governed entirely by bkit's own
bespoke, already-documented conventions (the counter-bus fold shape, the
template-relative test repointing from #209, the existing `counter-bus.bats` and
`bkit-counter-prose-audit.test.ts` corpus-audit patterns, the fenced-block /
prose-audit distinction unique to this repo's workflow-authoring doctrine). A
generic third-party jq/bats/shell/vitest skill would teach conventions this
codebase does not use and risks contradicting the plan's explicit constraints
(no `2>/dev/null`, no default-to-`0`, edit-source-never-mirror, ASCII operators
only). The already-installed process skills (TDD, systematic-debugging,
writing/executing-plans) are the genuinely relevant, generic layer; the
tech-specific layer is better served by the plan document itself, which already
carries per-file/per-line prescriptive detail no generic skill would match.

Verdict: No new skills installed — none genuinely warranted; existing generic
process skills plus the plan's own bespoke conventions cover this feature.
<!-- verdict:end -->
