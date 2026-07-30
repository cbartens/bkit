# Cloud agent environments — Claude Code on the web + Cursor Cloud Agents + opencode

> [!CAUTION]
> **Purpose:** Canonical reference for Claude Code on the web (mobile/web), Cursor Cloud Agents, and opencode cloud runners. Claude + opencode → **GitHub** tracker (unified `bkit-cloud.yml`); Cursor → **Linear**. Not interchangeable per repo — pick agent matching your tracker (see § Cloud-agent support matrix).
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent + maintainer readers.
> - Claude env config → Claude app; Cursor → `.cursor/` in-repo. Both have in-repo SessionStart guard.
> - Update when either cloud's pre-installed toolchain or default allowlist changes. Sources: `code.claude.com/docs/en/claude-code-on-the-web` + `cursor.com/docs/cloud-agent/setup`.

## Scope

> **Host-delta matrix:** `.bkit/providers.md` § Runtime environment (cloud agents). Canonical "what differs" for Claude vs Cursor cloud agents. This file = paste-in setup recipe, alignment guarantees, sharing-across-repos pattern, caveats.

## Cloud-agent support matrix (read first)

Three cloud stacks — each agent pairs with one tracker. Pick row for agent you run:

<!-- prettier-ignore -->
| Agent (the agent, not the editor) | Ways to launch a cloud agent | Tracker | NOT supported |
| --- | --- | --- | --- |
| **Claude Code** (terminal — any IDE host) | **A)** Claude iOS / desktop app → Claude-on-web env (`.claude/hooks/cloud-bootstrap.sh` + the env defined in `claude.ai/code`) · **B)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick any phase + issue) · **C)** GitHub CI pass/fail → `bkit-cloud.yml` claude job · **D)** `@claude` mention on a GitHub issue / PR (`/install-github-app` required — **base requirement** for `cloud=claude`) | **GitHub** | **Linear** |
| **opencode** (GitHub runner) | **A)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick any phase + issue) · **B)** GitHub CI pass/fail → `bkit-cloud.yml` opencode job (requires `OPENCODE_PROVIDER_KEY` secret) · **C)** reactive `/oc` comment handler (self-installed, not bkit — see § Reactive comment handlers) | **GitHub** | **Linear** |
| **Cursor** (native agent) | **A)** Cursor's built-in cloud-agent launch · **B)** Cursor's GitHub integration on PR events (CI pass/fail) · **C)** Linear → Cursor integration | **Linear** (+ GitHub PR events) | **GitHub Projects / Issues** |

**Unified file — additive coexistence:** Claude + opencode share one `bkit-cloud.yml` with two jobs, each runtime-gated on its secret (`ANTHROPIC_API_KEY` claude, `OPENCODE_PROVIDER_KEY` opencode). Both jobs can fire on same CI event — both secrets → both agents; one secret → one agent. Cursor separate (no GH Action; native triggers). **Cursor cloud ↔ Linear.**

**Manual dispatch (Claude or opencode, path A):** GitHub → **Actions** → **bkit-cloud** → **Run workflow** → `phase` (`ship` / `debug` / `design` / `plan` / `build`) + `issue`. On-demand/smoke-test for `design` / `plan` / `build`; `ship` / `debug` normally CI-fired. Dispatched `/bkit-auto` orchestrator → matching phase skill → brief from GitHub issue (MCP).

### Reactive comment handlers (`claude.yml` + `opencode.yml`) — separately managed, NOT bkit

`.github/workflows/claude.yml` (the `@claude` handler) and `.github/workflows/opencode.yml` (the `/oc` handler) are **not bkit's**. Each is generated — and re-generated — by its own vendor tool; bkit ships **no template** for either, and `bkit install` / `upgrade` never writes, rewrites, or drift-gates them (both are absent from the bkit manifest). They coexist **additively** with bkit's own `bkit-cloud.yml` (the CI-completion + `workflow_dispatch` lane, which _is_ bkit-managed): a comment fires the vendor handler; a CI run fires `bkit-cloud.yml`.

<!-- prettier-ignore -->
| Reactive handler (not bkit) | Installed by (vendor tool) | Auth | Launch a bkit phase |
| --- | --- | --- | --- |
| `.github/workflows/claude.yml` | `/install-github-app` (Claude Code CLI → official Claude GitHub App) | OIDC as the App (`bkit-cloud.yml` grants `id-token: write`; no App installed → OIDC error at boot) | comment `@claude /bkit-plan` (or any phase) on an issue / PR |
| `.github/workflows/opencode.yml` | `opencode github install` (opencode CLI) | your provider key (`OPENCODE_API_KEY` / `NVIDIA_API_KEY` / etc.) — no App, no OIDC | comment `/oc` or `/opencode` on an issue / PR |

**You maintain these files — bkit does not.** `opencode.yml` hardcodes a `model:` + provider-secret `env:`; keep both in sync with your installed opencode provider. `bkit check` + postinstall raise a non-fatal advisory when they drift (hand-fix — bkit will not rewrite the file). No equivalent check for `claude.yml` (its `@claude` handler is provider-fixed to Claude). For Claude, the `@claude` path is the **base requirement** for `cloud=claude` — enable with `bkit install --auto=claude` (GitHub tracker only); the App also gives the runner a GitHub identity for the `mcp__github__*` surface.

## What lives where (orient first)

