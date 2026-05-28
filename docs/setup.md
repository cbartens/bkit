<!-- bkit:start -->

# Setup

> [!CAUTION]
> **Purpose:** Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Local seed/test fixtures must never run against remote projects.

<!-- bkit:end -->

> Consumer install + auth (`GH_BKIT_TOKEN`, `.npmrc`, GHA secrets, Vercel env) → root [`README.md`](../README.md). Cloud-agent setup (Claude Code on the web, Cursor Background Agents) → [`.agents/cloud.md`](../.agents/cloud.md).

## Required tools

<!-- prettier-ignore -->
| Tool | Version | Used for |
| --- | --- | --- |
| `node` | `>=20` (matches `engines.node` / `.nvmrc`) | Runtime. |
| `pnpm` | matches `package.json#packageManager` (`10.33.0`) — install via `corepack enable && corepack prepare pnpm@10.33.0 --activate` | Workspace install, lint/typecheck/test gates, bkit CLI. |
| `git` | `>=2.5` | Worktree operations. |
| `gh` | latest, authenticated (`gh auth login`) | PR create / view / merge, CI run log fetch. |
| `jq` | latest | `status.json` mutations inside workflows. |
| `vale` | `3.9.1` | Prose lint (`pnpm lint:prose`). Tarball from `errata-ai/vale` releases; cloud agents install via setup script / Dockerfile. |

## Local environment variables

bkit ships `.agents/.env.example` (placeholders) and `.envrc` (`dotenv_if_exists .agents/.env`). The canonical local-secrets file is `.agents/.env` (gitignored), auto-loaded via direnv on every `cd` into the repo.

```bash
# One-time per machine
brew install direnv
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc && source ~/.zshrc   # zsh; bash users use ~/.bashrc

# One-time per repo clone
cp .agents/.env.example .agents/.env   # then fill in GH_BKIT_TOKEN, GH_TOKEN, LINEAR_API_KEY (+ optional ANTHROPIC_API_KEY / CURSOR_API_KEY)
direnv allow                            # trust the .envrc; auto-loads on subsequent cd

# Verify
echo "len=${#GH_TOKEN}"                 # non-zero → loaded
```

`LINEAR_ISSUE_ID` is injected per-session by the cloud integration — never put it in `.agents/.env`. Cloud sessions (Claude on the web, Cursor Background Agents) set the same variable names in their respective dashboards, not via this file.

## Bootstrap

```bash
pnpm install --frozen-lockfile                              # workspace deps + husky git hooks
pnpm tsx .bkit/src/bkit-install.ts install                  # dogfood install (this repo only)
pnpm tsx .bkit/src/bkit-install.ts check                    # drift gate
vale sync                                                   # one-off; pulls lint:prose styles
```

Consumer repos run `pnpm add -D @cbartens/bkit && pnpm exec bkit install` instead of the dogfood call.

## Verify

```bash
pnpm turbo lint typecheck format:check test                 # pre-PR gate (matches workflows)
pnpm exec bkit doctor                                       # token + advisory sweep (read-only)
```

## Troubleshooting

- **`pnpm install` returns 401 / 404 on `@cbartens/bkit`** — `GH_BKIT_TOKEN` unset; pnpm silently ignores `.npmrc` and falls back to npmjs.org. Verify with `echo "${GH_BKIT_TOKEN:-MISSING}"`.
- **`bkit check` reports `.agents/.bkit-version` drift** — `pnpm add -D @cbartens/bkit@<new>` ran without `pnpm exec bkit install`. Re-run install; commit the resync.
- **Linear preflight blocks session** — issue missing `Auto` label or in `Done` / `Cancelled`. Add `Auto`, set non-terminal state.
- **`pnpm-lock.yaml` rebase conflict in workflow** — Tier 2 handler runs inline (`git checkout --theirs pnpm-lock.yaml` + `pnpm install --lockfile-only`); see `.agents/workflows.md` § Rebase Conflict Tiering.
- **Cloud snapshot stuck on stale vale (Claude)** — bump `# cache-bust YYYY-MM-DD-N` comment in setup script to force rebuild.
