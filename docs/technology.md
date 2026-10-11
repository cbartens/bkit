<!-- bkit:start -->

<!-- bkit:managed v5.0.1 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

# Technology

> [!CAUTION]
> **Purpose:** Chosen frameworks, libraries, styling systems, coding conventions. WHY a choice was made → `decisions.jsonl`.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Notation: one job per mark — `.bkit/prompts.md` § `Notation`.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.
> - List technology and usage; **Why** → `decisions.jsonl`.

<!-- bkit:end -->

## Runtime & Language

<!-- prettier-ignore -->
| Technology | Version | Usage |
| --- | --- | --- |
| Node.js | `>=20` (engines field) | Runtime for all CLI scripts |
| TypeScript | `^7.0.0` | Source language for `.bkit/core/engine/**/*.ts` |
| ESM | `"type": "module"` in `package.json` | All scripts are native ESM modules |
| `tsx` | `^4.19` | Used by integration tests to spawn `bkit` without a pre-build step |

## Package Management

<!-- prettier-ignore -->
| Technology | Version | Usage |
| --- | --- | --- |
| pnpm | tracks `package.json#packageManager` (single SoT; Corepack-resolved) | Monorepo / consumer package management |
| npm registry | `https://registry.npmjs.org` | Distribution target for `@cbartens/bkit` |

## Build & Output

<!-- prettier-ignore -->
| Technology | Config | Usage |
| --- | --- | --- |
| `tsc` (TypeScript compiler) | `tsconfig.json` | Compiles `.bkit/core/engine/**/*.ts` → `dist/**/*.js` (same folders); committed `dist/` is the published artifact |
| `tsc` (test files) | `tsconfig.test.json` | Type-checks the engine including `*.test.ts` with Vitest's bundler resolution, no emit (`pnpm bkit:typecheck:tests`, run by `pnpm typecheck`) |
| `bkit:check:dist` npm script | `bkit-tests-static` lane ("Assert Dist Freshness") + source-repo pre-push | Rebuilds and `git diff --exit-code dist/` — fails if committed `dist/` is stale. Source-repo only; not in the consumer `bkit-ci.yml` template |
| Runtime `dependencies` | none in `package.json` | bkit ships with no runtime dependency. Anything reachable from `dist/` at consumer runtime belongs in `dependencies`, never `devDependencies` |

## Execution Hosts

bkit renders agent payload for three IDE / agent-host runtimes. Hosts additive — `--claude` and `--cursor` always-on; opencode opt-in.

<!-- prettier-ignore -->
| Host | Install flag | Notes |
| --- | --- | --- |
| Claude Code (`.claude/`) | always-on (no flag) | Anthropic first-party agent CLI; `CLAUDE.md` owned by `--claude` module |
| Cursor (`.cursor/`) | always-on (no flag) | Cursor IDE agent runtime |
| opencode (`.opencode/`) | `--opencode=<provider>` | sst/opencode universal agent host; four allowlisted providers (`OPENCODE_PROVIDERS`, strict — no arbitrary-endpoint fallback): `openrouter`, `ollama`, `opencode-zen`, `opencode-go` |

OpenAI-compatible providers: npm `@ai-sdk/openai-compatible`. `opencode-zen` / `opencode-go` = OpenCode built-in gateways (models.dev ids `opencode` / `opencode-go`), auth via `BKIT_OPENCODE_API_KEY` — minimal `provider.<id>` + `{env:BKIT_OPENCODE_API_KEY}` (no npm / `baseURL`; OpenCode routes per-model). Allowlist duplicated in three places MUST move together: `OPENCODE_PROVIDERS` and `OPENCODE_PROVIDER_DEFAULTS` (`.bkit/core/engine/shared/egress.ts`), `GATEWAY_COLUMN` (`.bkit/core/engine/render/models.ts`). Per-agent model pins: `.bkit/prompts.md` § Models, one column per provider.

