<!-- bkit:start -->

<!-- bkit:managed v4.6.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Setup

> [!CAUTION]
> **Purpose:** Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Local seed/test fixtures must never run against remote projects.

<!-- bkit:end -->

> Consumer install and auth (`GH_BKIT_TOKEN_INSTALL`, `.npmrc`, GHA secrets, Vercel env) → root [`README.md`](../README.md). Cloud-agent setup (Claude Code on the web, Cursor Background Agents) → [`.bkit/cloud.md`](../.bkit/cloud.md).

## Required tools

<!-- prettier-ignore -->
| Tool | Version | Used for |
| --- | --- | --- |
| `node` | `>=20` (matches `engines.node` / `.nvmrc`) | Runtime. |
| `pnpm` | tracks `package.json#packageManager` (single SoT) — `corepack enable`, then `pnpm install` (Corepack resolves the pinned version) | Workspace install, lint/typecheck/test gates, bkit CLI. |
| `git` | `>=2.5` | Worktree operations. |
| `gh` | latest, authenticated (`gh auth login`) | PR create / view / merge, CI run log fetch. |
| `jq` | latest | `status.jsonl` append operations inside workflows. |
| `vale` | `3.9.1` | Prose lint (`pnpm lint:prose`). Tarball from `errata-ai/vale` releases; cloud agents install via setup script / Dockerfile. |

## Local environment variables

bkit ships `.bkit/.env.example` (placeholders) and `.envrc` (`dotenv_if_exists .bkit/.env`). The canonical local-secrets file is `.bkit/.env` (gitignored), auto-loaded via direnv on every `cd` into the repo.

```bash
# One-time per machine
brew install direnv
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc && source ~/.zshrc   # zsh; bash users use ~/.bashrc

# One-time per repo clone
cp .bkit/.env.example .bkit/.env   # then fill in GH_BKIT_TOKEN_INSTALL, GH_BKIT_TOKEN, LINEAR_API_KEY (+ optional ANTHROPIC_API_KEY / CURSOR_API_KEY)
direnv allow                            # trust the .envrc; auto-loads on subsequent cd

# Verify
echo "len=${#GH_BKIT_TOKEN}"                 # non-zero → MCP token loaded; gh CLI uses `gh auth login` keyring
```

`LINEAR_ISSUE_ID` is injected per-session by the cloud integration — never put it in `.bkit/.env`. Cloud sessions (Claude on the web, Cursor Background Agents) set the same variable names in their respective dashboards, not via this file.

## Bootstrap

```bash
pnpm install --frozen-lockfile                                          # workspace deps + husky git hooks
pnpm tsx .bkit/src/bkit-install.ts install --claude --cursor --tooling  # dogfood install (this repo only)
pnpm tsx .bkit/src/bkit-install.ts check                                # drift gate
vale sync                                                               # one-off; pulls lint:prose styles
```

`install` requires >= 1 module flag (v4.0.0+) — a bare `install` exits 1. `bkit upgrade` is the exception: flag-free, it re-renders every installed module.

Consumer repos run `pnpm add -D @cbartens/bkit && pnpm exec bkit install --claude --cursor --tooling` instead of the dogfood call.

## Verify

bkit is a single package — there is no turbo / affected-graph. Run the scripts directly:

```bash
pnpm typecheck && pnpm format:check && pnpm lint:prose && pnpm test   # pre-push gates (see docs/deployments.md § Pre-push checklist)
pnpm bkit check                                                       # drift gate
pnpm check:dist                                                       # dist freshness (source-repo only)
pnpm exec bkit doctor                                                 # token + advisory sweep (read-only, never fails)
```

## Troubleshooting

- **`pnpm install` returns 401 / 404 on `@cbartens/bkit`** — either `GH_BKIT_TOKEN_INSTALL` is unset (`echo "${GH_BKIT_TOKEN_INSTALL:-MISSING}"`), or the token was never written to pnpm's user-level config. pnpm >=10.34.3 401s on a project-`.npmrc` `${GH_BKIT_TOKEN_INSTALL}` ref — run `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL"` and retry (see `docs/knowledge.jsonl` KN-CORE-7).
- **`bkit check` reports `.bkit/version` drift** — `pnpm add -D @cbartens/bkit@<new>` ran without `pnpm exec bkit install`. Re-run install; commit the resync.
- **Linear preflight blocks session** — issue missing `bkit:auto` label or in `Done` / `Cancelled`. Add `bkit:auto`, set non-terminal state. (All labels carry the `bkit:` prefix; the unprefixed `Auto` label is retired.)
- **`pnpm-lock.yaml` rebase conflict in workflow** — Tier 2 handler runs inline (`git checkout --theirs pnpm-lock.yaml` and `pnpm install --lockfile-only`); see `.bkit/workflows.md` § Rebase Conflict Tiering.
- **Cloud snapshot stuck on stale vale (Claude)** — bump `# cache-bust YYYY-MM-DD-N` comment in setup script to force rebuild.
