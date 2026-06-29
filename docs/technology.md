<!-- bkit:start -->

<!-- bkit:managed v4.1.7 — do NOT edit; run `bkit upgrade` to refresh -->

# Technology

> [!CAUTION]
> **Purpose:** Chosen frameworks, libraries, styling systems, coding conventions. WHY a choice was made → `decisions.md`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - List the technology and how it's used. **Why** belongs in `decisions.md`.

<!-- bkit:end -->

## Runtime & Language

<!-- prettier-ignore -->
| Technology | Version | Usage |
| --- | --- | --- |
| Node.js | `>=20` (engines field) | Runtime for all CLI scripts |
| TypeScript | `^6.0.0` | Source language for `.bkit/src/*.ts` |
| ESM | `"type": "module"` in `package.json` | All scripts are native ESM modules |
| `tsx` | `^4.19` | Used by integration tests to spawn `bkit` without a pre-build step |

## Package Management

<!-- prettier-ignore -->
| Technology | Version | Usage |
| --- | --- | --- |
| pnpm | `10.34.1` (`packageManager` field — single SoT) | Monorepo / consumer package management |
| GitHub Packages npm registry | `npm.pkg.github.com` | Distribution target for `@cbartens/bkit` (see `docs/decisions.md` DE-3) |

## Build & Output

<!-- prettier-ignore -->
| Technology | Config | Usage |
| --- | --- | --- |
| `tsc` (TypeScript compiler) | `tsconfig.json` | Compiles `.bkit/src/*.ts` → `dist/*.js`; committed `dist/` is the published artifact |
| `check:dist` npm script | CI step 6 | Rebuilds and `git diff --exit-code dist/` — fails if committed `dist/` is stale |

## Execution Hosts

bkit renders agent payload for three IDE/agent-host runtimes. Hosts are additive — `--claude` and `--cursor` are always-on; opencode is opt-in.

<!-- prettier-ignore -->
| Host | Install flag | Notes |
| --- | --- | --- |
| Claude Code (`.claude/`) | always-on (no flag) | Anthropic first-party agent CLI; `CLAUDE.md` owned by `--claude` module |
| Cursor (`.cursor/`) | always-on (no flag) | Cursor IDE agent runtime |
| opencode (`.opencode/`) | `--opencode=<provider>` | sst/opencode universal agent host; seven allowlisted providers: `ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama`, `zen` |

OpenAI-compatible providers (all except `zen`) use the npm `@ai-sdk/openai-compatible` driver. `zen` (alias `go`) is the opencode-native built-in gateway authenticated via `OPENCODE_API_KEY` (`{env:OPENCODE_API_KEY}` in a minimal `provider.opencode` block, no npm driver / `baseURL`). Per-agent model pins live in `.bkit/prompts.md` § Models, one column per provider.

## Testing

<!-- prettier-ignore -->
| Technology | Version | Usage |
| --- | --- | --- |
| Vitest | `^4.1.7` | Unit (`*.test.ts`) and integration (`*.integration.test.ts`) test runner |
| Real-filesystem fixtures | `os.tmpdir()` scratch dirs | Integration tests spawn `bkit` against temporary consumer directories — no mock `fs` |

See `docs/testing.md` for tier boundaries, CI execution order, and spawning patterns.

## Linting & Formatting

<!-- prettier-ignore -->
| Technology | Config | Usage |
| --- | --- | --- |
| Prettier | `^3.5`, `.prettierrc.json` | Code and markdown formatting (`pnpm format:check` in CI) |
| Vale | system-installed | Prose linting of `.agents/` and root markdown files (`pnpm lint:prose`) |
| slop-scan | `^0.3`, `slop-scan.config.json` | Detects code-shaped slop in source — empty catches, over-fragmentation, pass-through wrappers. `pnpm lint:slop` reports (never fails); `pnpm slop:delta` is the gate that fails on net-new findings vs the base |

## Git Hooks

<!-- prettier-ignore -->
| Technology | Config | Usage |
| --- | --- | --- |
| husky | `^9.1`, `.husky/` | Pre-commit and pre-push hooks |
| Pre-push hook | `.husky/pre-push` | Runs typecheck + unit tests + `pnpm bkit check` before push. Source-repo copy additionally runs `pnpm check:dist` (dist freshness gate); consumer template does not include it. Neither copy runs `pnpm build`. |

## CI/CD

<!-- prettier-ignore -->
| Surface | Config file | Trigger |
| --- | --- | --- |
| Self-gating CI | `.github/workflows/ci.yml` | Push to `dev`/`main`, PRs into them |
| Release publish | `.github/workflows/release.yml` | Git tag push |

See `docs/deployments.md` for CI pipeline rules, branch protection, and secrets management.

## Naming Conventions

See `docs/../.agents/rules.md` § Naming Conventions for server actions, Inngest events, migrations, tests, and log format rules.