## Testing

<!-- prettier-ignore -->
| Technology | Version | Usage |
| --- | --- | --- |
| Vitest | `^4.1.7` | Unit (`*.test.ts`) and integration (`*.integration.test.ts`) test runner |
| `@vitest/coverage-v8` | `^4.1.7` | Per-tier coverage; branch-threshold gate on the unit run (`test:coverage:unit`) |
| `yaml` | `^2.9` | Test-only YAML parsing (template workflows parsed in-process; no python / ruby) |
| bats | via `npx --yes bats` (no devDep) | Shell tier — `tests/*.bats`, for logic that lives in shell (the bkit-cloud-bootstrap hook's `gh` preflight, the `gh` stub harness) |
| Real-filesystem fixtures | `os.tmpdir()` scratch dirs | Integration tests spawn `bkit` against temporary consumer directories — no mock `fs` |

See `docs/testing.md` for tier boundaries, CI execution order, and spawning patterns.

## Linting & Formatting

<!-- prettier-ignore -->
| Technology | Config | Usage |
| --- | --- | --- |
| Prettier | `^3.5`, `.prettierrc.json` | Code and markdown formatting (`pnpm format:check` in CI) |
| Vale | `3.9.1`, system-installed locally; CI installs a sha256-verified pinned tarball | Prose linting of `.agents/`, `.bkit/`, `docs/` and root markdown (`pnpm lint:prose` → `bkit ci prose --glob=…`). Skips only when the vale binary is absent; a missing `.vale/styles/write-good` (gitignored, so absent in fresh checkouts and worktrees) self-heals by copying from the main worktree, else `vale sync`, and warns loudly on stderr if neither works. CI installs both so it always enforces there |
| actionlint | `1.7.12`, downloaded in-lane (SHA-pinned script) | GitHub-Actions-aware lint of `.github/workflows/*` — expression syntax + shellcheck on `run:` bodies. `pnpm bkit:lint:workflows` guard-skips locally when absent |
| slop-scan | `^0.3`, `slop-scan.config.json` | Detects code-shaped slop in source — empty catches, over-fragmentation, pass-through wrappers. `pnpm lint:slop` reports (never fails); `pnpm slop:delta` is the gate that fails on net-new findings vs the base |

## Git Hooks

<!-- prettier-ignore -->
| Technology | Config | Usage |
| --- | --- | --- |
| husky | `^9.1`, `.husky/` | Pre-commit and pre-push hooks |
| Pre-push hook | `.husky/pre-push` | Runs `pnpm bkit:gate:static-unit` (or `bkit:gate:static` on `revert-*`) + `pnpm bkit check` before push — the SAME gate scripts the agent workflows dispatch through, so a human push and an agent run enforce one set. Source-repo copy additionally runs `pnpm bkit:check:dist` and `pnpm bkit:lint:workflows`; consumer template does not. Neither copy runs `pnpm build`. |

## CI/CD

<!-- prettier-ignore -->
| Surface | Config file | Trigger |
| --- | --- | --- |
| Self-gating CI | `.github/workflows/bkit-ci.yml` | Push to `dev` / `main`, PRs into them, `workflow_dispatch` (manual, feat branches) |
| Release publish | `.github/workflows/release.yml` | Git tag push |
| Cloud-agent lane | `.github/workflows/bkit-cloud.yml` | Opt-in (`bkit install --auto=…`); dual claude + opencode jobs, each secret-gated |

Single package — no turbo, no affected-graph. CI flat DAG: `bkit-tests-scope` planner → every `bkit-tests-*` lane → `bkit-tests-check` (SOLE required check). See `docs/testing.md` § CI execution; `docs/deployments.md` for pipeline rules, branch protection, secrets.

## Naming Conventions

See `.agents/rules.md` § Project Rules → Naming Conventions for server actions, deployed functions, migrations, tests, and log format rules.
