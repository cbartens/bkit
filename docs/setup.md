<!-- bkit:start -->

<!-- bkit:managed v4.10.0 — do NOT edit; run `bkit upgrade` to refresh -->

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

> Consumer first-time install/auth (`GH_BKIT_TOKEN_INSTALL`, `.npmrc`, GHA secrets, Vercel env) → package `README.md` at `node_modules/@cbartens/bkit/README.md`. Upgrade paste + ongoing CLI → `.bkit/README.md`. Cloud-agent setup (Claude Code on the web, Cursor Cloud Agents) → `.bkit/cloud.md`; paste-ready values → generated `.claude/cloud.md` / `.cursor/cloud.md`.

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

bkit ships `.bkit/.env.example` (placeholders) and `.envrc` (`dotenv_if_exists .bkit/.env`). Canonical local secrets: `.bkit/.env` (gitignored), auto-loaded via direnv on every `cd`.

```bash
# One-time per machine
brew install direnv
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc && source ~/.zshrc   # zsh; bash: ~/.bashrc

# One-time per repo clone
cp .bkit/.env.example .bkit/.env   # fill GH_BKIT_TOKEN_INSTALL, GH_BKIT_TOKEN, LINEAR_API_KEY (+ optional ANTHROPIC_API_KEY / CURSOR_API_KEY)
direnv allow                            # trust .envrc; auto-loads on subsequent cd

# Verify
echo "len=${#GH_BKIT_TOKEN}"                 # non-zero → MCP token loaded; gh CLI uses `gh auth login` keyring
```

`LINEAR_ISSUE_ID` — per-session cloud injection; never in `.bkit/.env`. Cloud sessions set the same variable names in their dashboards, not this file.

## Bootstrap

```bash
pnpm install --frozen-lockfile                                          # workspace deps + husky git hooks
pnpm tsx .bkit/src/bkit-install.ts install --claude --cursor --tooling  # dogfood install (this repo only)
pnpm tsx .bkit/src/bkit-install.ts check                                # drift gate
vale sync                                                               # one-off; pulls lint:prose styles
```

`install` requires ≥1 module flag (v4.0.0+) — bare `install` exits 1. `bkit upgrade` is flag-free; re-renders every installed module.

Consumer repos: `pnpm add -D @cbartens/bkit && pnpm exec bkit install --claude --cursor --tooling` (not the dogfood call).

## Verify

Single package — no turbo / affected-graph. Run scripts directly:

```bash
pnpm typecheck && pnpm format:check && pnpm lint:prose && pnpm test   # pre-push gates (docs/deployments.md § Pre-push checklist)
pnpm bkit check                                                       # drift gate
pnpm check:dist                                                       # dist freshness (source-repo only)
pnpm exec bkit doctor                                                 # token + advisory sweep (read-only, never fails)
```

## Troubleshooting

- **`pnpm install` 401/404 on `@cbartens/bkit`** — `GH_BKIT_TOKEN_INSTALL` unset (`echo "${GH_BKIT_TOKEN_INSTALL:-MISSING}"`), or token never written to pnpm user-level config. pnpm >=10.34.3 401s on project-`.npmrc` `${GH_BKIT_TOKEN_INSTALL}` ref — run `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL"` (see `docs/knowledge.jsonl` KN-CORE-7).
- **`bkit check` reports `.bkit/version` drift** — `pnpm add -D @cbartens/bkit@<new>` without `pnpm exec bkit install`. Re-run install; commit resync.
- **Linear preflight blocks session** — issue missing `bkit:auto` or in `Done`/`Cancelled`. Add `bkit:auto`, set non-terminal state. (All labels use `bkit:` prefix; unprefixed `Auto` retired.)
- **`pnpm-lock.yaml` rebase conflict in workflow** — Tier 2 handler inline (`git checkout --theirs pnpm-lock.yaml` + `pnpm install --lockfile-only`); see `.bkit/workflows.md` § Rebase Conflict Tiering.
- **Cloud snapshot stuck on stale vale (Claude)** — bump `# cache-bust YYYY-MM-DD-N` in setup script to force rebuild.
