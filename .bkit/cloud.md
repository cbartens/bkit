# Cloud agent environments — Claude Code on the web + Cursor Background Agents + opencode

> [!CAUTION]
> **Purpose:** Single source of truth for Claude Code on the web (mobile / web), Cursor Background Agents, and opencode cloud runners. Claude and opencode both pair with the **GitHub** tracker (via the unified `bkit-cloud.yml` file); Cursor pairs with **Linear**. They are not interchangeable per repo; pick the agent that matches your tracker (see § Cloud-agent support matrix).
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent + maintainer readers.
> - Claude's env config lives in the Claude app; Cursor's lives in `.cursor/` in-repo. Both have an in-repo SessionStart guard.
> - Update this doc when either cloud's pre-installed toolchain or default allowlist changes. Sources: `code.claude.com/docs/en/claude-code-on-the-web` + `cursor.com/docs/background-agent`.

## Scope

> **Host-delta matrix:** `.bkit/providers.md` § Runtime environment (cloud agents). That table is the canonical "what differs" reference for Claude vs Cursor cloud agents. This file = paste-in setup recipe, alignment guarantees, sharing-across-repos pattern, and caveats.

## Cloud-agent support matrix (read first)

Three cloud stacks — each agent pairs with one tracker. Pick the row for the agent you actually run:

<!-- prettier-ignore -->
| Agent (the agent, not the editor) | Ways to launch a cloud agent | Tracker | NOT supported |
| --- | --- | --- | --- |
| **Claude Code** (terminal — any IDE host) | **A)** Claude iOS / desktop app → Claude-on-web env (`.claude/hooks/cloud-bootstrap.sh` + the env defined in `claude.ai/code`) · **B)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick any phase + issue) · **C)** GitHub CI pass/fail → `bkit-cloud.yml` claude job · **D)** `@claude` mention on a GitHub issue / PR (`/install-github-app` required — **base requirement** for `cloud=claude`) | **GitHub** | **Linear** |
| **opencode** (GitHub runner) | **A)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick any phase + issue) · **B)** GitHub CI pass/fail → `bkit-cloud.yml` opencode job (requires `OPENCODE_PROVIDER_KEY` secret). Reactive `/oc` comment handler is consumer-self-installed (`opencode github install`) — not managed by bkit (mirrors `@claude`/`claude.yml` stance). | **GitHub** | **Linear** |
| **Cursor** (native agent) | **A)** Cursor's built-in cloud-agent launch · **B)** Cursor's GitHub integration on PR events (CI pass/fail) · **C)** Linear → Cursor integration | **Linear** (+ GitHub PR events) | **GitHub Projects / Issues** |

**Unified file — additive coexistence:** Claude and opencode both use a single `bkit-cloud.yml` with two separate jobs, each runtime-gated on its own secret (`ANTHROPIC_API_KEY` for claude, `OPENCODE_PROVIDER_KEY` for opencode). Both jobs can fire on the same CI event — setting both secrets runs both agents. Setting only one secret runs only that agent. Cursor stays separate (no GH Action needed; uses native Cursor triggers). **Cursor cloud ↔ Linear.**

**Manual dispatch (Claude or opencode, path A):** GitHub → **Actions** → **bkit-cloud** → **Run workflow** → pick `phase` (`ship` / `debug` / `design` / `plan` / `build`) + `issue`. This is the on-demand / smoke-test entry point for `design` / `plan` / `build`; `ship` / `debug` normally fire from CI. The dispatched `/bkit-auto` orchestrator routes to the matching phase skill, which reads its brief from the GitHub issue (MCP).

**`@claude` mention launch (Claude, path D — base requirement for `cloud=claude`):** Run `/install-github-app` (Claude Code CLI) once to install the official Claude GitHub App on your repo. This is required: `bkit-cloud.yml` grants `id-token: write` and `claude-code-action@v1` authenticates as the App via OIDC — without the App installed the action fails at boot with an OIDC error. After installation, comment `@claude /bkit-plan` (or any phase) on a GitHub issue / PR to launch it from the tracker. This is **additive**: the App's generated `claude.yml` triggers on mention events while `bkit-cloud.yml` triggers on CI completion + `workflow_dispatch`, so the two coexist without conflict. The App also gives the runner its GitHub identity for the `mcp__github__*` surface. Use `bkit install --auto=claude` (not bare `--cloud`) to install the cloud integration; `cloud=claude` requires `tracker=github`.

## What lives where (orient first)

