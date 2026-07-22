<!-- bkit:start -->

<!-- bkit:managed v4.7.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Technology

> [!CAUTION]
> **Purpose:** Chosen frameworks, libraries, styling systems, coding conventions. WHY a choice was made → `decisions.jsonl`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - List technology and usage; **Why** → `decisions.jsonl`.

<!-- bkit:end -->

## Runtime & Language

<!-- prettier-ignore -->
| Technology | Version | Usage |
| --- | --- | --- |
| Node.js | `>=20` (engines field) | Runtime for all CLI scripts |
| TypeScript | `^7.0.0` | Source language for `.bkit/src/*.ts` |
| ESM | `"type": "module"` in `package.json` | All scripts are native ESM modules |
| `tsx` | `^4.19` | Used by integration tests to spawn `bkit` without a pre-build step |

## Package Management

<!-- prettier-ignore -->
| Technology | Version | Usage |
| --- | --- | --- |
| pnpm | tracks `package.json#packageManager` (single SoT; Corepack-resolved) | Monorepo / consumer package management |
| GitHub Packages npm registry | `npm.pkg.github.com` | Distribution target for `@cbartens/bkit` (see `docs/decisions.jsonl` DE-3) |

## Build & Output

<!-- prettier-ignore -->
| Technology | Config | Usage |
| --- | --- | --- |
| `tsc` (TypeScript compiler) | `tsconfig.json` | Compiles `.bkit/src/*.ts` → `dist/*.js`; committed `dist/` is the published artifact |
| `check:dist` npm script | `bkit-tests-static` lane ("Verify Dist Freshness") + source-repo pre-push | Rebuilds and `git diff --exit-code dist/` — fails if committed `dist/` is stale. Source-repo only; not in the consumer `ci.yml` template |
| `picomatch` | `^4.0.4` — the ONLY runtime `dependency` | `.bkitignore` glob matching. Anything reachable from `dist/` at consumer runtime belongs in `dependencies`, never `devDependencies` |

## Execution Hosts

bkit renders agent payload for three IDE/agent-host runtimes. Hosts additive — `--claude` and `--cursor` always-on; opencode opt-in.

<!-- prettier-ignore -->
| Host | Install flag | Notes |
| --- | --- | --- |
| Claude Code (`.claude/`) | always-on (no flag) | Anthropic first-party agent CLI; `CLAUDE.md` owned by `--claude` module |
| Cursor (`.cursor/`) | always-on (no flag) | Cursor IDE agent runtime |
| opencode (`.opencode/`) | `--opencode=<provider>` | sst/opencode universal agent host; seven allowlisted providers (`OPENCODE_PROVIDERS`, strict — no arbitrary-endpoint fallback): `ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama`, `opencode` |

`ollama-local` = localhost/keyless; `ollama` = cloud (ollama.com) — distinct keys. OpenAI-compatible providers: npm `@ai-sdk/openai-compatible`. `opencode-zen` / `opencode-go` = OpenCode built-in gateways (models.dev ids `opencode` / `opencode-go`), auth via `OPENCODE_API_KEY` — minimal `provider.<id>` + `{env:OPENCODE_API_KEY}` (no npm/`baseURL`; OpenCode routes per-model). Allowlist duplicated in three places MUST move together: `OPENCODE_PROVIDERS` (`bkit-cli.ts`), `OPENCODE_PROVIDER_DEFAULTS` (`bkit-modules.ts`), `OPENCODE_PROVIDER_COLUMN` (`bkit-install.ts`). Per-agent model pins: `.bkit/prompts.md` § Models, one column per provider.

## Testing

<!-- prettier-ignore -->
| Technology | Version | Usage |
| --- | --- | --- |
| Vitest | `^4.1.7` | Unit (`*.test.ts`) and integration (`*.integration.test.ts`) test runner |
| `@vitest/coverage-v8` | `^4.1.7` | Per-tier coverage; branch-threshold gate on the unit run (`test:coverage:unit`) |
| bats | via `npx --yes bats` (no devDep) | Shell tier — `tests/*.bats`, for logic that sources `.bkit/scripts/*.sh` |
| Real-filesystem fixtures | `os.tmpdir()` scratch dirs | Integration tests spawn `bkit` against temporary consumer directories — no mock `fs` |

See `docs/testing.md` for tier boundaries, CI execution order, and spawning patterns.

## Linting & Formatting

<!-- prettier-ignore -->
| Technology | Config | Usage |
| --- | --- | --- |
| Prettier | `^3.5`, `.prettierrc.json` | Code and markdown formatting (`pnpm format:check` in CI) |
| Vale | `3.9.1`, system-installed locally; CI installs a sha256-verified pinned tarball | Prose linting of `.agents/`, `.bkit/`, `docs/` and root markdown (`pnpm lint:prose`). Guard-skips when vale / `write-good` is absent — CI installs both so it always enforces there |
| actionlint | `1.7.12`, downloaded in-lane (SHA-pinned script) | GitHub-Actions-aware lint of `.github/workflows/*` — expression syntax + shellcheck on `run:` bodies. `pnpm lint:workflows` guard-skips locally when absent |
| slop-scan | `^0.3`, `slop-scan.config.json` | Detects code-shaped slop in source — empty catches, over-fragmentation, pass-through wrappers. `pnpm lint:slop` reports (never fails); `pnpm slop:delta` is the gate that fails on net-new findings vs the base |

## Git Hooks

<!-- prettier-ignore -->
| Technology | Config | Usage |
| --- | --- | --- |
| husky | `^9.1`, `.husky/` | Pre-commit and pre-push hooks |
| Pre-push hook | `.husky/pre-push` | Runs typecheck + `pnpm test` (unit + in-process integration) + `pnpm bkit check` before push. Source-repo copy additionally runs `pnpm check:dist` (dist freshness gate); consumer template does not include it. Neither copy runs `pnpm build`. |

## CI/CD

<!-- prettier-ignore -->
| Surface | Config file | Trigger |
| --- | --- | --- |
| Self-gating CI | `.github/workflows/ci.yml` | Push to `dev` / `main`, PRs into them, `workflow_dispatch` (manual, feat branches) |
| Release publish | `.github/workflows/release.yml` | Git tag push |
| Cloud-agent lane | `.github/workflows/bkit-cloud.yml` | Opt-in (`bkit install --auto=…`); dual claude + opencode jobs, each secret-gated |

Single package — no turbo, no affected-graph. CI flat DAG: `bkit-tests-scope` planner → every `bkit-tests-*` lane → `bkit-tests-check` (SOLE required check). See `docs/testing.md` § CI execution; `docs/deployments.md` for pipeline rules, branch protection, secrets.

## Naming Conventions

See `.agents/rules.md` § Naming Conventions for server actions, Inngest events, migrations, tests, and log format rules.
