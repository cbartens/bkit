<!-- bkit:start -->

<!-- bkit:managed v5.0.1 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

# Setup

> [!CAUTION]
> **Purpose:** Local dev — CLIs, configuration, secrets, troubleshooting. Humans only.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Notation: one job per mark — `.bkit/prompts.md` § `Notation`.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.
> - Local seed / test fixtures must never run against remote projects.

## Templates

Optional, copy and own, never installed. Catalog and install steps: `.bkit/templates.md`.

## Agent hosts

Run each host (`claude`, `opencode`, `codex`) in its own terminal window — not inside an IDE or a desktop app.

- Separate processes: restart one host without quitting the others.
- Terminal sessions inherit the direnv-loaded `.bkit/.env`; GUI-launched apps do not (`.bkit/providers.md` § macOS GUI-isolation).
- macOS: [Ghostty](https://ghostty.org).

<!-- bkit:end -->

> Consumer first-time install / upgrade → `.bkit/install.md`. Upgrade paste + ongoing CLI → `.bkit/README.md`. Cloud-agent setup (Claude Code on the web, Cursor Cloud Agents) → `.bkit/cloud.md`; paste-ready values → generated `.claude/bkit-cloud.md` / `.cursor/bkit-cloud.md`.

## Required tools

<!-- prettier-ignore -->
| Tool | Version | Used for |
| --- | --- | --- |
| `node` | `>=20` (matches `engines.node` / `.nvmrc`) | Runtime. |
| `pnpm` | tracks `package.json#packageManager` (single SoT) — `corepack enable`, then `pnpm install` (Corepack resolves the pinned version) | Workspace install, lint / typecheck / test gates, bkit CLI. |
| `git` | `>=2.5` | Worktree operations. |
| `gh` | latest, authenticated (`gh auth login`) | PR create / view / merge, CI run log fetch. |
| `jq` | latest | Reads the JSON that `bkit` commands print, inside workflows. |
| `vale` | `3.9.1` | Prose lint (`pnpm lint:prose`). Tarball from `errata-ai/vale` releases; cloud agents install via setup script / Dockerfile. |

## Local environment variables

bkit writes `.bkit/.env.example` (placeholders) and ships `.envrc` (`dotenv_if_exists .bkit/.env`) as a template; this repo carries its own copy. Canonical local secrets: `.bkit/.env` (gitignored), auto-loaded via direnv on every `cd`.

```bash
# One-time per machine
brew install direnv
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc && source ~/.zshrc   # zsh; bash: ~/.bashrc

# One-time per repo clone
cp .bkit/.env.example .bkit/.env   # fill BKIT_GH_TOKEN, BKIT_LINEAR_API_KEY (+ optional BKIT_ANTHROPIC_API_KEY / BKIT_CURSOR_API_KEY)
direnv allow                            # trust .envrc; auto-loads on subsequent cd

# Verify
echo "len=${#BKIT_GH_TOKEN}"                 # non-zero → MCP token loaded; gh CLI uses `gh auth login` keyring
```

`LINEAR_ISSUE_ID` — per-session cloud injection; never in `.bkit/.env`. Cloud sessions set the same variable names in their dashboards, not this file.

## Bootstrap

```bash
pnpm install --frozen-lockfile                                          # workspace deps + husky git hooks
pnpm tsx .bkit/core/engine/cli.ts install --claude --cursor --typescript  # dogfood install (this repo only)
pnpm tsx .bkit/core/engine/cli.ts check                                # drift gate
vale sync                                                               # one-off; pulls lint:prose styles
```

`install` requires ≥1 module flag, because bare `install` exits 1. `bkit upgrade` is flag-free; re-renders every installed module.

Consumer repos: `pnpm add -D @cbartens/bkit && pnpm exec bkit install --claude --cursor --typescript` (not the dogfood call).

## Verify

Single package — no turbo / affected-graph. Run scripts directly:

```bash
pnpm bkit:gate:static-unit   # pre-push gates (docs/deployments.md § Pre-push checklist)
pnpm bkit check              # drift gate
pnpm bkit:check:dist         # dist freshness (source-repo only)
pnpm exec bkit doctor        # token + advisory sweep (read-only, never fails)
```

## Troubleshooting

- **`bkit check` reports `.bkit/version` drift** — `pnpm add -D @cbartens/bkit@<new>` without `pnpm exec bkit install`. Re-run install; commit resync.
- **Linear preflight blocks session** — issue missing `bkit:auto` or in `Done` / `Cancelled`. Add `bkit:auto`, set non-terminal state. (All labels use `bkit:` prefix.)
- **Lockfile rebase conflict in workflow** — Tier 2 auto-resolver `bkit branches rebase` takes the rebase target's copy and regenerates it (pnpm, npm, yarn, bun, cargo, go, uv); see `.bkit/workflows.md` § Rebase Conflict Tiering.
- **Cloud snapshot stuck on stale vale (Claude)** — bump `# cache-bust YYYY-MM-DD-N` in setup script to force rebuild.