<!-- prettier-ignore -->
| Configuration | Lives in the repo (bkit-managed) | Lives in the online dashboard (manual, one-time) |
| --- | --- | --- |
| **Claude Code on the web** | `.claude/hooks/preflight.sh` (tracker opt-in guard) + `.claude/hooks/cloud-bootstrap.sh` (per-session install — Tier 2 markered, customise outside markers) | `claude.ai/code` → environment selector → **+ Add environment**: name, **setup script** (paste from § Setup script), **environment variables** (`GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` — Claude pairs with the **GitHub** tracker, so no `LINEAR_API_KEY`), **network access** (`Trusted`) |
| **Cursor Cloud Agents** | `.cursor/Dockerfile` (Tier 2 markered toolchain block + consumer extensions) + `.cursor/environment.json` (consumer-owned `install` / `start` / `terminals[]` / `env`) + `.cursor/hooks.json` (wires preflight `failClosed: true`) + `.cursor/hooks/preflight.sh` (Linear guard) | Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents`) → your environment → **Secrets** tab, as **Runtime Secret**s: `LINEAR_API_KEY`, `GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`. (`LINEAR_ISSUE_ID` injected per-session by the integration — don't hardcode.) |

**Rule of thumb:** env vars / auth tokens → online dashboard (out of git). Scripts / Dockerfile / install hooks → repo.

**Alignment guarantees bkit enforces:**

- Same vale version (3.9.1) pre-installed on both clouds.
- pnpm via corepack on both. Pastes pre-warm bkit's pin (`10.34.3`), but corepack resolves **each repo's own `packageManager`** in-repo — one setup script serves any pnpm pin; pre-warm version not load-bearing.
- gh CLI on both: web setup script installs latest binary (same `github.com` release-download style as vale); GitHub-Actions runner ships pre-installed. Auth shared via `cloud-bootstrap.sh` (`gh auth login --with-token` with `GH_BKIT_TOKEN`, skipped when `GITHUB_TOKEN` already auths on runner).
- Same opt-in-guard pattern — opt-in label `bkit:auto` — wrapped in `<!-- bkit:start --> ... <!-- bkit:end -->` (bkit-managed in consumer repos). Label `bkit:auto` on both trackers (Linear's bare `Auto` migrates to `bkit:auto`).

## Background

Both clouds run Ubuntu 24.04 (4 vCPU / 16 GB RAM / 30 GB disk class). Pre-installed inventories differ:

<!-- prettier-ignore -->
| Pre-installed | Claude Code on the web | Cursor Cloud Agents (after bkit Dockerfile) |
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

Two halves of customisation:

- **Cloud-side install** (one-time, cached): Claude → setup script in app. Cursor → `.cursor/Dockerfile`.
- **Repo-side install** (per-session, lockfile-aware): Claude → `.claude/hooks/cloud-bootstrap.sh`. Cursor → `.cursor/environment.json` `install` field.

# Claude Code on the web

> [!TIP]
> **No manual copy needed.** `bkit install --claude` writes `.claude/cloud.md` — this recipe with repo env-var **values resolved from `.envrc`** (`unset`s dropped, `ANTHROPIC_API_KEY` omitted to protect subscription billing). Open file, paste each block into Claude app. Gitignored (holds real secrets); regenerates on every install and upgrade. Reference below documents each field it fills.

## Where config lives

Open `claude.ai/code` → environment selector → **+ Add environment**. Three surfaces: setup script (bash, root, once, snapshotted), environment variables (`.env` format, plaintext, visible to anyone with edit access), network access (`None` / `Trusted` / `Full` / `Custom`).

## In-repo side

- `.claude/hooks/preflight.sh` — Tracker opt-in guard. Skips silently when tracker issue ID env var unset (IDE sessions). Non-zero exit informational only on Claude (`SessionStart` cannot block); agent reads `HARD STOP` text from `additionalContext`.
- `.claude/hooks/cloud-bootstrap.sh` — writes GH Packages auth token to pnpm user-level config (`GH_BKIT_TOKEN_INSTALL`), then `pnpm install --frozen-lockfile` + `vale sync` when `CLAUDE_CODE_REMOTE=true`. No-op locally. Set `GH_BKIT_TOKEN_INSTALL` in cloud dashboard env.
- Both registered in `.claude/settings.json` under `hooks.SessionStart`.

Ships with repo — don't paste into app.

## What to paste into the Claude app

### Name

Name environment **after the repo** — one env per repo, secrets isolated (§ Sharing across repos). Setup script identical across repos.

Identical across repos: **setup-script body**, **network policy**, bkit **baseline token names** (`GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`) — only values change. Rest of env-vars box is **this repo's own**, copied from env-var files per `.envrc` (§ Environment variables).

### Network access

`Custom` when repo declares `allowed-domains` block (§ Cloud allowed domains in `.agents/config.md`). Select **Custom**, tick **Also include default list of common package managers** (EXTENDS trusted defaults — package registries, GitHub, cloud SDKs — never replaces them), paste domains bkit renders into `.claude/cloud.md` § Network access into **Allowed domains**. Log-backend/API hosts repo debug-fetch blocks reach (incl. implicit hosts of CLI blocks like `vercel` / `gcloud`) plus app production + preview/dev domains — declared apex-only, expanded by `bkit install` to `<domain>` + `*.<domain>`. Under `Trusted` those hosts unreachable → cloud `/bkit-debug` gets no runtime logs; e2e can't hit deployment.

No `allowed-domains` block → `Trusted` (default) enough — covers npm, GitHub Packages, vale tarball on `objects.githubusercontent.com`, Docker Hub, PyPI. Raise to `Full` only for open-internet tasks.

### Environment variables

Minimum:

```
GH_BKIT_TOKEN=<fine-grained PAT — see permissions below>
GH_BKIT_TOKEN_INSTALL=<classic PAT with read:packages>
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70
```

Claude pairs with **GitHub** tracker (see § Cloud-agent support matrix) — no `LINEAR_API_KEY` / `LINEAR_ISSUE_ID`. Set `GH_BKIT_TOKEN` for GitHub MCP; authenticate `gh` via `gh auth login --with-token` in bootstrap hook (env vars not visible during setup script — see § Notes).

Optional (debug-fetch — only if you use `.agents/config.md` blocks; tokens below are **examples**, set whatever operator creds YOUR enabled blocks need. Cloud-dashboard entries, not `.bkit/.env` — that file is bkit/agent tooling only. Non-secret selectors (`VERCEL_SCOPE` / `SUPABASE_PROJECT_ID`) commit in copied block so cloud agents inherit without dashboard entry. CLIs install from each block's `debug-fetch:provision` sibling):

```
VERCEL_TOKEN=<Vercel access token — https://vercel.com/account/settings/tokens>
SUPABASE_ACCESS_TOKEN=<Supabase Management API token — https://supabase.com/dashboard/account/tokens>
```

Release-only:

```
GITHUB_TOKEN=<classic PAT with write:packages + repo>
```

#### `GH_BKIT_TOKEN` — fine-grained PAT permissions

Use **fine-grained** PAT scoped to target repo (or each consumer repo, comma-separated). Mandatory expiry, repo-scoped blast radius — wins given env vars are plaintext.

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

`gh` does **not** read `GH_BKIT_TOKEN` — pipe once after session start: `printf '%s' "$GH_BKIT_TOKEN" | gh auth login --with-token` (e.g. in `.claude/hooks/cloud-bootstrap.sh`). Locally, `gh auth login` and leave `GH_TOKEN` unset so keyring not overridden (#287).

> **Projects v2 board sync (`bkit.githubProject`):** **Projects** permission is **Organization** permission (table row above) — appears only when token **resource owner is the org**, _not_ personal account; org may require token **approved**. Under token UI **Organizations** tab, not Repository permissions; governs `…/orgs/{org}/projectsV2/…`. User-owned (personal-account) boards unreachable by fine-grained PATs — see below.

#### When classic is still required

- **`pnpm publish` to GitHub Packages.** Fine-grained packages support has edge cases on user-owned packages. Classic PAT (`write:packages` + `repo`) in `GITHUB_TOKEN`, separate from `GH_BKIT_TOKEN`. Release-flow sessions only.
- **Cross-repo work in single cloud session.** Fine-grained PATs only see allowlist; classic sees everything your user can.
- **User-owned (personal-account) Projects v2 boards.** Fine-grained PATs expose Projects only as _organization_ permission — personal boards unreachable. Classic PAT with `project` scope, or move board under org.

#### Notes

- Claude app warns "don't add secrets" — env vars visible to anyone with edit rights. Personal account = just you; team account = treat as low-trust.
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` triggers auto-compaction earlier than ~95% default — helpful on long cloud sessions.
- **Env vars set in Claude app are NOT visible inside setup script.** Injected only after Claude Code starts → `SessionStart` hooks + interactive shell, not snapshot build. Tool needing token to bootstrap must inline it — leak you want to avoid. Avoided today: vale / gh / corepack don't need auth.