<!-- prettier-ignore -->
| Configuration | Lives in the repo (bkit-managed) | Lives in the online dashboard (manual, one-time) |
| --- | --- | --- |
| **Claude Code on the web** | `.claude/hooks/preflight.sh` (tracker opt-in guard) + `.claude/hooks/cloud-bootstrap.sh` (per-session install — Tier 2 markered, customise outside markers) | `claude.ai/code` → environment selector → **+ Add environment**: name, **setup script** (paste from § Setup script), **environment variables** (`GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` — Claude pairs with the **GitHub** tracker, so no `LINEAR_API_KEY`), **network access** (`Trusted`) |
| **Cursor Background Agents** | `.cursor/Dockerfile` (Tier 2 markered toolchain block + consumer extensions) + `.cursor/environment.json` (consumer-owned `install` / `start` / `terminals[]` / `env`) + `.cursor/hooks.json` (wires preflight `failClosed: true`) + `.cursor/hooks/preflight.sh` (Linear guard) | Cursor → **Settings → Background Agents → Environment Variables**: `LINEAR_API_KEY`, `GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`. (`LINEAR_ISSUE_ID` injected per-session by the integration — don't hardcode.) |

**Rule of thumb:** if it's an env var or auth token, it goes in the online dashboard (out of git). If it's a script / Dockerfile / install hook, it lives in the repo.

**Alignment guarantees bkit enforces:**

- Same vale version (3.9.1) pre-installed on both clouds.
- pnpm via corepack on both. Pastes pre-warm bkit's pin (`10.34.3`), but corepack resolves **each repo's own `packageManager`** in-repo — one setup script serves any pnpm pin; the pre-warm version is not load-bearing.
- gh CLI on both: the web setup script installs the latest binary (same `github.com` release-download style as vale); the GitHub-Actions runner ships it pre-installed. Auth is shared via `cloud-bootstrap.sh` (`gh auth login --with-token` with `GH_BKIT_TOKEN`, skipped when `GITHUB_TOKEN` already auths on the runner).
- Same opt-in-guard pattern — an opt-in label `bkit:auto` — wrapped in `<!-- bkit:start --> ... <!-- bkit:end -->` so it stays bkit-managed in consumer repos. The label is `bkit:auto` on both trackers (Linear's bare `Auto` migrates to `bkit:auto`).

## Background

Both clouds run Ubuntu 24.04 (4 vCPU / 16 GB RAM / 30 GB disk class). Pre-installed inventories differ:

<!-- prettier-ignore -->
| Pre-installed | Claude Code on the web | Cursor Background Agents (after bkit Dockerfile) |
| --- | --- | --- |
| Node | 20 + 22 | 24 (matches `.nvmrc` + CI; bump in lockstep) |
| Package manager | pnpm + bun (latest) | pnpm (corepack-pinned in `.cursor/Dockerfile`; each repo's `packageManager` honored in-repo) |
| Python | Yes + ruff | Yes (system `python3` only) |
| Databases | Postgres 16, Redis 7 | Not installed (add to Dockerfile if needed) |
| Docker | Yes (host engine) | N/A — we are inside Docker |
| Utilities | git, jq, ripgrep | git, jq |
| `gh` CLI | **Not pre-installed** — setup script adds it | Added via Dockerfile |
| `vale` | **Not pre-installed** — setup script adds 3.9.1 | Added via Dockerfile (3.9.1) |
| Playwright | Not pre-installed | Chromium installed (drop the line in your fork if unused) |

The two halves of customisation:

- **Cloud-side install** (one-time, cached): Claude → setup script in app. Cursor → `.cursor/Dockerfile`.
- **Repo-side install** (per-session, lockfile-aware): Claude → `.claude/hooks/cloud-bootstrap.sh`. Cursor → `.cursor/environment.json` `install` field.

# Claude Code on the web

> [!TIP]
> **No manual copy needed.** `bkit install --claude` writes `.claude/cloud.md` — this recipe with your repo's env-var **values resolved from `.envrc`** (its `unset`s dropped, `ANTHROPIC_API_KEY` omitted to protect subscription billing). Open that file and paste each block into the Claude app. It is gitignored (holds real secrets) and regenerates on every install and upgrade. The reference below documents each field it fills.

## Where config lives

Open `claude.ai/code` → environment selector → **+ Add environment**. The three configurable surfaces are setup script (bash, runs as root once, snapshotted), environment variables (`.env` format, plaintext, visible to anyone with edit access), and network access (`None` / `Trusted` / `Full` / `Custom`).

## In-repo side

- `.claude/hooks/preflight.sh` — Tracker opt-in guard. Skips silently when the tracker issue ID env var is unset (i.e. IDE sessions). Non-zero exit is informational only on Claude (`SessionStart` cannot block); the agent reads the `HARD STOP` text from `additionalContext`.
- `.claude/hooks/cloud-bootstrap.sh` — writes the GH Packages auth token to pnpm's user-level config (from the `GH_BKIT_TOKEN_INSTALL` env var) as belt-and-braces, then runs `pnpm install --frozen-lockfile` and `vale sync` when `CLAUDE_CODE_REMOTE=true`. No-op locally. Set `GH_BKIT_TOKEN_INSTALL` in the cloud dashboard env.
- Both registered in `.claude/settings.json` under `hooks.SessionStart`.

Ships with the repo — you don't paste these into the app.

## What to paste into the Claude app

### Name

Name the environment **after the repo** — one env per repo, so secrets stay isolated (§ Sharing across repos). The setup script is identical across repos.

Identical across repos: **setup-script body**, **network policy**, bkit **baseline token names** (`GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`) — only values change. Everything else in the env-vars box is **this repo's own**, copied from its env-var files per `.envrc` (§ Environment variables).

### Network access

`Trusted` (default). The default allowlist covers npm, GitHub Packages, the vale release tarball on `objects.githubusercontent.com`, Docker Hub, and PyPI. No custom domains required.

### Environment variables

Minimum:

```
GH_BKIT_TOKEN=<fine-grained PAT — see permissions below>
GH_BKIT_TOKEN_INSTALL=<classic PAT with read:packages>
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70
```

Claude pairs with the **GitHub** tracker (see § Cloud-agent support matrix), so no `LINEAR_API_KEY` / `LINEAR_ISSUE_ID`. Set `GH_BKIT_TOKEN` for the GitHub MCP server; authenticate `gh` via `gh auth login --with-token` in a bootstrap hook (env vars are not visible during the setup script — see § Notes).

Optional (debug-fetch — only if you use the `.agents/config.md` blocks; the tokens below are **examples**, set whatever operator creds YOUR enabled blocks need. These are cloud-dashboard entries, not `.bkit/.env` — that file is bkit/agent tooling only. Non-secret selectors such as `VERCEL_SCOPE` / `SUPABASE_PROJECT_ID` commit directly in your copied block so cloud agents inherit them without a dashboard entry. The CLIs the blocks call install automatically from each block's `debug-fetch:provision` sibling):

```
VERCEL_TOKEN=<Vercel access token — https://vercel.com/account/settings/tokens>
SUPABASE_ACCESS_TOKEN=<Supabase Management API token — https://supabase.com/dashboard/account/tokens>
```

Release-only:

```
GITHUB_TOKEN=<classic PAT with write:packages + repo>
```

#### `GH_BKIT_TOKEN` — fine-grained PAT permissions

Use a **fine-grained** PAT scoped to the repo you'll work on (or each consumer repo, comma-separated). Mandatory expiry, repo-scoped blast radius — wins given env vars are plaintext.

<!-- prettier-ignore -->
| Permission | Level | What it unlocks |
| --- | --- | --- |
| Contents | Read & write | `git push`, branch creation |
| Pull requests | Read & write | `gh pr create / view / merge / comment` |
| Issues | Read & write | `gh issue` |
| Actions | Read & write | `gh run view` logs, `gh workflow run` |
| Workflows | Read & write | `gh workflow` (edit `.github/workflows/*`) |
| Projects (org) | Read & write | GitHub Projects v2 board status sync (`bkit.githubProject`) — org-owned boards only; see note |
| Metadata | Read | mandatory, auto-included |

`gh` does **not** read `GH_BKIT_TOKEN` — pipe it once after session start: `printf '%s' "$GH_BKIT_TOKEN" | gh auth login --with-token` (e.g. in `.claude/hooks/cloud-bootstrap.sh`). Locally, use `gh auth login` and leave `GH_TOKEN` unset so the keyring is not overridden (#287).

> **Projects v2 board sync (`bkit.githubProject`):** the **Projects** permission is an **Organization** permission (table row above) — it only appears when the token's **resource owner is the org**, _not_ your personal account, and the org may require the token to be **approved**. It lives under the token UI's **Organizations** tab, not Repository permissions, and governs `…/orgs/{org}/projectsV2/…`. User-owned (personal-account) boards are unreachable by fine-grained PATs entirely — see below.

#### When classic is still required

- **`pnpm publish` to GitHub Packages.** Fine-grained packages support has edge cases on user-owned packages. Put a classic PAT (`write:packages` + `repo`) in `GITHUB_TOKEN`, separate from `GH_BKIT_TOKEN`. Keep it only in release-flow sessions.
- **Cross-repo work in a single cloud session.** Fine-grained PATs only see their allowlist; classic sees everything your user can.
- **User-owned (personal-account) Projects v2 boards.** Fine-grained PATs expose Projects only as an _organization_ permission — personal boards are unreachable. Use a classic PAT with `project` scope, or move the board under an org.

#### Notes

- The Claude app warns "don't add secrets" — env vars are visible to anyone with edit rights on the environment. Personal account = just you; team account = treat as low-trust.
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` triggers auto-compaction earlier than the ~95% default — helpful on long cloud sessions.
- **Env vars set in the Claude app are NOT visible inside the setup script.** They are injected only after Claude Code starts, so they reach `SessionStart` hooks and the interactive shell but not the snapshot build. Any tool needing a token to bootstrap must inline it — exactly the leak you want to avoid. We avoid this today because vale / gh / corepack don't need auth.

### Setup script

Paste verbatim:

```bash
#!/bin/bash
set -euo pipefail

VALE_VERSION="3.9.1"
if ! command -v vale >/dev/null 2>&1; then
  cd /tmp
  curl -fsSLO --retry 3 --retry-all-errors "https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz"
  tar -xzf "vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -C /usr/local/bin vale
  chmod +x /usr/local/bin/vale
fi

apt-get update -qq && apt-get install -y --no-install-recommends gh

corepack enable && corepack prepare pnpm@10.34.3 --activate

echo "cloud env ready: $(vale --version), $(gh --version | head -1), pnpm $(pnpm -v)"
```

What this does and why it's split from the in-repo hook:

- **Vale + gh** install once into the snapshot — they are binaries the cloud lacks but your laptop already has, so they do not belong in a repo-level hook.
- **pnpm corepack pre-warm** seeds one pnpm into the snapshot. In-repo, corepack resolves that repo's own `packageManager` (fetching if it differs) — so one setup script serves any pnpm pin; the pre-warm is just a warm cache.
- `pnpm install` and `vale sync` are **not** here — they belong in `.claude/hooks/cloud-bootstrap.sh` so they re-run on resumed sessions when the lockfile or styles have drifted, and so each repo can install its own deps.

Keep total runtime under ~5 minutes or the snapshot won't build.

## Environment variables

Token management splits by session type:

- **Local sessions** — bkit seeds `.bkit/.env.example` (token placeholders) and `.envrc` (`dotenv_if_exists .bkit/.env`) on first install. Copy `.env.example` to `.bkit/.env`, fill in your tokens, then run `direnv allow`. direnv auto-exports `GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, and `LINEAR_API_KEY` into your shell whenever you enter the repo — no manual `source` or shell-rc export needed. `.bkit/.env` is gitignored; never commit it.

  ```bash
  cp .bkit/.env.example .bkit/.env
  # edit .bkit/.env — fill in GH_BKIT_TOKEN, GH_BKIT_TOKEN_INSTALL, LINEAR_API_KEY
  direnv allow
  ```

- **Cloud sessions** (Claude Code on the web, Cursor Background Agents) — the `.bkit/.env` file is not present in cloud containers. Set the same names (`GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, `LINEAR_API_KEY`) in the respective online dashboards: Claude app → environment selector → Environment variables; Cursor → Settings → Background Agents → Environment Variables. The dashboard list in the sections below is the canonical reference for which names to set.

**Beyond the bkit tokens** — populate the rest from _that repo's_ env-var files, the ones its `.envrc` sources (e.g. `.bkit/.env`, then the app's `.env.local`). Don't hand-pick from memory; **copy from those files, following `.envrc`**:

- **Drop every var `.envrc` `unset`s** — deliberately kept out of the repo's shell (e.g. prod cache creds that flip unit tests off their mock branch, or a project ref that mis-names a local stack); no place in the cloud env either.
- **Skip session-hijacking keys — notably `ANTHROPIC_API_KEY`** — redirects Claude Code's own model calls onto API-key billing, not your subscription. Same for any var that re-points the agent's own auth.
- **Values, not selectors.** Non-secret selectors (`VERCEL_SCOPE`, `SUPABASE_PROJECT_ID`, …) stay committed in-repo (§ observability / MCP blocks) — no dashboard entry needed.

## MCP issue-tracker integration

bkit wires two MCP servers into `.mcp.json` at the repo root (project-shared, read by Claude Code's `/mcp` UI). Cursor reads the same shape from `.cursor/mcp.json`. Both are **remote HTTP MCPs with OAuth-on-first-use** — no PATs, no env vars, no docker. Claude Code launches a browser auth flow the first time each server is touched, and stores the resulting token in its own secret store.

> Note: `mcpServers` declared inside `.claude/settings.json` is silently ignored by Claude Code — server definitions only take effect from `.mcp.json` (project) or `claude mcp add` (user scope). The `mcp__<name>__*` entries in `.claude/settings.json` `permissions.allow` are tool-permission allowlists, which is a different concern and remain there.

```json
"mcpServers": {
  "linear": { "type": "http", "url": "https://mcp.linear.app/mcp" },
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": { "Authorization": "Bearer ${GH_BKIT_TOKEN}" }
  }
}
```

`"type": "http"` is required — without it Claude Code defaults to stdio transport and rejects the entry for missing `command`.

- **Linear** — full Linear workspace surface (`get_issue`, `save_issue`, `save_comment`, `list_*`). Used by workflows when `bkit.issueTracker` is set to `linear`. Authenticates via OAuth (Dynamic Client Registration) — browser flow on first use, no env var needed.
- **GitHub** — official GitHub MCP server at `api.githubcopilot.com` (not gated by a Copilot subscription). Surface includes `issue_write`, `add_issue_comment`, `label_write`, `projects_write`, etc. Used by workflows under the GitHub provider. The endpoint does **not** support OAuth DCR, so authentication is via `Authorization: Bearer ${GH_BKIT_TOKEN}` (MCP-only env var — see § Environment variables and KN-CORE-8).

**Auth flow per server:**

- **Linear:** Claude Code prompts a browser authorize on first use; token stored in Claude's local secret store. No further action.
- **GitHub:** Claude Code substitutes `${GH_BKIT_TOKEN}` from the environment at session start. If `GH_BKIT_TOKEN` is unset, the server fails to connect. Set it in the shell (`export GH_BKIT_TOKEN=...`) or, for cloud sessions, in the dashboard env vars.

**`gh auth login` is required for the gh CLI surface** (PR creation, branch ops, git push). Locally, use the keyring — do not export `GH_TOKEN` from `.bkit/.env`. Cloud/headless: `cloud-bootstrap.sh` runs `printf '%s' "$GH_BKIT_TOKEN" | gh auth login --with-token` automatically at SessionStart (guarded by `gh auth status`, so it no-ops on the Actions runner where `GITHUB_TOKEN` already auths) — no manual step. Same PAT value is fine; the different env-var name keeps local `gh` on the keyring.

**Cloud sessions** (Claude on the web, Cursor Background Agents): Linear MCP runs its OAuth flow on first touch, same as local. GitHub MCP reads `GH_BKIT_TOKEN` from the dashboard env vars — make sure it's set there alongside `LINEAR_API_KEY` and `GH_BKIT_TOKEN_INSTALL`.

## After saving the Claude env

1. Trigger a session: `claude --remote "echo ready"` from the repo, or tap the env in the iOS app.
2. First session is slow (setup script runs + snapshot builds). Subsequent sessions start from the snapshot.
3. Verify in-session: `vale --version && gh --version && pnpm -v && which corepack`.
4. Snapshot rebuilds when the setup-script body changes, the allowed-hosts list changes, or the ~7-day TTL expires. Editing env vars or hook scripts in-repo does **not** invalidate the snapshot.
5. **Force a rebuild without semantic changes**: add a `# cache-bust YYYY-MM-DD-N` comment at the top of the setup script.

# Cursor Background Agents

## Where config lives

Everything sits **in the repo** under `.cursor/`. bkit ships canonical content for all four files:

<!-- prettier-ignore -->
| File | Role | bkit ownership |
| --- | --- | --- |
| `.cursor/Dockerfile` | Cloud image — vale + gh + Node 24 + pnpm (corepack-pinned) + Playwright chromium | Tier 3 seed; consumer-owned after first install |
| `.cursor/environment.json` | Build pointer + per-snapshot `install` hook (`pnpm config set …:_authToken=$GH_BKIT_TOKEN_INSTALL` + `pnpm install --frozen-lockfile` + `vale sync` if `.vale.ini`) | Tier 3 seed |
| `.cursor/hooks.json` | Wires `sessionStart` → `preflight.sh` (`failClosed: true`) | Tier 2 contained JSON |
| `.cursor/hooks/preflight.sh` | Tracker opt-in guard — `bkit:auto` label + non-terminal status. Skips silently on IDE sessions | Tier 2 contained (bkit:start/end markers) |

## How GitHub dispatch works

GitHub dispatch uses Cursor Automations "Pull request label changed" trigger — no Linear webhook needed.

**Prerequisites:** Cursor GitHub App installed on the consumer's repo or org.

**Trigger flow:**

1. `bkit-build` writes `bkit:auto` as a static label on the PR (opt-in marker). The corresponding GitHub issue must also carry the `bkit:auto` label (runtime kill switch — remove to stop dispatch).
2. A phase label (`bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`) is added to the PR by the workflow. Cursor reads this label to determine which workflow to dispatch.
3. Cursor Automations fires on "Pull request label changed" → spawns a Background Agent session against the repo.
4. `sessionStart` fires `preflight.sh`. With `failClosed: true`, a non-zero exit hard-stops the agent.
5. `GITHUB_ISSUE_ID` is injected from the PR body metadata marker `<!-- bkit:issue=#NNN -->` — the router extracts it at dispatch time.

**Constraint:** `/bkit-design` and `/bkit-plan` have no PR, so they are local-IDE-only on Cursor cloud when using the GitHub tracker. Run them locally via Claude Code or Cursor IDE.

**Required env vars (GitHub tracker):**

```
GH_BKIT_TOKEN=<fine-grained PAT — same permissions as the Claude side>
```

`GITHUB_ISSUE_ID` is injected per-session — do not hardcode. No `LINEAR_API_KEY`, `LINEAR_ISSUE_ID`, or `GH_BKIT_TOKEN_INSTALL` needed for tracker calls (MCP auth is browser OAuth; `gh` uses `gh auth login` locally or `--with-token` in cloud bootstrap).

## How Linear dispatch works

`@cursor` is **Cursor's native Linear integration**, not a bkit component — bkit does not intercept the mention or run its own Linear webhook. The spawned agent picks up bkit only because every Cursor cloud agent reads root `AGENTS.md`, which routes the `/bkit-*` slash command to the matching workflow in `.bkit/workflows/`.

1. You assign a Linear issue to **Cursor** (the integration user) or comment `@cursor /bkit-design ISSUE-NNN` — handled by Cursor's standard Linear integration.
2. Cursor receives a webhook, opens a background agent against your repo with `is_background_agent: true` and `LINEAR_ISSUE_ID` set.
3. `sessionStart` fires `preflight.sh`. With `failClosed: true`, a non-zero exit hard-stops the agent before it can do work.
4. Preflight skips on IDE sessions (`is_background_agent !== true`), so local Cursor IDE work is unaffected.

## Required env vars (Cursor side)

Set these in the Cursor Background Agent settings (UI: Cursor → Settings → Background Agents → Environment Variables), **not** in `.cursor/environment.json`:

```
LINEAR_API_KEY=<Linear personal API key — preflight.sh calls the GraphQL API>
GH_BKIT_TOKEN=<fine-grained PAT — same permissions as the Claude side>
GH_BKIT_TOKEN_INSTALL=<classic PAT with read:packages — consumer repos only>
```

`LINEAR_ISSUE_ID` is injected per-session by the Cursor / Linear integration — do not hardcode.

Optional (debug-fetch — only if you use the `.agents/config.md` blocks; the tokens below are **examples**, set whatever operator creds YOUR enabled blocks need. These are cloud-dashboard entries, not `.bkit/.env` — that file is bkit/agent tooling only. Non-secret selectors such as `VERCEL_SCOPE` / `SUPABASE_PROJECT_ID` commit directly in your copied block so cloud agents inherit them without a dashboard entry. The CLIs the blocks call install automatically from each block's `debug-fetch:provision` sibling):

```
VERCEL_TOKEN=<Vercel access token — https://vercel.com/account/settings/tokens>
SUPABASE_ACCESS_TOKEN=<Supabase Management API token — https://supabase.com/dashboard/account/tokens>
```

## After modifying `.cursor/*`

1. Run `pnpm bkit install` (in this repo) or `pnpm install && pnpm bkit install` (consumer) to regenerate mirrors.
2. Commit the changes.
3. **First Cursor session after Dockerfile changes is slow** — the image rebuilds. Subsequent sessions reuse the cached layers.
4. To verify in-session: `vale --version && gh --version && pnpm -v && python3 --version`.

# Sharing across repos

## Claude — one environment per repo

Give each repo its **own** Claude environment, named after the repo. The reason is **secrets, not mechanics**:

**Secrets are per-repo.** App tokens (Supabase, Stripe, Vercel, …) differ per repo and mostly aren't shared; even the bkit tokens differ in _scope_ (`GH_BKIT_TOKEN` is a fine-grained PAT scoped to just that repo). A Claude environment holds one value per name — so a single shared env forces either one mega-scoped PAT across every repo (wide blast radius, re-issued on each new repo) or one repo's secrets leaking into the rest. Per-repo envs keep each repo's secrets to that repo.

Shared across repos (copy, don't re-derive) — everything non-secret:

- **Setup script** — installs only generic binaries (vale, gh, pnpm via corepack); repo-specific install is deferred to each repo's committed `cloud-bootstrap.sh` (its lockfile drives `pnpm install`, its `.vale.ini` drives `vale sync`). One body fits every repo, bkit dogfood included.
- **bkit baseline token _names_** (`GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`) + **network policy** (`Trusted`) — same everywhere, only values differ. A repo's _other_ env vars are **not** shared: copy from its own env files per `.envrc` — drop its `unset`s, skip `ANTHROPIC_API_KEY` (§ Environment variables).
- **Non-secret selectors** (`VERCEL_SCOPE`, `SUPABASE_PROJECT_ID`) stay committed in-repo (§ Environment variables), never in the dashboard.

## Cursor — byte-identical Dockerfile

Cursor's environment-resolution order is: (1) `.cursor/environment.json` in the repo, (2) a personal saved environment in your Cursor account, (3) a team saved environment. Three viable sharing patterns follow from that precedence:

1. **In-repo Tier 2 markered (bkit default).** Each consumer repo carries `.cursor/Dockerfile` + `.cursor/environment.json`. bkit owns the toolchain block inside `# <!-- bkit:start -->` / `# <!-- bkit:end -->` markers; consumers customise outside. Result: functionally equivalent Cursor envs across all consumer repos, with bkit able to ship base-toolchain updates without trampling consumer changes.
2. **Personal saved environment (cross-repo).** Don't commit `.cursor/environment.json` to any repo and configure a single environment in the Cursor account-level dashboard. Cursor falls back to it for any session. Like any cross-repo environment it holds one secret set for all repos — prefer the per-repo default (#1) whenever repos have distinct secrets.
3. **Multi-repo environment.** Cursor supports binding one environment to multiple selected repositories that get cloned into the same agent VM. Useful for cross-repo work but the agent sees all selected repos at once — different security boundary.

When bkit's reference Dockerfile changes (e.g. vale version bump):

- Consumer's `.cursor/Dockerfile` is **not** auto-overwritten (Tier 3 seed-only).
- `pnpm bkit install` prints the new reference with merge instructions.
- Consumer merges manually (or deletes their copy and lets bkit re-seed if they have no local edits).

## What every consumer repo needs to do

1. `pnpm bkit install` — picks up bkit-managed toolchain updates inside the `# <!-- bkit:start -->` / `# <!-- bkit:end -->` blocks of `.cursor/Dockerfile` and `.claude/hooks/cloud-bootstrap.sh` without touching consumer customisations outside the markers.
2. Set `LINEAR_API_KEY`, `GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL` in Cursor → Settings → Background Agents → Environment Variables.
3. Add a Claude environment **named after the repo** at `claude.ai/code` and paste the recipe from § Claude Code on the web (one environment per repo — secrets are per-repo).
4. Customise `.cursor/Dockerfile` Node major / Playwright / extra system deps **outside** the bkit-managed block; the file is byte-stable for bkit's bytes inside the markers, fully consumer-owned outside.

# Post-CI auto-routing

After `bkit-build` Step 18 close-workflow pushes its CI-trigger commit (`chore({FID}): close-workflow`, no skip tags) and exits, the post-CI router decides ship vs. debug and dispatches the matching skill in a fresh cloud session — no operator action between CI completion and the dispatched session starting.

The routing **logic** lives in a single bkit-managed slash-command orchestrator (`.bkit/workflows/bkit-auto.md`, mirrored to `.claude/commands/bkit-auto.md` + `.cursor/commands/bkit-auto.md` on each `pnpm bkit install`). The routing **trigger** is wired separately per IDE because the two clouds use different event surfaces.

## What lives where (post-CI half)

<!-- prettier-ignore -->
|  | Lives in the repo (bkit-managed) | Lives in the online dashboard / GitHub (manual, one-time) |
| --- | --- | --- |
| **Claude** | `.github/workflows/bkit-cloud.yml` — `claude` job (opt-in via `bkit install --auto=claude`; GitHub-tracker only). Two-tier gate: (1) free tier — job `if: contains(head_commit.message, 'bkit [auto route]')` (zero runner minutes for non-opted-in commits); (2) cheap tier — in-job `gh issue view {ISSUE} --json labels` re-checks `bkit:auto` (live kill switch); then dispatches `claude-code-action@v1` as the Claude GitHub App (OIDC, `id-token: write`). | GitHub repo secret: `ANTHROPIC_API_KEY`. Claude GitHub App required (`/install-github-app`). The linked **GitHub issue** must carry `bkit:auto`. |
| **opencode** | Same `.github/workflows/bkit-cloud.yml` — `opencode` job (opt-in via `bkit install --auto=opencode`; GitHub-tracker only). Same two-tier gate (same file, separate job). Dispatches via `opencode run "/bkit-auto $PHASE $ARG"`. No `id-token: write` — no OIDC; uses `github.token` for repo ops. | GitHub repo secret: `OPENCODE_PROVIDER_KEY` (set to your provider API key — NVIDIA NIM). Provider model committed in `.opencode/opencode.json`. The linked **GitHub issue** must carry `bkit:auto`. |
| **Cursor** | Nothing — Cursor cloud agents have native triggers. | Cursor → Cloud Agents dashboard → Triggers → + Add trigger. Event: CI workflow completion on `feat/**` branches. Prompt (paste **literally**, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`. Concurrency: latest-supersedes. |

**Why the dashboard prompt never needs re-pasting:** Cursor substitutes `$CI_STATUS` and `$PR_NUMBER` from the event payload at dispatch time. The pasted string is generic and timeless. When bkit's routing logic evolves (new edge cases, new gates), only the mirrored `.cursor/commands/bkit-auto.md` changes — the dashboard config is untouched.

## Cursor dashboard — exact paste

```
/bkit-auto $CI_STATUS $PR_NUMBER
```

## Claude — required GitHub Actions permissions

Flip **both** org and repo before the first router run, otherwise `actions/checkout@v4` 403s with `Write access to repository not granted`. The workflow declares `permissions: contents: write` at workflow scope, but the org/repo "Workflow permissions" ceiling overrides it — repo cannot exceed org.

- **Org**: `https://github.com/organizations/{ORG}/settings/actions` → Workflow permissions → **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.
- **Repo**: `https://github.com/{ORG}/{REPO}/settings/actions` → same section, same two settings. Apply at the repo too — inheriting from org is not automatic.

`workflow_run`-triggered runs do **not** inherit the parent CI workflow's `permissions:` block (only fork-PR tokens get narrowed), so the parent CI staying at `contents: read` is fine.

## bkit-cloud.yml — required GitHub repo secrets

<!-- prettier-ignore -->
| Secret | Job | Why | Scope |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | `claude` | `claude-code-action@v1` authenticates against Anthropic. | API key with Claude Code access. |
| `OPENCODE_PROVIDER_KEY` | `opencode` | Fanned out to every cloud provider's env var name (`NVIDIA_API_KEY`, `GROQ_API_KEY`, `CEREBRAS_API_KEY`, `OPENROUTER_API_KEY`, `OLLAMA_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider is installed. | Provider API key for whichever provider you configured. |

Each job is independently gated on its own secret. Set only `ANTHROPIC_API_KEY` → only the claude job runs. Set only `OPENCODE_PROVIDER_KEY` → only the opencode job runs. Set both → both jobs run (additive coexistence). **No `LINEAR_API_KEY`** — `bkit-cloud.yml` is GitHub-tracker only for both jobs. The workflow grants `id-token: write` per-job for claude only (opencode does not use OIDC).

Neither job needs `GH_BKIT_TOKEN_INSTALL`. The slash command body is already in the checked-out repo (mirrored to `.claude/commands/bkit-auto.md` and `.opencode/commands/bkit-auto.md` at dev time via `bkit install`). Repo git/gh operations use the auto-provided `github.token` scoped by the workflow's `permissions:` block.

## Routing decision (router orchestrator)

The slash command takes two args: `$CI_STATUS` ∈ `{success, failure, pass, fail}` (normalised) and `$PR_NUMBER`. It then:

1. Reads `gh pr view $PR_NUMBER` for `headRefName`, `headRefOid`, `state`. Refuses non-OPEN PRs.
2. Extracts `{FID}` from the head branch (`feat/{FID}` convention).
3. Stale-run guard: compares the latest CI run's `headSha` against the PR's current `headRefOid`. Skips on mismatch (newer commit already in flight).
4. Opt-in gate: refuses to dispatch unless the linked GitHub issue carries the `bkit:auto` label.
5. Appends a `bkit-auto → /bkit-{ship,debug}` line to the GitHub issue / PR comment thread.
6. Invokes `/bkit-ship {FID}` (CI pass) or `/bkit-debug {FID} DEBUG_MODE=pr` (CI fail) via the `Skill` / `Task` tool. The dispatched skill owns its session lifecycle from there.

Skip conditions emit a single GitHub-comment no-op line and exit 0 — only real failures (missing args, GitHub API unreachable, malformed state) take the Failure Path.

## Operating notes

- **Loop bound:** `/bkit-debug` enforces `MAX_DEBUG_ATTEMPT = 3` internally; the router never counts attempts. After three red CI runs, debug fires its handover path and stops dispatching.
- **GHA 6 h cap:** `3 x ~3600s` per debug attempt = well under the GHA runner ceiling. Ship is short.
- **Concurrency:** the GHA workflow uses `cancel-in-progress: true`; the Cursor dashboard trigger should be set to "latest-supersedes." Ship squash-merge is atomic, so mid-run cancels cannot corrupt PR state.
- **Both clouds together:** there's nothing stopping both Claude and Cursor from dispatching against the same PR — they'd race. Pick one IDE per repo as the auto-router (recommended: Claude via GHA, since it's runner-resident and Anthropic-maintained). Leave Cursor for ad-hoc Linear-dispatch work.

# Caveats (both clouds)

- **No secrets store yet (Claude).** Env vars and setup-script body are plaintext in the Claude app. Rotate PATs regularly.
- **Env vars do not reach the Claude setup script.** Any auth needed at snapshot-build time has to be inlined — exactly the leak you want to avoid. Design around it: install only public binaries in the setup script; defer auth-bearing work to the SessionStart hook.
- **Cache invalidation is body-based (Claude).** Editing the env-vars block or repo-side hook scripts doesn't trigger a rebuild. Use a `# cache-bust YYYY-MM-DD-N` comment to force one.
- **Husky runs on `pnpm install`.** The `prepare` script registers git hooks during the install. Pre-commit hooks (`lint-staged`, `lint:prose`, `lint:slop`) then run when the agent commits. `slop-scan` is a devDep so `pnpm install` puts it on PATH via `node_modules/.bin`; `vale` is a system binary so it has to come from the setup script (Claude) or Dockerfile (Cursor).
- **Bun proxy issues (Claude).** Bun has known proxy issues with the cloud's security proxy. bkit uses pnpm so this doesn't hit us; flag for consumers on bun.
- **Custom base image not supported (Claude).** Escape hatch is `docker compose` sidecars. Not needed for bkit's stack today.
- **Cursor image cache is layer-based.** Reorder `RUN` lines in the Dockerfile carefully — moving a frequently-changing line above a slow one invalidates the cache below it.
- **GitHub App vs `/web-setup` (Claude).** Auto-fix PRs require the GitHub App. `/web-setup` (sync `gh` token to your Claude account) is enough for cloning + pushing but not for auto-fix.
- **IP allowlists** on org GitHub / Anthropic accounts will block cloud sessions — contact support to exempt their managed infra.
- **pnpm `.npmrc` substitution.** Use `${VAR}` only, never `${VAR:-default}` — pnpm does not parse POSIX fallback and sends no auth → 401 on `@cbartens/bkit`. Affects both clouds equally.

# Decision log

## opencode provider host

**Superseded premise:** The original SP5 out-of-scope note classified opencode as a separate file (`opencode-cloud.yml`) or a separate CLI flag path. The opencode host was considered a "phase 2 post-PR" addition.

**Decision: additive / unified-file.** Both the claude and opencode CI dispatch jobs live in a single `bkit-cloud.yml`. The two jobs are independently runtime-gated on their own secret (`ANTHROPIC_API_KEY` for claude, `OPENCODE_PROVIDER_KEY` for opencode), so a consumer with only one secret gets exactly one running job. Both can coexist in one repo by setting both secrets.

**Rationale:**

- One file = one Renovate `ignorePaths` entry, one audit surface, one template write.
- Runtime-gated jobs are idempotent — adding the second job to an existing claude install is a no-op until the consumer adds the secret.
- The opencode job dispatches via `opencode run "/bkit-auto $PHASE $ARG"` (headless; no comment event). Provider model and config live in `.opencode/opencode.json` (committed, from `bkit install --opencode=<provider>`). The single `OPENCODE_PROVIDER_KEY` secret is fanned out to all known provider env var names so the config's `${VAR}` reference resolves regardless of provider.
- The cloud workflow file rename (previous name → `bkit-cloud.yml`) is the only consumer-visible breaking change; the upgrade path removes the old file automatically.

# Sources

- Anthropic docs: <https://code.claude.com/docs/en/claude-code-on-the-web>
- Cursor Background Agents: <https://cursor.com/docs/background-agent>
- Zenn article on Claude env-var/setup-script gotcha: <https://zenn.dev/harieshokunin/articles/b1064354319ce2?locale=en>
- Managed Agents environments (separate product, similar shape): <https://platform.claude.com/docs/en/managed-agents/environments>
