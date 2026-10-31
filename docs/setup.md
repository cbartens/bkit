<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

# Setup

> [!CAUTION]
> **Purpose:** Local development setup for humans: CLIs, configuration, secrets and troubleshooting.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Local seed / test fixtures must NEVER run against remote projects.

## Templates

Templates are optional. You copy and own them, and bkit never installs them. The catalog and install steps are in `.bkit/templates.md`.

## Agent hosts

Run each host (`claude`, `opencode`, `codex`) in its own terminal window, not inside an IDE or a desktop app.

- Separate processes let you restart one host without quitting the others.
- Terminal sessions inherit the direnv-loaded `.bkit/.env`. GUI-launched apps do not (`.bkit/providers.md` § macOS GUI-isolation).
- On macOS, use [Ghostty](https://ghostty.org).

## Remote access

This section matters mostly for the `opencode` host, because `claude` / `cursor` / `codex` ship their own mobile / desktop clients. Reach an OpenCode host terminal from another device over a private mesh VPN. Suggested services:

- [Tailscale](https://tailscale.com/), a mesh VPN. Its free Personal plan covers device-to-device access.
- [OpenLens](https://apps.apple.com/us/app/openlens-opencode-client/id6759910797), an OpenCode iOS client.

Set it up as follows:

- Bind:
  - Run `opencode service set hostname 0.0.0.0` for all interfaces, or set the tailnet IP for tailnet only.
  - Run `opencode service set port <port>`.
  - Run `opencode service start` to apply.
  - The loopback-only default keeps the service off the LAN. Tailnet ACLs still apply.
- HTTPS proxy: `tailscale serve --bg <port>` serves the port at `https://<host>.<tailnet>.ts.net`.
  - It requires tailnet HTTPS certificates to be enabled (on the DNS page).
  - It publishes machine names to the certificate-transparency log (free).
- Auth: HTTP Basic, with username `opencode`.
  - The password is in `~/.config/opencode/service.json`, mirrored at `~/.local/state/opencode/service.json`. It persists across restarts.
  - Run `opencode service set password <value>` to rotate it.
  - NEVER commit the password.
- Client CLI: `OPENCODE_PASSWORD=<password> opencode --server https://<host>.<tailnet>.ts.net`.
- Browser / app pairing: `opencode pair --url https://<host>.<tailnet>.ts.net` returns a one-time link with a 5-minute expiry.
- Pin the port. The service port is dynamic, but `serve` targets a fixed port, so pin it or the proxy breaks on restart.

<!-- bkit:end -->

> Consumer first-time install / upgrade → `.bkit/install.md`. Upgrade paste + ongoing CLI → `.bkit/README.md`. Cloud-agent setup (Claude Code on the web, Cursor Cloud Agents, Codex Cloud) → `.bkit/cloud.md`; paste-ready values → generated `.claude/bkit-cloud.md` / `.cursor/bkit-cloud.md` / `.codex/bkit-cloud.md`.

## Required tools

<!-- prettier-ignore -->
| Tool | Version | Used for |
| --- | --- | --- |
| `node` | `>=24` (matches `engines.node` / `.nvmrc`) | Runtime. |
| `pnpm` | tracks `package.json#packageManager` (single SoT) — `corepack enable`, then `pnpm install` (Corepack resolves the pinned version) | Workspace install, lint / typecheck / test gates, bkit CLI. |
| `git` | `>=2.5` | Worktree operations. |
| `gh` | latest, authenticated (`gh auth login`) | PR create / view / merge, CI run log fetch. |
| `jq` | latest | Reads the JSON that `bkit` commands print, inside workflows. |
| `vale` | `3.24.0` | Prose lint (`pnpm lint:prose`). Tarball from `errata-ai/vale` releases; cloud agents install via setup script / Dockerfile. |

## Local environment variables

bkit writes `.bkit/.env.example` (placeholders) and ships `.envrc` (`dotenv_if_exists .bkit/.env`) as a template; this repo carries its own copy. Canonical local secrets: `.bkit/.env` (gitignored), auto-loaded via direnv on every `cd`.

```bash
# One-time per machine
brew install direnv
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc && source ~/.zshrc   # zsh; bash: ~/.bashrc

# One-time per repo clone
cp .bkit/.env.example .bkit/.env   # fill BKIT_GH_TOKEN + your tracker's token (BKIT_LINEAR_API_KEY / BKIT_JIRA_API_KEY) (+ optional BKIT_ANTHROPIC_API_KEY / BKIT_CURSOR_API_KEY)
direnv allow                            # trust .envrc; auto-loads on subsequent cd

# Verify
echo "len=${#BKIT_GH_TOKEN}"                 # non-zero → MCP token loaded; gh CLI uses `gh auth login` keyring
```

`LINEAR_ISSUE_ID` — per-session cloud injection; never in `.bkit/.env`. Cloud sessions set the same variable names in their dashboards, not this file.

## Bootstrap

```bash
pnpm install --frozen-lockfile                                          # workspace deps + husky git hooks
pnpm tsx .bkit/core/engine/cli.ts install --claude --cursor  # dogfood install (this repo only)
pnpm tsx .bkit/core/engine/cli.ts check                                # drift gate
vale sync                                                               # one-off; pulls lint:prose styles
```

`install` requires >=1 module flag or `--tracker=` (which re-renders every installed host), because bare `install` exits 1. `bkit upgrade` is flag-free; re-renders every installed module.

Consumer repos: `pnpm add -D @cbartens/bkit && pnpm exec bkit install --claude --cursor` (not the dogfood call).

## Verify

Single package — no turbo / affected-graph. Run scripts directly:

```bash
pnpm bkit:gate:static-unit-integration   # pre-push gates (docs/deployments.md § Pre-push checklist)
pnpm bkit check              # drift gate
pnpm bkit:check:dist         # dist freshness (source-repo only)
pnpm exec bkit doctor        # token + advisory sweep (rewrites .bkit/advisories.md only, never fails)
```

## Troubleshooting

- **`bkit check` reports `.bkit/version` drift** — `pnpm add -D @cbartens/bkit@<new>` without `pnpm exec bkit install`. Re-run install; commit resync.
- **Linear preflight blocks session** — issue missing `bkit:auto` or in `Done` / `Cancelled`. Add `bkit:auto`, set non-terminal state. (All labels use `bkit:` prefix.)
- **Lockfile rebase conflict in workflow** — Tier 2 auto-resolver `bkit branches rebase` takes the rebase target's copy and regenerates it (pnpm, npm, yarn, bun, cargo, go, uv); see `.bkit/workflows.md` § Rebase Conflict Tiering.
- **Cloud snapshot stuck on stale vale (Claude)** — run `pnpm bkit install`, which re-stamps the `# cache-bust` line, then paste the new setup script to force a rebuild.