### Setup script

`bkit install` generates copy-paste-ready setup script into `.claude/cloud.md` § Setup script — resolved for this repo, with cache-bust line, base-tool installs, any `debug-fetch:provision` recipes. **Paste that**, not hand-copied snippet: stale copy drifts (hard-pinned pnpm can seed version known to break `bkit` download; `apt install gh` unreliable — gh not in default repos).

What it does and why split from in-repo hook:

- **`# cache-bust <date>-<n>`** first line generator writes (`bkit install` / `bkit upgrade` re-stamp). Snapshot keyed on setup script exact text — only job is to change: new date (or bumped same-day counter) forces fresh snapshot on next paste, re-pulling "latest"-resolved `gh` / `gcloud` binaries and base-image drift even when rest byte-identical. Leave in place — do not hand-edit.
- **Base tools (vale, gh, jq)** install once into snapshot from upstream releases — `gh` from `cli/cli` releases redirect (not `apt`), `jq` because `curl`-based debug-fetch blocks pipe through it. Binaries cloud lacks but laptop has — not repo-level hook.
- **pnpm corepack pre-warm** seeds one pnpm into snapshot via `corepack enable` (no hard-pinned version). In-repo, corepack resolves repo's `packageManager` (fetching if differs) — one setup script serves any pnpm pin; pre-warm is warm cache.
- `pnpm install` and `vale sync` **not** here — belong in `.claude/hooks/cloud-bootstrap.sh` for resumed sessions when lockfile/styles drifted; each repo installs own deps.

Keep total runtime under ~5 minutes or snapshot won't build.

## Environment variables

Token management by session type:

