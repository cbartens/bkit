# Cloud agent environments — Claude Code on the web + Cursor Cloud Agents + opencode

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** Canonical reference for Claude Code on the web (mobile / web), Cursor Cloud Agents, and opencode cloud runners. Claude + opencode → **GitHub** tracker (unified `bkit-cloud.yml`); Cursor → **Linear**. Not interchangeable per repo — pick agent matching your tracker (see § Cloud-agent support matrix).
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Ships to consumers: describe the current setup only. NEVER an internal identifier (tracker issue number, ledger key, review-finding id) and NEVER project history — decisions belong in `docs/decisions.jsonl`, incidents in `docs/knowledge.jsonl`.
> - Claude env config → Claude app; Cursor → `.cursor/` in-repo. Both have in-repo SessionStart guard.
> - Update when either cloud's pre-installed toolchain or default allowlist changes. Sources: `code.claude.com/docs/en/claude-code-on-the-web` + `cursor.com/docs/cloud-agent/setup`.

## Scope

> **Host-delta matrix:** `.bkit/providers.md` § Runtime environment (cloud agents). Canonical "what differs" for Claude vs Cursor cloud agents. This file = paste-in setup recipe, alignment guarantees, sharing-across-repos pattern, caveats.

## Cloud-agent support matrix (read first)

Three cloud stacks — each agent pairs with one tracker. Pick row for agent you run:

<!-- prettier-ignore -->
| Agent (the agent, not the editor) | Ways to launch a cloud agent | Tracker | not supported |
| --- | --- | --- | --- |
| **Claude Code** (terminal — any IDE host) | **A)** Claude iOS / desktop app → Claude-on-web env (`.claude/hooks/bkit-cloud-bootstrap.sh` + the env defined in `claude.ai/code`) · **B)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick any phase + issue) · **C)** GitHub CI pass/fail → `bkit-cloud.yml` claude job · **D)** `@claude` mention on a GitHub issue / PR (`/install-github-app` required — **base requirement** for `cloud=claude`) | **GitHub** | **Linear** |
| **opencode** (GitHub runner) | **A)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick any phase + issue) · **B)** GitHub CI pass/fail → `bkit-cloud.yml` opencode job (requires `OPENCODE_PROVIDER_KEY` secret) · **C)** reactive `/oc` comment handler (self-installed, not bkit — see § Reactive comment handlers) | **GitHub** | **Linear** |
| **Cursor** (native agent) | **A)** Cursor's built-in cloud-agent launch · **B)** Cursor's GitHub integration on PR events (CI pass/fail) · **C)** Linear → Cursor integration | **Linear** (+ GitHub PR events) | **GitHub Projects / Issues** |

**Unified file — additive coexistence:** Claude + opencode share one `bkit-cloud.yml`: a `context` job resolves the phase once, then two runner jobs, each runtime-gated on its secret (`ANTHROPIC_API_KEY` claude, `OPENCODE_PROVIDER_KEY` opencode). Both jobs can fire on same CI event — both secrets → both agents; one secret → one agent. Cursor separate (no GH Action; native triggers). **Cursor cloud ↔ Linear.**

**Manual dispatch (Claude or opencode, path A):** GitHub → **Actions** → **bkit-cloud** → **Run workflow** → `phase` (`ship` / `debug` / `design` / `plan` / `build`) + `issue`. On-demand/smoke-test for `design` / `plan` / `build`; `ship` / `debug` normally CI-fired. Dispatched `/bkit-auto` orchestrator → matching phase skill → brief from GitHub issue (MCP).

### Reactive comment handlers (`claude.yml` + `opencode.yml`) — separately managed, not bkit

`.github/workflows/claude.yml` (the `@claude` handler) and `.github/workflows/opencode.yml` (the `/oc` handler) are **not bkit's**. Each is generated — and re-generated — by its own vendor tool; bkit ships **no template** for either, and `bkit install` / `upgrade` never writes, rewrites, or drift-gates them (both are absent from the bkit manifest). They coexist **additively** with `bkit-cloud.yml` (the CI-completion + `workflow_dispatch` lane, which bkit ships as a template): a comment fires the vendor handler; a CI run fires `bkit-cloud.yml`.

