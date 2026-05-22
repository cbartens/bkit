# Build Skills Installed

## Technologies Identified

- Vale prose lint (`.vale.ini`, `.vale/styles/House/` — prose linting config)
- slop-scan (`slop-scan.config.json` — LLM-slop detection)
- Prettier (formatter devDep + `format`/`format:check` scripts + `.prettierignore`)
- Husky (pre-commit / pre-push hook templates under `.agents/templates/.husky/`)
- GitHub Actions CI workflow (`ci.yml` — both bkit's own and the consumer-facing template with auth-shim + token substitution)
- TypeScript (three-tier file ownership writers `bkit-tiers.ts`, token resolver `bkit-tokens.ts`, CLI arg parser `bkit-cli.ts`, module dispatcher `bkit-modules.ts`)
- Vitest (unit + integration test suite — ~30+ new tests across 5 new test files)
- Token substitution (`applyTokens`, `resolveTokens` — `{{NODE_VERSION}}` etc.)
- Dry-run parity (`WriteSet` accumulator, `bkit check` ≡ `bkit install` writeset)
- CLI argument parsing (`parseArgs` in `bkit-cli.ts` — composable module flags)

## Already Installed

<!-- prettier-ignore -->
| Skill folder | Relevance |
| --- | --- |
| `test-driven-development` | Covers the reproduce-first, red-then-green pattern required by all three plan children |
| `executing-plans` | Phase-by-phase runbook execution discipline |
| `verification-before-completion` | Gate verification before proceeding to next phase |
| `systematic-debugging` | Dry-run parity root-cause investigation (Task 5.1 sub-step a) |
| `writing-plans` | N/A for build phase but present |
| `finishing-a-development-branch` | Pre-PR gate sequence, squash-merge prep |

## Newly Installed

<!-- prettier-ignore -->
| Skill folder | Package | Rationale |
| --- | --- | --- |
| `github-actions-docs` | `xixu-me/skills@github-actions-docs` | Directly needed for authoring `ci.yml` (bkit's own + consumer-facing template): `actions/checkout`, `actions/setup-node@v4`, `pnpm/action-setup`, branch trigger syntax, `secrets.*` references, auth-shim `git config` step. Highest-install GitHub Actions skill (98.4K installs) with general/official docs coverage. |
| `vitest` | `pproenca/dot-skills@vitest` | Plan introduces ~30 new tests across 5 new files (`bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-cli.test.ts`, `bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts`). Skill covers Vitest API, tmpdir patterns, `it.todo` → `it()` promotion, and integration test conventions matching the existing `bkit-install.test.ts` pattern. |

## Not Found

<!-- prettier-ignore -->
| Technology | Query used | Result | Rationale for no install |
| --- | --- | --- | --- |
| Vale prose lint | `vale` | Top results: QA-engineer skill, Valet (Laravel), Covalent blockchain — no vale prose lint skill exists | Vale config is well-documented upstream; `.vale.ini` + `House/` rule files are straightforward YAML/regex authorship — no skill adds value here |
| slop-scan | (not searched separately — covered by vale search context) | No dedicated slop-scan skill on skills.sh | slop-scan config is a single JSON file with a known schema; no skill warranted |
| Husky git hooks | `husky git hooks` | `aj-geddes/useful-ai-prompts@git-hooks-setup` (284 installs) — generic hook setup prose | Plan only seeds `.husky/pre-commit` and `.husky/pre-push` template files; the skill covers general hook wiring, not the bkit-specific Tier 2 hash-comment managed-block pattern. Not installed — generic guidance would not add precision over the plan's own spec. |
| Prettier config | `prettier` | `patricio0312rev/skills@eslint-prettier-config` (515 installs) — React/ESLint app stack | Plan adds `prettier` devDep + `.prettierignore` to a CLI tool repo; the skill targets app ESLint+Prettier stacks, not CLI tool formatter wiring. Not installed — no net benefit over official prettier docs. |
| TypeScript CLI | `typescript cli` | Top results: SDK wrappers, Prefactor CLI bootstrap, openai-cli JSDocs — none match bkit's `parseArgs` / module-registry pattern | No relevant skill found; TypeScript CLI parsing via `process.argv` is covered by the existing `test-driven-development` skill + plan spec. |
