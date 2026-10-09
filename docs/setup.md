<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Setup

> [!CAUTION]
> **Purpose:** Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, NOT reasons / history; state what to do, NOT why.
> - Check `.agents/docs.md` index first and confirm topic belongs in THIS doc, not another.
> - Local seed / test fixtures must never run against remote projects.

## Templates

Optional, copy and own, never installed. Catalog and install steps: `.bkit/templates.md`.

<!-- bkit:end -->

> Consumer first-time install/auth (`BKIT_GH_TOKEN_INSTALL`, `.npmrc`, GHA secrets, Vercel env) → `node_modules/@cbartens/bkit/.bkit/install.md`. Upgrade paste + ongoing CLI → `.bkit/README.md`. Cloud-agent setup (Claude Code on the web, Cursor Cloud Agents) → `.bkit/cloud.md`; paste-ready values → generated `.claude/cloud.md` / `.cursor/cloud.md`.

## Required tools

<!-- prettier-ignore -->
| Tool | Version | Used for |
| --- | --- | --- |
| `node` | `>=20` (matches `engines.node` / `.nvmrc`) | Runtime. |
| `pnpm` | tracks `package.json#packageManager` (single SoT) — `corepack enable`, then `pnpm install` (Corepack resolves the pinned version) | Workspace install, lint/typecheck/test gates, bkit CLI. |
| `git` | `>=2.5` | Worktree operations. |
| `gh` | latest, authenticated (`gh auth login`) | PR create / view / merge, CI run log fetch. |
| `jq` | latest | Reads the JSON that `bkit` commands print, inside workflows. |
| `vale` | `3.9.1` | Prose lint (`pnpm lint:prose`). Tarball from `errata-ai/vale` releases; cloud agents install via setup script / Dockerfile. |

## Local environment variables

bkit ships `.bkit/.env.example` (placeholders) and `.envrc` (`dotenv_if_exists .bkit/.env`). Canonical local secrets: `.bkit/.env` (gitignored), auto-loaded via direnv on every `cd`.

```bash
# One-time per machine
brew install direnv
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc && source ~/.zshrc   # zsh; bash: ~/.bashrc

# One-time per repo clone
cp .bkit/.env.example .bkit/.env   # fill BKIT_GH_TOKEN_INSTALL, BKIT_GH_TOKEN, BKIT_LINEAR_API_KEY (+ optional BKIT_ANTHROPIC_API_KEY / BKIT_CURSOR_API_KEY)
direnv allow                            # trust .envrc; auto-loads on subsequent cd

# Verify
echo "len=${#BKIT_GH_TOKEN}"                 # non-zero → MCP token loaded; gh CLI uses `gh auth login` keyring
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

## Roadmap ledger migration

One-time, per repo carrying a legacy `docs/completed.md`. `.bkit/issues.jsonl` is the canonical feature ledger; `docs/roadmap.md` is its generated board.

```bash
pnpm bkit telemetry migrate --dry-run   # preview, no writes
pnpm bkit telemetry migrate             # ports entries + seeds in-flight FIDs, then DELETES docs/completed.md
```

- Parity-gated and destructive: a row-count mismatch aborts with zero `.md` deleted. Re-run is an idempotent no-op.
- NOT auto-run by `bkit upgrade`. `bkit install` / `bkit check` raise the `completed-md-unmigrated` advisory while the `.md` remains.
- Until it runs the board is EMPTY, not wrong — no `completed.md` fallback reader exists, and the fold prints a `[bkit-roadmap]` hint naming the command.

## Verify

Single package — no turbo / affected-graph. Run scripts directly:

```bash
pnpm bkit:gate:static-unit   # pre-push gates (docs/deployments.md § Pre-push checklist)
pnpm bkit check              # drift gate
pnpm bkit:check:dist         # dist freshness (source-repo only)
pnpm exec bkit doctor        # token + advisory sweep (read-only, never fails)
```

## Troubleshooting

- **`pnpm install` 401/404 on `@cbartens/bkit`** — `BKIT_GH_TOKEN_INSTALL` unset (`echo "${BKIT_GH_TOKEN_INSTALL:-MISSING}"`), or token never written to pnpm user-level config. pnpm >=10.34.3 401s on project-`.npmrc` `${BKIT_GH_TOKEN_INSTALL}` ref — run `pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"` (see `docs/knowledge.jsonl` KN-CORE-7).
- **`bkit check` reports `.bkit/version` drift** — `pnpm add -D @cbartens/bkit@<new>` without `pnpm exec bkit install`. Re-run install; commit resync.
- **Linear preflight blocks session** — issue missing `bkit:auto` or in `Done`/`Cancelled`. Add `bkit:auto`, set non-terminal state. (All labels use `bkit:` prefix; unprefixed `Auto` retired.)
- **Lockfile rebase conflict in workflow** — Tier 2 auto-resolver `bkit branches rebase` takes the rebase target's copy and regenerates it (pnpm, npm, yarn, bun, cargo, go, uv); see `.bkit/workflows.md` § Rebase Conflict Tiering.
- **Cloud snapshot stuck on stale vale (Claude)** — bump `# cache-bust YYYY-MM-DD-N` in setup script to force rebuild.