- **Local sessions** — bkit seeds `.bkit/.env.example` (token placeholders) + `.envrc` (`dotenv_if_exists .bkit/.env`) on first install. Copy `.env.example` → `.bkit/.env`, fill tokens, `direnv allow`. direnv auto-exports `GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, `LINEAR_API_KEY` on repo entry — no manual `source` or shell-rc export. `.bkit/.env` gitignored; never commit.

  ```bash
  cp .bkit/.env.example .bkit/.env
  # edit .bkit/.env — fill in GH_BKIT_TOKEN, GH_BKIT_TOKEN_INSTALL, LINEAR_API_KEY
  direnv allow
  ```

- **Cloud sessions** (Claude Code on the web, Cursor Cloud Agents) — `.bkit/.env` absent in cloud containers. Set same names (`GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, `LINEAR_API_KEY`) in respective dashboards: Claude app → environment selector → Environment variables; Cursor Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents`) → your environment → **Secrets** tab (as **Runtime Secret**s). Dashboard lists in sections below = canonical reference for names.

**Beyond bkit tokens** — populate rest from _that repo's_ env-var files `.envrc` sources (e.g. `.bkit/.env`, then app `.env.local`). Don't hand-pick from memory; **copy from those files, following `.envrc`**:

- **Drop every var `.envrc` `unset`s** — deliberately kept out of repo shell (e.g. prod cache creds flipping unit tests off mock branch, or project ref mis-naming local stack); no place in cloud env.
- **Skip session-hijacking keys — notably `ANTHROPIC_API_KEY`** — redirects Claude Code model calls onto API-key billing, not subscription. Same for any var re-pointing agent's own auth.
- **Values, not selectors.** Non-secret selectors (`VERCEL_SCOPE`, `SUPABASE_PROJECT_ID`, …) stay committed in-repo (§ observability / MCP blocks) — no dashboard entry.

## MCP issue-tracker integration

bkit wires two MCP servers into `.mcp.json` at repo root (project-shared, read by Claude Code `/mcp` UI). Cursor reads same shape from `.cursor/mcp.json`. Both **remote HTTP MCPs with OAuth-on-first-use** — no PATs, no env vars, no docker. Claude Code launches browser auth on first server touch; stores token in own secret store.

> Note: `mcpServers` in `.claude/settings.json` silently ignored by Claude Code — definitions only from `.mcp.json` (project) or `claude mcp add` (user scope). `mcp__<name>__*` in `.claude/settings.json` `permissions.allow` are tool-permission allowlists — different concern, remain there.

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

`"type": "http"` required — without it Claude Code defaults to stdio transport and rejects entry for missing `command`.

- **Linear** — full Linear workspace surface (`get_issue`, `save_issue`, `save_comment`, `list_*`). Used when `bkit.issueTracker` = `linear`. OAuth (Dynamic Client Registration) — browser flow on first use, no env var.
- **GitHub** — official GitHub MCP at `api.githubcopilot.com` (not gated by Copilot subscription). Surface: `issue_write`, `add_issue_comment`, `label_write`, `projects_write`, etc. Used under GitHub provider. Endpoint does **not** support OAuth DCR → auth via `Authorization: Bearer ${GH_BKIT_TOKEN}` (MCP-only env var — see § Environment variables and KN-CORE-8).

**Auth flow per server:**

- **Linear:** Claude Code prompts browser authorize on first use; token in Claude's secret store. No further action.
- **GitHub:** Claude Code substitutes `${GH_BKIT_TOKEN}` from environment at session start. Unset → server fails. Set in shell (`export GH_BKIT_TOKEN=...`) or cloud dashboard.

**`gh auth login` required for gh CLI surface** (PR creation, branch ops, git push). Locally, keyring — do not export `GH_TOKEN` from `.bkit/.env`. Cloud/headless: `cloud-bootstrap.sh` runs `printf '%s' "$GH_BKIT_TOKEN" | gh auth login --with-token` at SessionStart (guarded by `gh auth status`, no-ops on Actions runner where `GITHUB_TOKEN` auths) — no manual step. Same PAT value fine; different env-var name keeps local `gh` on keyring.

**Cloud sessions** (Claude on the web, Cursor Cloud Agents): Linear MCP OAuth on first touch, same as local. GitHub MCP reads `GH_BKIT_TOKEN` from dashboard — set alongside `LINEAR_API_KEY` and `GH_BKIT_TOKEN_INSTALL`.

## After saving the Claude env

1. Trigger session: `claude --remote "echo ready"` from repo, or tap env in iOS app.
2. First session slow (setup script + snapshot). Subsequent sessions start from snapshot.
3. Verify in-session: `vale --version && gh --version && pnpm -v && which corepack`.
4. Snapshot rebuilds when setup-script body changes, allowed-hosts list changes, or ~7-day TTL expires. Editing env vars or in-repo hook scripts does **not** invalidate snapshot.
5. **Force rebuild without semantic changes**: add `# cache-bust YYYY-MM-DD-N` comment at top of setup script.

# Cursor Cloud Agents

> Cursor renamed "Background Agents" to **Cloud Agents**; secrets moved from the old
> Settings pane to the **Secrets tab** of the Cloud Agents dashboard
> (`cursor.com/dashboard/cloud-agents`). The `is_background_agent` webhook field is
> unchanged. This doc uses "Cloud Agents" throughout.