<!-- prettier-ignore -->
| Reactive handler (not bkit) | Installed by (vendor tool) | Auth | Launch a bkit phase |
| --- | --- | --- | --- |
| `.github/workflows/claude.yml` | `/install-github-app` (Claude Code CLI → official Claude GitHub App) | OIDC as the App (`bkit-cloud.yml` grants `id-token: write`; no App installed → OIDC error at boot) | comment `@claude /bkit-plan` (or any phase) on an issue / PR |
| `.github/workflows/opencode.yml` | `opencode github install` (opencode CLI) | your provider key (`BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / etc.) — no App, no OIDC | comment `/oc` or `/opencode` on an issue / PR |

**You maintain these files — bkit does not.** `opencode.yml` hardcodes a `model:` + provider-secret `env:`; keep both in sync with your installed opencode provider. `bkit check` + postinstall raise a non-fatal advisory when they drift (hand-fix — bkit will not rewrite the file). No equivalent check for `claude.yml` (its `@claude` handler is provider-fixed to Claude). For Claude, the `@claude` path is the **base requirement** for `cloud=claude` — enable with `bkit install --auto=claude` (GitHub tracker only); the App also gives the runner a GitHub identity for the `mcp__github__*` surface.

## What lives where (orient first)

<!-- prettier-ignore -->
| Configuration | Lives in the repo (bkit-managed) | Lives in the online dashboard (manual, one-time) |
| --- | --- | --- |
| **Claude Code on the web** | `.claude/hooks/bkit-preflight.sh` (tracker opt-in guard) + `.claude/hooks/bkit-cloud-bootstrap.sh` (per-session install — copy-and-own template, adopt it from `.bkit/templates/`) | `claude.ai/code` → environment selector → **+ Add environment**: name, **setup script** (paste from § Setup script), **environment variables** (`BKIT_GH_TOKEN` — Claude pairs with the **GitHub** tracker, so no `BKIT_LINEAR_API_KEY`), **network access** (`Trusted`) |
| **Cursor Cloud Agents** | `.cursor/Dockerfile` + `.cursor/environment.json` (`install` / `start` / `terminals[]` / `env`), both copied from bkit's templates and owned by the repo, + `.cursor/hooks.json` (wires preflight `failClosed: true`) + `.cursor/hooks/bkit-preflight.sh` (Linear guard) | Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents`) → your environment → **Secrets** tab, as **Runtime Secret**s: `BKIT_LINEAR_API_KEY`, `BKIT_GH_TOKEN`. (`LINEAR_ISSUE_ID` injected per-session by the integration — don't hardcode.) |

**Rule of thumb:** env vars / auth tokens → online dashboard (out of git). Scripts / Dockerfile / install hooks → repo.

**Alignment guarantees bkit enforces:**

- Same vale version (3.9.1) pre-installed on both clouds.
- pnpm via corepack on both. Pastes pre-warm bkit's pin (`10.34.4`), but corepack resolves **each repo's own `packageManager`** in-repo — one setup script serves any pnpm pin; pre-warm version not load-bearing.
- gh CLI on both: web setup script installs latest binary (same `github.com` release-download style as vale); GitHub-Actions runner ships pre-installed. Auth shared via `bkit-cloud-bootstrap.sh` (`gh auth login --with-token` with `BKIT_GH_TOKEN`, skipped when `GITHUB_TOKEN` already auths on runner).
- Same opt-in-guard pattern — opt-in label `bkit:auto` — wrapped in `<!-- bkit:start --> ... <!-- bkit:end -->` (bkit-managed in consumer repos). Label `bkit:auto` on both trackers.

## Background

Both clouds run Ubuntu 24.04 (4 vCPU / 16 GB RAM / 30 GB disk class). Pre-installed inventories differ:

<!-- prettier-ignore -->
| Pre-installed | Claude Code on the web | Cursor Cloud Agents (after bkit Dockerfile) |
| --- | --- | --- |
| Node | 20 + 22 | 20 (template default; pin to your `engines.node` / `.nvmrc`) |
| Package manager | pnpm + bun (latest) | pnpm (corepack-pinned in `.cursor/Dockerfile`; each repo's `packageManager` honored in-repo) |
| Python | Yes + ruff | Yes (system `python3` only) |
| Databases | Postgres 16, Redis 7 | Not installed (add to Dockerfile if needed) |
| Docker | Yes (host engine) | N/A — we are inside Docker |
| Utilities | git, jq, ripgrep | git, jq |
| `gh` CLI | **Not pre-installed** — setup script adds it | Added via Dockerfile |
| `vale` | **Not pre-installed** — setup script adds 3.9.1 | Added via Dockerfile (3.9.1) |
| Playwright | Not pre-installed | Not installed (commented example in the consumer section of `.cursor/Dockerfile`) |

Two halves of customisation:

- **Cloud-side install** (one-time, cached): Claude → setup script in app. Cursor → `.cursor/Dockerfile`.
- **Repo-side install** (per-session, lockfile-aware): Claude → `.claude/hooks/bkit-cloud-bootstrap.sh`. Cursor → `.cursor/environment.json` `install` field.

# Claude Code on the web

> [!TIP]
> **No manual copy needed.** `bkit install --claude` writes `.claude/bkit-cloud.md` — this recipe with repo env-var **values resolved from `.envrc`** (`unset`s dropped, `BKIT_ANTHROPIC_API_KEY` omitted to protect subscription billing). Open file, paste each block into Claude app. Gitignored (holds real secrets); regenerates on every install and upgrade. Reference below documents each field it fills.

## Where config lives

Open `claude.ai/code` → environment selector → **+ Add environment**. Three surfaces: setup script (bash, root, once, snapshotted), environment variables (`.env` format, plaintext, visible to anyone with edit access), network access (`None` / `Trusted` / `Full` / `Custom`).

## In-repo side

- `.claude/hooks/bkit-preflight.sh` — Tracker opt-in guard. Skips silently when tracker issue ID env var unset (IDE sessions). Non-zero exit informational only on Claude (`SessionStart` cannot block); agent reads `HARD STOP` text from `additionalContext`.
- `.claude/hooks/bkit-cloud-bootstrap.sh` — runs `pnpm install --frozen-lockfile` + `vale sync` when `CLAUDE_CODE_REMOTE=true`; then, through the just-installed bkit (`bkit runtime detect` gh probe, `bkit context list-blocks` provision recipes, read with `jq`), gh auth and context-fetch CLI provisioning — skipped with a loud log line when bkit or `jq` is missing. No-op locally.
- Both registered in `.claude/settings.json` under `hooks.SessionStart`.

Ships with repo — don't paste into app.

## What to paste into the Claude app

### Name

Name environment **after the repo** — one env per repo, secrets isolated (§ Sharing across repos). Setup script identical across repos.

Identical across repos: **setup-script body**, **network policy**, bkit **baseline token name** (`BKIT_GH_TOKEN`) — only values change. Rest of env-vars box is **this repo's own**, copied from env-var files per `.envrc` (§ Environment variables).

### Network access

Always `Custom` — the rendered list carries bkit's own shipped hosts (trackers, registries, agent + provider APIs, the search host a `context=web` block calls) whether or not the repo declares anything. Select **Custom**, tick **Also include default list of common package managers** (EXTENDS trusted defaults — package registries, GitHub, cloud SDKs — never replaces them), paste domains bkit renders into `.claude/bkit-cloud.md` § Network access into **Allowed domains**. Declare only what bkit cannot see: log-backend/API hosts the implicit CLI blocks reach (`vercel` / `gcloud`) plus app production + preview/dev domains — apex-only, expanded by `bkit install` to `<domain>` + `*.<domain>` and unioned with the derived set. Under `Trusted` those hosts unreachable → cloud `/bkit-debug` gets no runtime logs; e2e can't hit deployment.

No `allowed-domains` block still needs `Custom`: `Trusted` does not reach bkit's own tracker MCP, provider catalog or search hosts. Ticking **Also include default list of common package managers** keeps npm, the vale tarball on `objects.githubusercontent.com`, Docker Hub and PyPI. Raise to `Full` only for open-internet tasks.

### Environment variables

Minimum:

```
BKIT_GH_TOKEN=<PAT — fine-grained for one owner, classic across owners; see permissions below>
```

Claude pairs with **GitHub** tracker (see § Cloud-agent support matrix) — no `BKIT_LINEAR_API_KEY` / `LINEAR_ISSUE_ID`. Set `BKIT_GH_TOKEN` for GitHub MCP; authenticate `gh` via `gh auth login --with-token` in bootstrap hook (env vars not visible during setup script — see § Notes).

Optional (context-fetch — only if you use `.agents/context.md` blocks, e.g. copied from `.bkit/templates/context/`; tokens below are **examples**, set whatever operator creds your enabled blocks need. Cloud-dashboard entries, not `.bkit/.env` — that file is bkit/agent tooling only. Non-secret selectors (`VERCEL_SCOPE` / `SUPABASE_PROJECT_ID`) commit in copied block so cloud agents inherit without dashboard entry. CLIs install from each block's `context-fetch:provision` sibling):

```
VERCEL_TOKEN=<Vercel access token — https://vercel.com/account/settings/tokens>
SUPABASE_ACCESS_TOKEN=<Supabase Management API token — https://supabase.com/dashboard/account/tokens>
```

#### `BKIT_GH_TOKEN` — token permissions

**Choose the token type by how many owners it covers:** a **fine-grained** PAT reaches only resources under **one** resource owner (a user or an org) — use it when every target repo is under that owner; use a **classic** PAT when one token must span **more than one owner** (two or more orgs, or a user + an org), since fine-grained PATs cannot access multiple organizations. Fine-grained: mandatory expiry, repo-scoped blast radius — preferred when it fits (env vars are plaintext). Classic: scopes `repo`, `workflow`, `read:org`, `project`, `security_events` (+ `user:email` for Renovate authorship); keep the expiry short; an org may block classic (403) and SAML SSO orgs need the token authorized per org.

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

`gh` does **not** read `BKIT_GH_TOKEN` — pipe once after session start: `printf '%s' "$BKIT_GH_TOKEN" | gh auth login --with-token` (e.g. in `.claude/hooks/bkit-cloud-bootstrap.sh`). Locally, `gh auth login` and leave `GH_TOKEN` unset so keyring not overridden.

> **Projects v2 board sync (`bkit.githubProject`):** **Projects** permission is **Organization** permission (table row above) — appears only when token **resource owner is the org**, _not_ personal account; org may require token **approved**. Under token UI **Organizations** tab, not Repository permissions; governs `…/orgs/{org}/projectsV2/…`. User-owned (personal-account) boards unreachable by fine-grained PATs — see below.

#### When classic is still required

- **More than one repo across owners.** A fine-grained PAT is limited to a single resource owner (one user or one org), so it cannot cover two or more orgs, or a user plus an org. Classic reaches every repo your user can.
- **Cross-repo work in single cloud session.** Fine-grained PATs only see allowlist; classic sees everything your user can.
- **User-owned (personal-account) Projects v2 boards.** Fine-grained PATs expose Projects only as _organization_ permission — personal boards unreachable. Classic PAT with `project` scope, or move board under org.

#### Notes

- Claude app warns "don't add secrets" — env vars visible to anyone with edit rights. Personal account = just you; team account = treat as low-trust.
- Earlier auto-compaction: set `autoCompactWindow` in committed `.claude/settings.json` (`.bkit/providers.md` § Context compaction) — applies to cloud sessions as-is; no env var.
- **Env vars set in Claude app are not visible inside setup script.** Injected only after Claude Code starts → `SessionStart` hooks + interactive shell, not snapshot build. Tool needing token to bootstrap must inline it — leak you want to avoid. Avoided today: vale / gh / corepack don't need auth.

### Setup script

`bkit install` generates copy-paste-ready setup script into `.claude/bkit-cloud.md` § Setup script — resolved for this repo, with cache-bust line, base-tool installs, any `context-fetch:provision` recipes. **Paste that**, not hand-copied snippet: stale copy drifts (hard-pinned pnpm can seed version known to break `bkit` download; `apt install gh` unreliable — gh not in default repos).

What it does and why split from in-repo hook:

- **`# cache-bust <date>-<n>`** first line generator writes (`bkit install` / `bkit upgrade` re-stamp). Snapshot keyed on setup script exact text — only job is to change: new date (or bumped same-day counter) forces fresh snapshot on next paste, re-pulling "latest"-resolved `gh` / `gcloud` binaries and base-image drift even when rest byte-identical. Leave in place — do not hand-edit.
- **Base tools (vale, gh, jq)** install once into snapshot from upstream releases — `gh` from `cli/cli` releases redirect (not `apt`), `jq` because `curl`-based context-fetch blocks pipe through it. Binaries cloud lacks but laptop has — not repo-level hook.
- **pnpm corepack pre-warm** seeds one pnpm into snapshot via `corepack enable` (no hard-pinned version). In-repo, corepack resolves repo's `packageManager` (fetching if differs) — one setup script serves any pnpm pin; pre-warm is warm cache.
- `pnpm install` and `vale sync` **not** here — belong in `.claude/hooks/bkit-cloud-bootstrap.sh` for resumed sessions when lockfile/styles drifted; each repo installs own deps.

Keep total runtime under ~5 minutes or snapshot won't build.

#### Workspace trust + auto-mode config

`permissions.allow` / `permissions.additionalDirectories` in `.claude/settings.json` **grant** capability — applied only after the workspace trust dialog, never shown in a cloud (`-p` / SDK) session. `deny` / `ask` unaffected (restrict-only). Untrusted → every `allow` row ignored; sole notice one stderr line no cloud session surfaces.

Setup script writes both host-side, after the `jq` install:

<!-- prettier-ignore -->
| Written | Where | Why setup script |
| --- | --- | --- |
| `projects[<repo path>].hasTrustDialogAccepted = true` | `~/.claude.json` | Settings resolve **before** `SessionStart` (hook too late); `.claude/` is a protected path (in-session write refused). Setup script = root, pre-clone, pre-Claude, snapshotted. |
| `autoMode.environment` — `"$defaults"` first, `Host containment` entry, network-allowlist hosts | `~/.claude/settings.json` | Classifier reads `autoMode` from user / managed settings **only** — never `.claude/settings.json` / `.claude/settings.local.json`. Not shippable in-repo. |

Both `jq`-merge, never clobber; `autoMode.environment` seeded `//=` (consumer list never overwritten). Omit `"$defaults"` → **whole built-in list discarded** for that section (incl. `Trusted repo`); renderer always emits it.

Neither file is committable: `~/.claude/settings.json` resolves outside the repo tree; a git-**tracked** `.claude/settings.local.json` counts as repository-supplied, same trust gate.

Baked path `/home/user/<repo-name>` = observation of the current image, **not** a contract (no env var names the repo root). `.claude/hooks/bkit-cloud-bootstrap.sh` re-checks the discovered git root each session and warns on mismatch — diagnosis only, no repair. Fix: re-paste setup script.

Auto mode drops blanket `Bash(*)` on entry (narrow rows survive) → cloud auto-mode sessions run on classifier verdicts + `autoMode.environment`, not the allow list. Default classifier trust = working repo + remotes; every context-fetch host external until named. `Host containment` default assumes an open-internet dev machine.

## Environment variables

Token management by session type:

- **Local sessions** — bkit writes `.bkit/.env.example` (token placeholders); `.envrc` (`dotenv_if_exists .bkit/.env`) is a template: copy `.bkit/templates/.envrc`. Copy `.env.example` → `.bkit/.env`, fill tokens, `direnv allow`. direnv auto-exports `BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY` on repo entry — no manual `source` or shell-rc export. `.bkit/.env` gitignored; never commit.

  ```bash
  cp .bkit/.env.example .bkit/.env
  # edit .bkit/.env — fill in BKIT_GH_TOKEN, BKIT_LINEAR_API_KEY
  direnv allow
  ```

- **Cloud sessions** (Claude Code on the web, Cursor Cloud Agents) — `.bkit/.env` absent in cloud containers. Set same names (`BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY`) in respective dashboards: Claude app → environment selector → Environment variables; Cursor Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents`) → your environment → **Secrets** tab (as **Runtime Secret**s). Dashboard lists in sections below = canonical reference for names.

**Beyond bkit tokens** — populate rest from _that repo's_ env-var files `.envrc` sources (e.g. `.bkit/.env`, then app `.env.local`). Don't hand-pick from memory; **copy from those files, following `.envrc`**:

- **Drop every var `.envrc` `unset`s** — deliberately kept out of repo shell (e.g. prod cache creds flipping unit tests off mock branch, or project ref mis-naming local stack); no place in cloud env.
- **Skip session-hijacking keys — notably `BKIT_ANTHROPIC_API_KEY`** — redirects Claude Code model calls onto API-key billing, not subscription. Same for any var re-pointing agent's own auth.
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
    "headers": { "Authorization": "Bearer ${BKIT_GH_TOKEN}" }
  }
}
```

`"type": "http"` required — without it Claude Code defaults to stdio transport and rejects entry for missing `command`.

- **Linear** — full Linear workspace surface (`get_issue`, `save_issue`, `save_comment`, `list_*`). Used when `bkit.issueTracker` = `linear`. OAuth (Dynamic Client Registration) — browser flow on first use, no env var.
- **GitHub** — official GitHub MCP at `api.githubcopilot.com` (not gated by Copilot subscription). Surface: `issue_write`, `add_issue_comment`, `label_write`, `projects_write`, etc. Used under GitHub provider. Endpoint does **not** support OAuth DCR → auth via `Authorization: Bearer ${BKIT_GH_TOKEN}` (MCP-only env var — see § Environment variables and KN-CORE-8).

**Auth flow per server:**

- **Linear:** Claude Code prompts browser authorize on first use; token in Claude's secret store. No further action.
- **GitHub:** Claude Code substitutes `${BKIT_GH_TOKEN}` from environment at session start. Unset → server fails. Set in shell (`export BKIT_GH_TOKEN=...`) or cloud dashboard.

**`gh auth login` required for gh CLI surface** (PR creation, branch ops, git push). Locally, keyring — do not export `GH_TOKEN` from `.bkit/.env`. Cloud/headless: `bkit-cloud-bootstrap.sh` runs `printf '%s' "$BKIT_GH_TOKEN" | gh auth login --with-token` at SessionStart (guarded by the `bkit runtime detect` gh probe, no-ops on Actions runner where `GITHUB_TOKEN` auths) — no manual step. Same PAT value fine; different env-var name keeps local `gh` on keyring.

**Cloud sessions** (Claude on the web, Cursor Cloud Agents): Linear MCP OAuth on first touch, same as local. GitHub MCP reads `BKIT_GH_TOKEN` from dashboard — set alongside `BKIT_LINEAR_API_KEY`.

## After saving the Claude env

1. Trigger session: `claude --remote "echo ready"` from repo, or tap env in iOS app.
2. First session slow (setup script + snapshot). Subsequent sessions start from snapshot.
3. Verify in-session: `vale --version && gh --version && pnpm -v && which corepack`.
4. Verify workspace trust on the discovered root — `true` = `allow` rows apply; `MISSING` = clone path differs from the baked one (§ Workspace trust + auto-mode config):

   ```bash
   jq -r --arg p "$(git rev-parse --show-toplevel)" \
     '.projects[$p].hasTrustDialogAccepted // "MISSING"' "${CLAUDE_CONFIG_DIR:-$HOME}/.claude.json"
   ```

5. Snapshot rebuilds when setup-script body changes, allowed-hosts list changes, or ~7-day TTL expires. Editing env vars or in-repo hook scripts does **not** invalidate snapshot.
6. **Force rebuild without semantic changes**: add `# cache-bust YYYY-MM-DD-N` comment at top of setup script.

# Cursor Cloud Agents

> Cursor calls these **Cloud Agents**; secrets live in the **Secrets tab** of the Cloud
> Agents dashboard (`cursor.com/dashboard/cloud-agents`). The webhook field is
> `is_background_agent`. This doc uses "Cloud Agents" throughout.

> [!TIP]
> **No manual copy needed for the dashboard secrets.** `bkit install --cursor` writes
> `.cursor/bkit-cloud.md` — the twin of `.claude/bkit-cloud.md`, with the Cursor secrets block
> **resolved from `.envrc`** (Linear tracker adds `BKIT_LINEAR_API_KEY`). Open it, then in the
> Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents`) → your environment → **Secrets**
> tab, add each as a **Runtime Secret** (loaded as an env var, redacted from the agent's transcript).
> Gitignored (holds real secrets); regenerates on every install/upgrade. The toolchain
> half is the committed `.cursor/Dockerfile` + `.cursor/environment.json` (nothing to
> paste) — same tools, same versions as the Claude setup script.

## Where config lives

Everything in repo under `.cursor/`. bkit ships canonical content for all four files:

<!-- prettier-ignore -->
| File | Role | bkit ownership |
| --- | --- | --- |
| `.cursor/Dockerfile` | Cloud image — vale + gh + Node 20 (template default) + pnpm (corepack-pinned); browsers etc. added by the consumer | Template: copy from `.bkit/templates/.cursor/Dockerfile`; yours after |
| `.cursor/environment.json` | Build pointer + per-snapshot `install` hook (`pnpm install --frozen-lockfile` + `vale sync` if `.vale.ini`) | Template: copy from `.bkit/templates/.cursor/environment.json`; yours after |
| `.cursor/hooks.json` | Wires `sessionStart` → `bkit-preflight.sh` (`failClosed: true`) | Tier 2 contained JSON |
| `.cursor/hooks/bkit-preflight.sh` | Tracker opt-in guard — `bkit:auto` label + non-terminal status. Skips silently on IDE sessions | Tier 2 contained (bkit:start/end markers) |

## How GitHub dispatch works

GitHub dispatch uses Cursor Automations "Pull request label changed" trigger — no Linear webhook.

**Prerequisites:** Cursor GitHub App installed on consumer repo or org.

**Trigger flow:**

1. `bkit-build` writes `bkit:auto` as static PR label (opt-in marker). Corresponding GitHub issue must also carry `bkit:auto` (runtime kill switch — remove to stop dispatch).
2. Phase label (`bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`) added to PR by workflow. Cursor reads label for workflow dispatch.
3. Cursor Automations fires on "Pull request label changed" → spawns Background Agent session against repo.
4. `sessionStart` fires `bkit-preflight.sh`. With `failClosed: true`, non-zero exit hard-stops agent.
5. `GITHUB_ISSUE_ID` injected from PR body metadata marker `<!-- bkit:issue=#NNN -->` — router extracts at dispatch time.

**Constraint:** `/bkit-design` and `/bkit-plan` have no PR → local-IDE-only on Cursor cloud with GitHub tracker. Run locally via Claude Code or Cursor IDE.

**Required env vars (GitHub tracker):**

```
BKIT_GH_TOKEN=<PAT — fine-grained for one owner, classic across owners; same permissions as the Claude side>
```

`GITHUB_ISSUE_ID` injected per-session — do not hardcode. No `BKIT_LINEAR_API_KEY` or `LINEAR_ISSUE_ID` for tracker calls (MCP auth = browser OAuth; `gh` uses `gh auth login` locally or `--with-token` in cloud bootstrap).

## How Linear dispatch works

`@cursor` is **Cursor's native Linear integration**, not bkit — bkit does not intercept mention or run own Linear webhook. Spawned agent picks up bkit because every Cursor cloud agent reads root `AGENTS.md`, routing `/bkit-*` slash command to matching workflow in `.bkit/core/workflows/`.

1. Assign Linear issue to **Cursor** (integration user) or comment `@cursor /bkit-design ISSUE-NNN` — Cursor's standard Linear integration.
2. Cursor webhook → background agent against repo with `is_background_agent: true` and `LINEAR_ISSUE_ID` set.
3. `sessionStart` fires `bkit-preflight.sh`. With `failClosed: true`, non-zero exit hard-stops agent before work.
4. Preflight skips on IDE sessions (`is_background_agent !== true`) — local Cursor IDE unaffected.

## Required env vars (Cursor side)

Set in the Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents` → your environment → **Secrets** tab) as **Runtime Secret**s (loaded as env vars, redacted from the agent's transcript), **not** in `.cursor/environment.json`:

```
BKIT_LINEAR_API_KEY=<Linear personal API key — bkit-preflight.sh calls the GraphQL API>
BKIT_GH_TOKEN=<PAT — fine-grained for one owner, classic across owners; same permissions as the Claude side>
```

`LINEAR_ISSUE_ID` injected per-session by Cursor / Linear integration — do not hardcode.

Optional (context-fetch — only if you use `.agents/context.md` blocks, e.g. copied from `.bkit/templates/context/`; tokens below are **examples**, set whatever operator creds your enabled blocks need. Cloud-dashboard entries, not `.bkit/.env` — bkit/agent tooling only. Non-secret selectors (`VERCEL_SCOPE` / `SUPABASE_PROJECT_ID`) commit in copied block so cloud agents inherit without dashboard entry. CLIs install from each block's `context-fetch:provision` sibling):

```
VERCEL_TOKEN=<Vercel access token — https://vercel.com/account/settings/tokens>
SUPABASE_ACCESS_TOKEN=<Supabase Management API token — https://supabase.com/dashboard/account/tokens>
```

## Network access (Cursor side)

Cloud Agents get network access by default; egress is configurable in the dashboard → **Security**: **Allow all** / **Default + allowlist** / **Allowlist only**, at user / environment / team scope. Analogue of Claude's `Trusted` / `Custom`, but the allowlist is **deliberately narrower** — Cursor warns a broad `*.` wildcard opens egress far wider than intended, so add the **specific** subdomains you need rather than a wildcard. `.cursor/bkit-cloud.md` § Network access lists the derived hosts union any declared `allowed-domains`, as exact hosts (no auto-`*.` expansion, unlike the Claude side).

## After modifying `.cursor/*`

1. Run `pnpm bkit install` (this repo) or `pnpm install && pnpm bkit install` (consumer) to regenerate mirrors.
2. Commit changes.
3. **First Cursor session after Dockerfile changes slow** — image rebuilds. Subsequent sessions reuse cached layers.
4. Verify in-session: `vale --version && gh --version && pnpm -v && python3 --version`.

# Sharing across repos

## Claude — one environment per repo

Each repo gets **own** Claude environment, named after repo. Reason: **secrets, not mechanics**.

**Secrets are per-repo.** App tokens (Supabase, Stripe, Vercel, …) differ per repo; even bkit tokens differ in _scope_ (a fine-grained `BKIT_GH_TOKEN` is scoped to one resource owner / repo; covering different owners needs one classic PAT, which cannot be per-repo). One Claude environment = one value per name — shared env forces mega-scoped PAT across repos (wide blast radius) or one repo's secrets leaking into rest. Per-repo envs isolate secrets.

Shared across repos (copy, don't re-derive) — non-secret only:

- **Setup script** — generic binaries only (vale, gh, pnpm via corepack); repo-specific install deferred to committed `bkit-cloud-bootstrap.sh` (lockfile → `pnpm install`, `.vale.ini` → `vale sync`). One body fits every repo.
- **bkit baseline token _name_** (`BKIT_GH_TOKEN`) + **network policy** (`Trusted`) — same everywhere, values differ. Repo _other_ env vars **not** shared: copy from own env files per `.envrc` — drop `unset`s, skip `BKIT_ANTHROPIC_API_KEY` (§ Environment variables).
- **Non-secret selectors** (`VERCEL_SCOPE`, `SUPABASE_PROJECT_ID`) stay committed in-repo (§ Environment variables), never in dashboard.

## Cursor — byte-identical Dockerfile

Cursor environment-resolution order: (1) `.cursor/environment.json` in repo, (2) personal saved environment in Cursor account, (3) team saved environment. Three sharing patterns:

1. **In-repo copy (bkit default).** Each consumer repo carries `.cursor/Dockerfile` + `.cursor/environment.json`, copied from bkit's templates and owned by the repo. Functionally equivalent Cursor envs across consumers; bkit ships base-toolchain updates as template changes the consumer adopts.
2. **Personal saved environment (cross-repo).** Don't commit `.cursor/environment.json`; configure single environment in Cursor account dashboard. Cursor falls back for any session. Like any cross-repo environment — one secret set for all repos; prefer per-repo default (#1) when repos have distinct secrets.
3. **Multi-repo environment.** Cursor binds one environment to multiple repos cloned into same agent VM. Cross-repo work but agent sees all selected repos — different security boundary.

When bkit reference Dockerfile changes (e.g. vale bump):

- Consumer `.cursor/Dockerfile` **never** written by bkit (it is the consumer's copy of a template).
- `bkit upgrade` refreshes `.bkit/templates/.cursor/Dockerfile` and names it in its changed-templates list.
- Consumer diffs the refreshed template against their copy and merges what they want.

## What every consumer repo needs to do

1. `pnpm bkit install` — bkit-managed toolchain updates land in the written payload; `.claude/hooks/bkit-cloud-bootstrap.sh` is a copy-and-own template, so diff it against `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` when `bkit upgrade` lists that path and merge what you want. `.cursor/Dockerfile` is your copy of a template: diff it against `.bkit/templates/.cursor/Dockerfile` when `bkit upgrade` lists that path.
2. Set `BKIT_LINEAR_API_KEY`, `BKIT_GH_TOKEN` as **Runtime Secret**s in the Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents` → your environment → **Secrets** tab). Paste-ready values are in `.cursor/bkit-cloud.md`.
3. Add Claude environment **named after repo** at `claude.ai/code`; paste recipe from § Claude Code on the web (one environment per repo — secrets per-repo).
4. Customise `.cursor/Dockerfile` Node major / Playwright / extra system deps. Keep the `bkit toolchain` section as the template ships it, so a template diff stays readable.

# Post-CI auto-routing

After `bkit-build` Step 18 close-workflow pushes CI-trigger commit (`chore({FID}): close-workflow`, no skip tags) and exits, post-CI router decides ship vs. debug and dispatches matching skill in fresh cloud session — no operator action between CI completion and dispatched session.

Routing **logic** in single bkit-managed slash-command orchestrator (`.bkit/core/workflows/bkit-auto.md`, mirrored to `.claude/commands/bkit-auto.md` + `.cursor/commands/bkit-auto.md` on each `pnpm bkit install`). Routing **trigger** wired separately per IDE — different event surfaces.

## What lives where (post-CI half)

<!-- prettier-ignore -->
|  | Lives in the repo (bkit-managed) | Lives in the online dashboard / GitHub (manual, one-time) |
| --- | --- | --- |
| **Claude** | `.github/workflows/bkit-cloud.yml` — `claude` job (opt-in via `bkit install --auto=claude`; GitHub-tracker only). Two-tier gate: (1) free tier — job `if: contains(head_commit.message, 'bkit [auto route]')` (zero runner minutes for non-opted-in commits); (2) cheap tier — in-job `gh issue view {ISSUE} --json labels` re-checks `bkit:auto` (live kill switch); then dispatches `claude-code-action` as the Claude GitHub App (OIDC, `id-token: write`). | GitHub repo secret: `ANTHROPIC_API_KEY` (`.bkit/.env` holds the same value as `BKIT_ANTHROPIC_API_KEY`). Claude GitHub App required (`/install-github-app`). The linked **GitHub issue** must carry `bkit:auto`. |
| **opencode** | Same `.github/workflows/bkit-cloud.yml` — `opencode` job (opt-in via `bkit install --auto=opencode`; GitHub-tracker only). Same two-tier gate (same file, separate job). Dispatches via `opencode run "/bkit-auto $PHASE $ARG"`. No `id-token: write` — no OIDC; uses `github.token` for repo ops. | GitHub repo secret: `OPENCODE_PROVIDER_KEY` (set to your provider API key). Provider model committed in `.opencode/opencode.json`. The linked **GitHub issue** must carry `bkit:auto`. |
| **Cursor** | Nothing — Cursor cloud agents have native triggers. | Cursor → Cloud Agents dashboard → Triggers → + Add trigger. Event: CI workflow completion on `feat/**` branches. Prompt (paste **literally**, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`. Concurrency: latest-supersedes. |

**Why dashboard prompt never needs re-pasting:** Cursor substitutes `$CI_STATUS` and `$PR_NUMBER` from event payload at dispatch. Pasted string generic and timeless. When bkit routing logic evolves, only mirrored `.cursor/commands/bkit-auto.md` changes — dashboard untouched.

## Cursor dashboard — exact paste

```
/bkit-auto $CI_STATUS $PR_NUMBER
```

## Claude — required GitHub Actions permissions

Flip **both** org and repo before first router run — else `actions/checkout` 403s with `Write access to repository not granted`. Workflow declares `permissions: contents: write` at workflow scope, but org/repo "Workflow permissions" ceiling overrides — repo cannot exceed org.

- **Org**: `https://github.com/organizations/{ORG}/settings/actions` → Workflow permissions → **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.
- **Repo**: `https://github.com/{ORG}/{REPO}/settings/actions` → same section, same two settings. Apply at repo too — inheriting from org not automatic.

`workflow_run`-triggered runs do **not** inherit parent CI workflow's `permissions:` block (only fork-PR tokens get narrowed) — parent CI at `contents: read` fine.

## bkit-cloud.yml — required GitHub repo secrets

<!-- prettier-ignore -->
| Secret | Job | Why | Scope |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | `claude` | `claude-code-action` authenticates against Anthropic. | API key with Claude Code access. |
| `OPENCODE_PROVIDER_KEY` | `opencode` | Fanned out to every cloud provider's env var name (`BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`, `BKIT_OPENCODE_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider is installed. | Provider API key for whichever provider you configured. |

A `context` job checks both secrets and resolves phase + arg once; each runner job needs it and runs only when its own secret is set. Only `ANTHROPIC_API_KEY` → claude job only. Only `OPENCODE_PROVIDER_KEY` → opencode only. Both → both jobs (additive coexistence). **No `BKIT_LINEAR_API_KEY`** — `bkit-cloud.yml` GitHub-tracker only for both jobs. Workflow grants `id-token: write` per-job for claude only (opencode no OIDC).

Slash command body already in checked-out repo (mirrored to `.claude/commands/bkit-auto.md` and `.opencode/commands/bkit-auto.md` at dev time via `bkit install`). Repo git/gh ops use auto-provided `github.token` scoped by workflow `permissions:` block.

## Branch-aware routing

`bkit-cloud.yml`'s `workflow_run` trigger covers `feat/**` and `dev`. `main` is never auto-routed — `dev` -> `main` promotion stays manual.

<!-- prettier-ignore -->
| CI trigger | success | failure |
| --- | --- | --- |
| `feat/**` (pre-merge) | -> `/bkit-ship` | -> `/bkit-debug` |
| `dev` (post-merge) | no-op — the merge already happened | -> `/bkit-debug {FID}` (capped) |
| `main` | manual only | manual only |

**Build still running (`feat/**`):** before dispatch, read the branch's `docs/plans/*/logs/{FID}/status.jsonl` from `origin`:

- `build` `workflow-started`, no later `workflow-done` / `workflow-failed`, newest build row < 30 min old → `/bkit-build` owns the branch → no-op.
- Newest build row >= 30 min old → abandoned → dispatch.
- No file / unreadable → dispatch.

The post-merge `dev` surface reuses the same free-tier gate: `/bkit-ship` threads ` bkit [auto route]` onto the PR squash-merge `--subject` when the issue carries `bkit:auto`, so the commit that lands on `dev` — and triggers post-merge CI — already carries the marker the gate checks.

## Routing decision (router orchestrator)

Slash command takes two args: `$CI_STATUS` ∈ `{success, failure, pass, fail}` (normalised) and `$ARG` — a PR number (pre-merge) or a `{FID}` slug (post-merge `dev`, no open PR). Then:

1. PR-number arg: reads `gh pr view $ARG` for `headRefName`, `headRefOid`, `state`. Refuses non-open PRs. Slug arg: skips the PR lookup entirely.
2. Extracts `{FID}` from the head branch (`feat/{FID}` convention). Slug arg: `{ARG}` is the `{FID}`, allowlist-asserted before use. On the `dev` surface the workflow recovers it from the squash-merge commit scope (`feat({FID}): …`, tracker-agnostic), falling back to the linked PR body's `bkit:fid=` marker; either path failing → no-op, no dispatch.
3. Stale-run guard. Pre-merge: compares latest CI run's `headSha` against the PR's current `headRefOid`. Post-merge `dev`: compares the most recently COMPLETED `dev` CI run's `headSha` against the triggering run's head SHA — a `git rev-parse origin/dev` comparison would mismatch on every legitimate dispatch, because ship's terminal close commit lands on `dev` while that CI run is still going. Close commits carry `[skip ci]`, so they never trigger CI and never become that most-recent-completed head. An empty run list fails open (dispatches).
4. Opt-in gate: refuses dispatch unless linked GitHub issue carries `bkit:auto` label.
5. Appends `bkit-auto → /bkit-{ship,debug}` line to GitHub issue / PR comment thread.
6. Invokes `/bkit-ship {FID}` (CI pass) or `/bkit-debug {FID} DEBUG_MODE=pr` (CI fail) via `Skill` / `Task` tool. Dispatched skill owns session lifecycle from there.

Skip conditions emit single GitHub-comment no-op line and exit 0 — only real failures (missing args, GitHub API unreachable, malformed state) take Failure Path.

## Operating notes

- **Loop bound (pre-merge `feat/**`):** `/bkit-debug` enforces `MAX_DEBUG_ATTEMPT = 3` internally; router never counts attempts. After three red CI runs, debug fires handover path and stops dispatching.
- **Loop bound (`dev`):** `MAX_DEV_DISPATCH_ATTEMPTS = 3` distinct failed CI SHAs per `{FID}`, all-time. This is the surface that needs a cross-session cap: `/bkit-debug` adopts `dev` in place, so its fix push re-reds `dev` CI and re-triggers this same router. Checked and written by the ctx step of `bkit-cloud.yml`'s `context` job immediately before dispatch — the in-session counters reset on every new cloud dispatch and cannot bound a cross-session loop. The counter row (`type: "dev-dispatch"`) is committed to `dev` with `[skip ci]` before dispatch, and its presence on `origin/dev` is verified after one retry — a row landing nowhere durable would degrade the cap to unbounded. Exhausted → no-op + `::notice::` for operator review (delete the rows in `status.jsonl` to reset).
- **GHA 6 h cap:** `3 x ~3600s` per debug attempt = well under GHA runner ceiling. Ship is short.
- **Concurrency:** `cancel-in-progress` is `true` for `feat/**` (latest-wins) and `false` for `dev`, so an in-flight `/bkit-debug` finishes instead of being cancelled mid-run with a half-written `status.jsonl` or a held worktree lock. GHA queues at most one pending run per group; the queued run re-checks the dispatch cap when it starts, so the same `{FID}` needs no manual re-trigger. Cursor dashboard trigger → "latest-supersedes." Ship squash-merge atomic — mid-run cancels cannot corrupt PR state.
- **`bkit-auto-dev` is one concurrency group for all FIDs.** GHA resolves `concurrency.group` from trigger-payload context before the ctx step derives the `{FID}`, so the group cannot be keyed on it. Two different FIDs failing `dev` CI near-simultaneously → queue-collapse can drop the older, different FID's pending run. The stale-run guard detects it (its head SHA no longer matches the most-recent-completed `dev` CI run) and writes a `dev-dispatch-dropped` row to the job summary plus a `::warning::`, rather than discarding it silently. Job summary, not a committed `status.jsonl`: this branch is only reached because `dev` already advanced, so committing the row would usually be a non-fast-forward and be lost in exactly the case it records.
- **Both clouds together:** nothing stops Claude + Cursor dispatching against same PR — they'd race. Pick one IDE per repo as auto-router (recommended: Claude via GHA, runner-resident and Anthropic-maintained). Leave Cursor for ad-hoc Linear-dispatch work.

# Caveats (both clouds)

- **No secrets store yet (Claude).** Env vars and setup-script body plaintext in Claude app. Rotate PATs regularly.
- **Env vars do not reach Claude setup script.** Auth at snapshot-build time must be inlined — leak you want to avoid. Design around it: public binaries in setup script; defer auth-bearing work to SessionStart hook.
- **Cache invalidation is body-based (Claude).** Editing env-vars block or repo-side hook scripts doesn't trigger rebuild. Use `# cache-bust YYYY-MM-DD-N` to force one.
- **Husky runs on `pnpm install`** (repos that adopted the `.husky/*` templates). `prepare` registers git hooks during install. The pre-commit hook (`bkit:gate:format` → `lint-staged`) runs when agent commits. `slop-scan` devDep → PATH via `node_modules/.bin`; `vale` system binary → setup script (Claude) or Dockerfile (Cursor).
- **Bun proxy issues (Claude).** Bun known proxy issues with cloud security proxy. bkit uses pnpm — unaffected; flag for bun consumers.
- **Custom base image not supported (Claude).** Escape hatch: `docker compose` sidecars. Not needed for bkit stack today.
- **Cursor image cache layer-based.** Reorder `RUN` lines carefully — frequently-changing line above slow one invalidates cache below.
- **GitHub App vs `/web-setup` (Claude).** Auto-fix PRs require GitHub App. `/web-setup` (sync `gh` token to Claude account) enough for clone + push, not auto-fix.
- **IP allowlists** on org GitHub / Anthropic accounts block cloud sessions — contact support to exempt managed infra.
- **pnpm `.npmrc` substitution.** Use `${VAR}` only, never `${VAR:-default}` — pnpm does not parse POSIX fallback and sends no auth → 401 on `@cbartens/bkit`. Both clouds equally.

# Sources

- Anthropic docs: <https://code.claude.com/docs/en/claude-code-on-the-web>
- Cursor Cloud Agents: <https://cursor.com/docs/cloud-agent/setup>
- Zenn article on Claude env-var/setup-script gotcha: <https://zenn.dev/harieshokunin/articles/b1064354319ce2?locale=en>
- Managed Agents environments (separate product, similar shape): <https://platform.claude.com/docs/en/managed-agents/environments>