> [!TIP]
> **No manual copy needed for the dashboard secrets.** `bkit install --cursor` writes
> `.cursor/cloud.md` — the twin of `.claude/cloud.md`, with the Cursor secrets block
> **resolved from `.envrc`** (Linear tracker adds `LINEAR_API_KEY`; no
> `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`). Open it, then in the Cloud Agents dashboard
> (`cursor.com/dashboard/cloud-agents`) → your environment → **Secrets** tab, add each
> as a **Runtime Secret** (loaded as an env var, redacted from the agent's transcript).
> Gitignored (holds real secrets); regenerates on every install/upgrade. The toolchain
> half is the committed `.cursor/Dockerfile` + `.cursor/environment.json` (nothing to
> paste) — same tools, same versions as the Claude setup script.

## Where config lives

Everything in repo under `.cursor/`. bkit ships canonical content for all four files:

<!-- prettier-ignore -->
| File | Role | bkit ownership |
| --- | --- | --- |
| `.cursor/Dockerfile` | Cloud image — vale + gh + Node 24 + pnpm (corepack-pinned) + Playwright chromium | Tier 3 seed; consumer-owned after first install |
| `.cursor/environment.json` | Build pointer + per-snapshot `install` hook (`pnpm config set …:_authToken=$GH_BKIT_TOKEN_INSTALL` + `pnpm install --frozen-lockfile` + `vale sync` if `.vale.ini`) | Tier 3 seed |
| `.cursor/hooks.json` | Wires `sessionStart` → `preflight.sh` (`failClosed: true`) | Tier 2 contained JSON |
| `.cursor/hooks/preflight.sh` | Tracker opt-in guard — `bkit:auto` label + non-terminal status. Skips silently on IDE sessions | Tier 2 contained (bkit:start/end markers) |

## How GitHub dispatch works

GitHub dispatch uses Cursor Automations "Pull request label changed" trigger — no Linear webhook.

**Prerequisites:** Cursor GitHub App installed on consumer repo or org.

**Trigger flow:**

1. `bkit-build` writes `bkit:auto` as static PR label (opt-in marker). Corresponding GitHub issue must also carry `bkit:auto` (runtime kill switch — remove to stop dispatch).
2. Phase label (`bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`) added to PR by workflow. Cursor reads label for workflow dispatch.
3. Cursor Automations fires on "Pull request label changed" → spawns Background Agent session against repo.
4. `sessionStart` fires `preflight.sh`. With `failClosed: true`, non-zero exit hard-stops agent.
5. `GITHUB_ISSUE_ID` injected from PR body metadata marker `<!-- bkit:issue=#NNN -->` — router extracts at dispatch time.

**Constraint:** `/bkit-design` and `/bkit-plan` have no PR → local-IDE-only on Cursor cloud with GitHub tracker. Run locally via Claude Code or Cursor IDE.

**Required env vars (GitHub tracker):**

```
GH_BKIT_TOKEN=<fine-grained PAT — same permissions as the Claude side>
```

`GITHUB_ISSUE_ID` injected per-session — do not hardcode. No `LINEAR_API_KEY`, `LINEAR_ISSUE_ID`, or `GH_BKIT_TOKEN_INSTALL` for tracker calls (MCP auth = browser OAuth; `gh` uses `gh auth login` locally or `--with-token` in cloud bootstrap).

## How Linear dispatch works

`@cursor` is **Cursor's native Linear integration**, not bkit — bkit does not intercept mention or run own Linear webhook. Spawned agent picks up bkit because every Cursor cloud agent reads root `AGENTS.md`, routing `/bkit-*` slash command to matching workflow in `.bkit/workflows/`.

1. Assign Linear issue to **Cursor** (integration user) or comment `@cursor /bkit-design ISSUE-NNN` — Cursor's standard Linear integration.
2. Cursor webhook → background agent against repo with `is_background_agent: true` and `LINEAR_ISSUE_ID` set.
3. `sessionStart` fires `preflight.sh`. With `failClosed: true`, non-zero exit hard-stops agent before work.
4. Preflight skips on IDE sessions (`is_background_agent !== true`) — local Cursor IDE unaffected.

## Required env vars (Cursor side)

Set in the Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents` → your environment → **Secrets** tab) as **Runtime Secret**s (loaded as env vars, redacted from the agent's transcript), **not** in `.cursor/environment.json`:

```
LINEAR_API_KEY=<Linear personal API key — preflight.sh calls the GraphQL API>
GH_BKIT_TOKEN=<fine-grained PAT — same permissions as the Claude side>
GH_BKIT_TOKEN_INSTALL=<classic PAT with read:packages — consumer repos only>
```

`LINEAR_ISSUE_ID` injected per-session by Cursor / Linear integration — do not hardcode.

Optional (debug-fetch — only if you use `.agents/config.md` blocks; tokens below are **examples**, set whatever operator creds YOUR enabled blocks need. Cloud-dashboard entries, not `.bkit/.env` — bkit/agent tooling only. Non-secret selectors (`VERCEL_SCOPE` / `SUPABASE_PROJECT_ID`) commit in copied block so cloud agents inherit without dashboard entry. CLIs install from each block's `debug-fetch:provision` sibling):

```
VERCEL_TOKEN=<Vercel access token — https://vercel.com/account/settings/tokens>
SUPABASE_ACCESS_TOKEN=<Supabase Management API token — https://supabase.com/dashboard/account/tokens>
```

## Network access (Cursor side)

Cloud Agents get network access by default; egress is configurable in the dashboard → **Security**: **Allow all** / **Default + allowlist** / **Allowlist only**, at user / environment / team scope. Analogue of Claude's `Trusted` / `Custom`, but the allowlist is **deliberately narrower** — Cursor warns a broad `*.` wildcard opens egress far wider than intended, so add the **specific** subdomains you need rather than a wildcard. If the repo declares `allowed-domains` in `.agents/config.md`, `.cursor/cloud.md` § Network access lists them apex-only (no auto-`*.` expansion, unlike the Claude side).

## After modifying `.cursor/*`

1. Run `pnpm bkit install` (this repo) or `pnpm install && pnpm bkit install` (consumer) to regenerate mirrors.
2. Commit changes.
3. **First Cursor session after Dockerfile changes slow** — image rebuilds. Subsequent sessions reuse cached layers.
4. Verify in-session: `vale --version && gh --version && pnpm -v && python3 --version`.

# Sharing across repos

## Claude — one environment per repo

Each repo gets **own** Claude environment, named after repo. Reason: **secrets, not mechanics**.

**Secrets are per-repo.** App tokens (Supabase, Stripe, Vercel, …) differ per repo; even bkit tokens differ in _scope_ (`GH_BKIT_TOKEN` = fine-grained PAT scoped to that repo). One Claude environment = one value per name — shared env forces mega-scoped PAT across repos (wide blast radius) or one repo's secrets leaking into rest. Per-repo envs isolate secrets.

Shared across repos (copy, don't re-derive) — non-secret only:

- **Setup script** — generic binaries only (vale, gh, pnpm via corepack); repo-specific install deferred to committed `cloud-bootstrap.sh` (lockfile → `pnpm install`, `.vale.ini` → `vale sync`). One body fits every repo.
- **bkit baseline token _names_** (`GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`) + **network policy** (`Trusted`) — same everywhere, values differ. Repo _other_ env vars **not** shared: copy from own env files per `.envrc` — drop `unset`s, skip `ANTHROPIC_API_KEY` (§ Environment variables).
- **Non-secret selectors** (`VERCEL_SCOPE`, `SUPABASE_PROJECT_ID`) stay committed in-repo (§ Environment variables), never in dashboard.

## Cursor — byte-identical Dockerfile

Cursor environment-resolution order: (1) `.cursor/environment.json` in repo, (2) personal saved environment in Cursor account, (3) team saved environment. Three sharing patterns:

1. **In-repo Tier 2 markered (bkit default).** Each consumer repo carries `.cursor/Dockerfile` + `.cursor/environment.json`. bkit owns toolchain block inside `# <!-- bkit:start -->` / `# <!-- bkit:end -->`; consumers customise outside. Functionally equivalent Cursor envs across consumers; bkit ships base-toolchain updates without trampling consumer changes.
2. **Personal saved environment (cross-repo).** Don't commit `.cursor/environment.json`; configure single environment in Cursor account dashboard. Cursor falls back for any session. Like any cross-repo environment — one secret set for all repos; prefer per-repo default (#1) when repos have distinct secrets.
3. **Multi-repo environment.** Cursor binds one environment to multiple repos cloned into same agent VM. Cross-repo work but agent sees all selected repos — different security boundary.

When bkit reference Dockerfile changes (e.g. vale bump):

- Consumer `.cursor/Dockerfile` **not** auto-overwritten (Tier 3 seed-only).
- `pnpm bkit install` prints new reference with merge instructions.
- Consumer merges manually (or deletes copy and lets bkit re-seed if no local edits).

## What every consumer repo needs to do

1. `pnpm bkit install` — bkit-managed toolchain updates inside `# <!-- bkit:start -->` / `# <!-- bkit:end -->` of `.cursor/Dockerfile` and `.claude/hooks/cloud-bootstrap.sh` without touching consumer customisations outside markers.
2. Set `LINEAR_API_KEY`, `GH_BKIT_TOKEN`, `GH_BKIT_TOKEN_INSTALL` as **Runtime Secret**s in the Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents` → your environment → **Secrets** tab). Paste-ready values are in `.cursor/cloud.md`.
3. Add Claude environment **named after repo** at `claude.ai/code`; paste recipe from § Claude Code on the web (one environment per repo — secrets per-repo).
4. Customise `.cursor/Dockerfile` Node major / Playwright / extra system deps **outside** bkit-managed block; byte-stable inside markers, consumer-owned outside.

# Post-CI auto-routing

After `bkit-build` Step 18 close-workflow pushes CI-trigger commit (`chore({FID}): close-workflow`, no skip tags) and exits, post-CI router decides ship vs. debug and dispatches matching skill in fresh cloud session — no operator action between CI completion and dispatched session.

Routing **logic** in single bkit-managed slash-command orchestrator (`.bkit/workflows/bkit-auto.md`, mirrored to `.claude/commands/bkit-auto.md` + `.cursor/commands/bkit-auto.md` on each `pnpm bkit install`). Routing **trigger** wired separately per IDE — different event surfaces.

## What lives where (post-CI half)

<!-- prettier-ignore -->
|  | Lives in the repo (bkit-managed) | Lives in the online dashboard / GitHub (manual, one-time) |
| --- | --- | --- |
| **Claude** | `.github/workflows/bkit-cloud.yml` — `claude` job (opt-in via `bkit install --auto=claude`; GitHub-tracker only). Two-tier gate: (1) free tier — job `if: contains(head_commit.message, 'bkit [auto route]')` (zero runner minutes for non-opted-in commits); (2) cheap tier — in-job `gh issue view {ISSUE} --json labels` re-checks `bkit:auto` (live kill switch); then dispatches `claude-code-action@v1` as the Claude GitHub App (OIDC, `id-token: write`). | GitHub repo secret: `ANTHROPIC_API_KEY`. Claude GitHub App required (`/install-github-app`). The linked **GitHub issue** must carry `bkit:auto`. |
| **opencode** | Same `.github/workflows/bkit-cloud.yml` — `opencode` job (opt-in via `bkit install --auto=opencode`; GitHub-tracker only). Same two-tier gate (same file, separate job). Dispatches via `opencode run "/bkit-auto $PHASE $ARG"`. No `id-token: write` — no OIDC; uses `github.token` for repo ops. | GitHub repo secret: `OPENCODE_PROVIDER_KEY` (set to your provider API key — NVIDIA NIM). Provider model committed in `.opencode/opencode.json`. The linked **GitHub issue** must carry `bkit:auto`. |
| **Cursor** | Nothing — Cursor cloud agents have native triggers. | Cursor → Cloud Agents dashboard → Triggers → + Add trigger. Event: CI workflow completion on `feat/**` branches. Prompt (paste **literally**, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`. Concurrency: latest-supersedes. |

**Why dashboard prompt never needs re-pasting:** Cursor substitutes `$CI_STATUS` and `$PR_NUMBER` from event payload at dispatch. Pasted string generic and timeless. When bkit routing logic evolves, only mirrored `.cursor/commands/bkit-auto.md` changes — dashboard untouched.

## Cursor dashboard — exact paste

```
/bkit-auto $CI_STATUS $PR_NUMBER
```

## Claude — required GitHub Actions permissions

Flip **both** org and repo before first router run — else `actions/checkout@v4` 403s with `Write access to repository not granted`. Workflow declares `permissions: contents: write` at workflow scope, but org/repo "Workflow permissions" ceiling overrides — repo cannot exceed org.

- **Org**: `https://github.com/organizations/{ORG}/settings/actions` → Workflow permissions → **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.
- **Repo**: `https://github.com/{ORG}/{REPO}/settings/actions` → same section, same two settings. Apply at repo too — inheriting from org not automatic.

`workflow_run`-triggered runs do **not** inherit parent CI workflow's `permissions:` block (only fork-PR tokens get narrowed) — parent CI at `contents: read` fine.

## bkit-cloud.yml — required GitHub repo secrets

<!-- prettier-ignore -->
| Secret | Job | Why | Scope |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | `claude` | `claude-code-action@v1` authenticates against Anthropic. | API key with Claude Code access. |
| `OPENCODE_PROVIDER_KEY` | `opencode` | Fanned out to every cloud provider's env var name (`NVIDIA_API_KEY`, `GROQ_API_KEY`, `CEREBRAS_API_KEY`, `OPENROUTER_API_KEY`, `OLLAMA_API_KEY`, `OPENCODE_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider is installed. | Provider API key for whichever provider you configured. |

Each job independently gated on its secret. Only `ANTHROPIC_API_KEY` → claude job only. Only `OPENCODE_PROVIDER_KEY` → opencode only. Both → both jobs (additive coexistence). **No `LINEAR_API_KEY`** — `bkit-cloud.yml` GitHub-tracker only for both jobs. Workflow grants `id-token: write` per-job for claude only (opencode no OIDC).

Neither job needs `GH_BKIT_TOKEN_INSTALL`. Slash command body already in checked-out repo (mirrored to `.claude/commands/bkit-auto.md` and `.opencode/commands/bkit-auto.md` at dev time via `bkit install`). Repo git/gh ops use auto-provided `github.token` scoped by workflow `permissions:` block.

## Routing decision (router orchestrator)

Slash command takes two args: `$CI_STATUS` ∈ `{success, failure, pass, fail}` (normalised) and `$PR_NUMBER`. Then:

1. Reads `gh pr view $PR_NUMBER` for `headRefName`, `headRefOid`, `state`. Refuses non-OPEN PRs.
2. Extracts `{FID}` from head branch (`feat/{FID}` convention).
3. Stale-run guard: compares latest CI run's `headSha` against PR's current `headRefOid`. Skips on mismatch (newer commit in flight).
4. Opt-in gate: refuses dispatch unless linked GitHub issue carries `bkit:auto` label.
5. Appends `bkit-auto → /bkit-{ship,debug}` line to GitHub issue / PR comment thread.
6. Invokes `/bkit-ship {FID}` (CI pass) or `/bkit-debug {FID} DEBUG_MODE=pr` (CI fail) via `Skill` / `Task` tool. Dispatched skill owns session lifecycle from there.

Skip conditions emit single GitHub-comment no-op line and exit 0 — only real failures (missing args, GitHub API unreachable, malformed state) take Failure Path.

## Operating notes

- **Loop bound:** `/bkit-debug` enforces `MAX_DEBUG_ATTEMPT = 3` internally; router never counts attempts. After three red CI runs, debug fires handover path and stops dispatching.
- **GHA 6 h cap:** `3 x ~3600s` per debug attempt = well under GHA runner ceiling. Ship is short.
- **Concurrency:** GHA workflow uses `cancel-in-progress: true`; Cursor dashboard trigger → "latest-supersedes." Ship squash-merge atomic — mid-run cancels cannot corrupt PR state.
- **Both clouds together:** nothing stops Claude + Cursor dispatching against same PR — they'd race. Pick one IDE per repo as auto-router (recommended: Claude via GHA, runner-resident and Anthropic-maintained). Leave Cursor for ad-hoc Linear-dispatch work.

# Caveats (both clouds)

- **No secrets store yet (Claude).** Env vars and setup-script body plaintext in Claude app. Rotate PATs regularly.
- **Env vars do not reach Claude setup script.** Auth at snapshot-build time must be inlined — leak you want to avoid. Design around it: public binaries in setup script; defer auth-bearing work to SessionStart hook.
- **Cache invalidation is body-based (Claude).** Editing env-vars block or repo-side hook scripts doesn't trigger rebuild. Use `# cache-bust YYYY-MM-DD-N` to force one.
- **Husky runs on `pnpm install`.** `prepare` registers git hooks during install. Pre-commit hooks (`lint-staged`, `lint:prose`, `lint:slop`) run when agent commits. `slop-scan` devDep → PATH via `node_modules/.bin`; `vale` system binary → setup script (Claude) or Dockerfile (Cursor).
- **Bun proxy issues (Claude).** Bun known proxy issues with cloud security proxy. bkit uses pnpm — unaffected; flag for bun consumers.
- **Custom base image not supported (Claude).** Escape hatch: `docker compose` sidecars. Not needed for bkit stack today.
- **Cursor image cache layer-based.** Reorder `RUN` lines carefully — frequently-changing line above slow one invalidates cache below.
- **GitHub App vs `/web-setup` (Claude).** Auto-fix PRs require GitHub App. `/web-setup` (sync `gh` token to Claude account) enough for clone + push, not auto-fix.
- **IP allowlists** on org GitHub / Anthropic accounts block cloud sessions — contact support to exempt managed infra.
- **pnpm `.npmrc` substitution.** Use `${VAR}` only, never `${VAR:-default}` — pnpm does not parse POSIX fallback and sends no auth → 401 on `@cbartens/bkit`. Both clouds equally.

# Decision log

## #363 — widen bkit-cloud trigger to post-merge dev CI

**Decision: Option A — reuse the existing `bkit [auto route]` free-tier gate for the post-merge `dev` surface, no second gate.** `bkit-cloud.yml`'s `workflow_run` trigger widens from `['feat/**']` to `['feat/**', 'fix/**', 'dev']` (`main` is deliberately excluded — see the deferral row in `docs/deferrals.jsonl` and #363). `bkit-ship` threads `AUTO_ROUTE_SUFFIX` (` bkit [auto route]`) onto the PR squash-merge `--subject` when the issue carries `bkit:auto`, so the commit that actually lands on `dev` — and triggers post-merge CI — already carries the same marker the free-tier gate checks. The rejected alternative (a second `workflow_run` filter on `dev` deriving eligibility from the merged PR's `bkit:auto` label via a `gh pr list --base dev --merged` reverse-lookup) was passed over: it avoids polluting `dev` squash titles but adds a second gate mechanism and an extra API call on every `dev` push, for no real gain over reusing the existing marker.

**Branch-aware routing table:**

<!-- prettier-ignore -->
| Trigger | success | failure |
| --- | --- | --- |
| `feat/**` CI (pre-merge, via `pull_request`) | -> ship | -> debug |
| `fix/**` CI (pre-merge, via `pull_request`) | -> nothing (no-op; ship is not `fix/**`-aware) | -> debug (capped) |
| `dev` CI (post-merge, via `push`) | -> nothing (no-op; the merge already happened) | -> `/bkit-debug {FID}` |
| `main` CI (post `dev`->`main` promotion) | manual only — never auto-routed | manual only — never auto-routed |

**FID recovery on `dev` (no open PR):** primary = parse the squash-merge commit scope (`feat({FID}): ...` — the PR title convention the squash `--subject` preserves verbatim), tracker-agnostic (`363-slug` and `bar-123-slug` both admitted, mirroring the existing `feat/**` branch-fallback alternation); fallback = `gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/pulls` -> linked-PR body `bkit:fid=` marker. Either path failing -> fail-safe no-op (`skip=true`, no dispatch, no crash).

**Stale-run guard — Option A (CI-run recency, NOT git-tip).** `/bkit-ship`'s terminal close commit (`docs({FID}): ship DONE bkit [skip ci]`) pushes to `dev` _during_ the post-merge CI run (on runtimes where `RUNTIME_DEVPUSHES = true`), so by the time CI completes and the cloud workflow boots, `dev`'s tip is often the close commit — a naive `git rev-parse origin/dev` comparison would mismatch on every legitimate dispatch and silently suppress the whole feature. Instead the guard queries the most recently COMPLETED CI run on `dev` (`gh run list --branch dev --workflow ci.yml --status completed`) and compares its `headSha` against the triggering `workflow_run.head_sha`. Close commits always carry `[skip ci]` so they never trigger CI and never appear in that list — the most-recent-completed-run head is always a feature/fix commit, which is exactly the staleness signal intended. `gh run list` returning empty fails OPEN (proceeds with dispatch) — better to dispatch than to silently swallow the feature on a transient API hiccup.

**Loop-bound decision.** Cross-session cap = 3 DISTINCT failed dev/fix CI SHAs per FID, all-time, checked AND written by the `bkit-cloud.yml` ctx step (both jobs) immediately BEFORE dispatch — not by `/bkit-debug` (per-session `MAX_NORMAL_ATTEMPT` resets on every new cloud dispatch and cannot bound a cross-session loop). The counter row (`type: "dev-dispatch"`) is committed to `dev` with `[skip ci]` so an early `/bkit-debug` crash cannot undercount, and the write is fail-closed: a rejected push is retried once against a re-fetched `dev`, then the row's presence on `origin/dev` is verified before dispatch proceeds — a row landing nowhere durable would let the cap silently degrade to unbounded. One budget per FID shared across the `dev` and `fix/**` failure surfaces (`fix/**` newly folded per #363 — a `fix/**` CI failure re-dispatches `/bkit-debug` exactly like `dev`, so it shares the same cap via a factored `bkit_dev_dispatch_guard` shell function). `feat/**` stays deliberately uncapped here — pre-merge, PR-scoped, already bounded by the in-session `MAX_DEBUG_ATTEMPT` / `MAX_NORMAL_ATTEMPT` counters.

**Concurrency decision.** `cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}` — `feat/**`/`fix/**` keep `true` (latest-wins, unchanged). For `dev`, `false`: an in-flight `/bkit-debug` run is allowed to finish rather than being cancelled mid-flight (which risks leaving `status.jsonl` or a worktree lock inconsistent); GHA QUEUES at most one pending run per concurrency group when `cancel-in-progress: false` (older pendings are cancelled as newer ones arrive) — the queued run re-evaluates the dispatch cap at its own ctx step when it starts, so the operator does not need to manually re-trigger for the SAME FID. **Caveat (#363 M6):** `bkit-auto-dev` is ONE group shared by ALL FIDs — GHA evaluates `concurrency.group` from trigger-payload context alone, before the ctx step derives the FID, so the group cannot be keyed on it. If two DIFFERENT FIDs' dev CI runs fail near-simultaneously, the queue-collapse can drop an older, different FID's pending run rather than queueing it. The ctx step's stale-run guard detects this (its `HEAD_SHA` no longer matches the most-recent-completed dev CI run) and writes a `dev-dispatch-dropped` row to the run's job summary plus a `::warning::` for operator review, rather than silently discarding it. The row goes to the job summary, not a committed `status.jsonl`: this branch is only reached because `dev` already advanced, so a commit-and-push of the row would usually be a non-fast-forward and be lost in exactly the case it exists to record.

## opencode provider host

**Superseded premise:** Original SP5 out-of-scope note classified opencode as separate file (`opencode-cloud.yml`) or separate CLI flag path. opencode host was "phase 2 post-PR" addition.

**Decision: additive / unified-file.** Claude + opencode CI dispatch jobs in single `bkit-cloud.yml`. Independently runtime-gated on own secret (`ANTHROPIC_API_KEY` claude, `OPENCODE_PROVIDER_KEY` opencode) — one secret → one job. Both coexist by setting both secrets.

**Rationale:**

- One file = one Renovate `ignorePaths` entry, one audit surface, one template write.
- Runtime-gated jobs idempotent — second job no-op until consumer adds secret.
- opencode job dispatches via `opencode run "/bkit-auto $PHASE $ARG"` (headless; no comment event). Provider model/config in `.opencode/opencode.json` (committed, from `bkit install --opencode=<provider>`). Single `OPENCODE_PROVIDER_KEY` fanned out to all known provider env var names so config `${VAR}` resolves regardless of provider.
- Cloud workflow rename (previous name → `bkit-cloud.yml`) only consumer-visible breaking change; upgrade path removes old file automatically.

# Sources

- Anthropic docs: <https://code.claude.com/docs/en/claude-code-on-the-web>
- Cursor Cloud Agents: <https://cursor.com/docs/cloud-agent/setup>
- Zenn article on Claude env-var/setup-script gotcha: <https://zenn.dev/harieshokunin/articles/b1064354319ce2?locale=en>
- Managed Agents environments (separate product, similar shape): <https://platform.claude.com/docs/en/managed-agents/environments>
