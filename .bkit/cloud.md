# Cloud agent environments — Claude Code on the web + Cursor Background Agents

> [!CAUTION]
> **Purpose:** Single source of truth for both Claude Code on the web (mobile / web) and Cursor Background Agents. The two stacks ship the **same toolchain** (vale / pnpm / gh) so the dev experience matches — but they pair with **different trackers**: Claude ↔ GitHub, Cursor ↔ Linear (see § Cloud-agent support matrix). They are not interchangeable per repo; pick the agent that matches your tracker.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent + maintainer readers.
> - Claude's env config lives in the Claude app; Cursor's lives in `.cursor/` in-repo. Both have an in-repo SessionStart guard.
> - Update this doc when either cloud's pre-installed toolchain or default allowlist changes. Sources: `code.claude.com/docs/en/claude-code-on-the-web` + `cursor.com/docs/background-agent`.

## Scope

> **Host-delta matrix:** `.bkit/IDEs.md` § Runtime environment (cloud agents). That table is the canonical "what differs" reference for Claude vs Cursor cloud agents. This file = paste-in setup recipe, alignment guarantees, sharing-across-repos pattern, and caveats.

## Cloud-agent support matrix (read first)

The two cloud stacks are **not symmetric** — each agent pairs with one tracker. Pick the row for the agent you actually run:

<!-- prettier-ignore -->
| Agent (the agent, not the editor) | Ways to launch a cloud agent | Tracker | NOT supported |
| --- | --- | --- | --- |
| **Claude Code** (terminal — any IDE host) | **A)** Claude iOS / desktop app → Claude-on-web env (`.claude/hooks/cloud-bootstrap.sh` + the env defined in `claude.ai/code`) · **B)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick any phase + issue) · **C)** GitHub issue label / status change → webhook → `bkit-cloud` GH Action · **D)** GitHub CI pass/fail → `bkit-cloud` · **E)** `@claude` mention on a GitHub issue / PR (`/install-github-app` required — **base requirement** for `cloud=claude`) | **GitHub** | **Linear** |
| **Cursor** (native agent) | **A)** Cursor's built-in cloud-agent launch · **B)** Cursor's GitHub integration on PR events (CI pass/fail) · **C)** Linear → Cursor integration | **Linear** (+ GitHub PR events) | **GitHub Projects / Issues** |

**Claude cloud ↔ GitHub; Cursor cloud ↔ Linear.** They overlap only on GitHub CI/PR events — everything _tracker_-driven is split: a GitHub-issue label triggers the Claude `bkit-cloud` workflow (never Cursor); a Linear issue triggers a Cursor agent (never the `bkit-cloud` GH Action). Choose the agent that matches your tracker. The `bkit-cloud` GH Action is the **Claude / GitHub** path only — it is not a Linear bridge.

**Manual dispatch (Claude, path B):** GitHub → **Actions** → **bkit-cloud** → **Run workflow** → pick `phase` (`ship` / `debug` / `design` / `plan` / `build`) + `issue`. This is the on-demand / smoke-test entry point for `design` / `plan` / `build`; `ship` / `debug` normally fire from CI (path D). The dispatched `/bkit-cloud` orchestrator routes to the matching phase skill, which reads its brief from the GitHub issue (MCP).

**`@claude` mention launch (Claude, path E — base requirement for `cloud=claude`):** Run `/install-github-app` (Claude Code CLI) once to install the official Claude GitHub App on your repo. This is required: `bkit-cloud.yml` grants `id-token: write` and `claude-code-action@v1` authenticates as the App via OIDC — without the App installed the action fails at boot with an OIDC error. After installation, comment `@claude /bkit-plan` (or any phase) on a GitHub issue / PR to launch it from the tracker. This is **additive**: the App's generated `claude.yml` triggers on mention events while `bkit-cloud.yml` triggers on CI completion + `workflow_dispatch`, so the two coexist without conflict. The App also gives the runner its GitHub identity for the `mcp__github__*` surface. Use `bkit install --cloud=claude` (not bare `--cloud`) to install the cloud integration; `cloud=claude` requires `tracker=github`.

## What lives where (orient first)

<!-- prettier-ignore -->
| Configuration | Lives in the repo (bkit-managed) | Lives in the online dashboard (manual, one-time) |
| --- | --- | --- |
| **Claude Code on the web** | `.claude/hooks/preflight.sh` (tracker opt-in guard) + `.claude/hooks/cloud-bootstrap.sh` (per-session install — Tier 2 markered, customise outside markers) | `claude.ai/code` → environment selector → **+ Add environment**: name, **setup script** (paste from § Setup script), **environment variables** (`GH_TOKEN`, `GH_BKIT_TOKEN`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` — Claude pairs with the **GitHub** tracker, so no `LINEAR_API_KEY`), **network access** (`Trusted`) |
| **Cursor Background Agents** | `.cursor/Dockerfile` (Tier 2 markered toolchain block + consumer extensions) + `.cursor/environment.json` (consumer-owned `install` / `start` / `terminals[]` / `env`) + `.cursor/hooks.json` (wires preflight `failClosed: true`) + `.cursor/hooks/preflight.sh` (Linear guard) | Cursor → **Settings → Background Agents → Environment Variables**: `LINEAR_API_KEY`, `GH_TOKEN`, `GH_BKIT_TOKEN`. (`LINEAR_ISSUE_ID` injected per-session by the integration — don't hardcode.) |

**Rule of thumb:** if it's an env var or auth token, it goes in the online dashboard (out of git). If it's a script / Dockerfile / install hook, it lives in the repo.

**Alignment guarantees bkit enforces:**

- Same vale version (3.9.1) pre-installed on both clouds.
- Same pinned pnpm (`10.33.0`, matching `packageManager`) on both.
- Same gh CLI install path (apt repo on Ubuntu 24.04).
- Same opt-in-guard pattern — an opt-in label `bkit:auto` — wrapped in `<!-- bkit:start --> ... <!-- bkit:end -->` so it stays bkit-managed in consumer repos. The label is `bkit:auto` on both trackers (Linear's bare `Auto` migrates to `bkit:auto`).

## Background

Both clouds run Ubuntu 24.04 (4 vCPU / 16 GB RAM / 30 GB disk class). Pre-installed inventories differ:

<!-- prettier-ignore -->
| Pre-installed | Claude Code on the web | Cursor Background Agents (after bkit Dockerfile) |
| --- | --- | --- |
| Node | 20 + 22 | 20 (matches `.nvmrc` + CI; bump in lockstep) |
| Package manager | pnpm + bun (latest) | pnpm `10.33.0` (corepack-pinned) |
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

## Where config lives

Open `claude.ai/code` → environment selector → **+ Add environment**. The three configurable surfaces are setup script (bash, runs as root once, snapshotted), environment variables (`.env` format, plaintext, visible to anyone with edit access), and network access (`None` / `Trusted` / `Full` / `Custom`).

## In-repo side

- `.claude/hooks/preflight.sh` — Tracker opt-in guard. Skips silently when the tracker issue ID env var is unset (i.e. IDE sessions). Non-zero exit is informational only on Claude (`SessionStart` cannot block); the agent reads the `HARD STOP` text from `additionalContext`.
- `.claude/hooks/cloud-bootstrap.sh` — runs `pnpm install --frozen-lockfile` and `vale sync` when `CLAUDE_CODE_REMOTE=true`. No-op locally.
- Both registered in `.claude/settings.json` under `hooks.SessionStart`.

Ships with the repo — you don't paste these into the app.

## What to paste into the Claude app

### Name

```
bkit-shared
```

One env name, reused across bkit + every consumer repo your account can reach. See **§ Sharing across repos** for why this works.

### Network access

`Trusted` (default). The default allowlist covers npm, GitHub Packages, the vale release tarball on `objects.githubusercontent.com`, Docker Hub, and PyPI. No custom domains required.

### Environment variables

Minimum:

```
GH_TOKEN=<fine-grained PAT — see permissions below>
GH_BKIT_TOKEN=<classic PAT with read:packages>
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70
```

Claude pairs with the **GitHub** tracker (see § Cloud-agent support matrix), so no `LINEAR_API_KEY` / `LINEAR_ISSUE_ID` — GitHub MCP + `gh` authenticate via `GH_TOKEN`.

Release-only:

```
GITHUB_TOKEN=<classic PAT with write:packages + repo>
```

#### `GH_TOKEN` — fine-grained PAT permissions

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

`gh` reads `GH_TOKEN` automatically; no `gh auth login`.

> **Projects v2 board sync (`bkit.githubProject`):** the **Projects** permission is an **Organization** permission (table row above) — it only appears when the token's **resource owner is the org**, _not_ your personal account, and the org may require the token to be **approved**. It lives under the token UI's **Organizations** tab, not Repository permissions, and governs `…/orgs/{org}/projectsV2/…`. User-owned (personal-account) boards are unreachable by fine-grained PATs entirely — see below.

#### When classic is still required

- **`pnpm publish` to GitHub Packages.** Fine-grained packages support has edge cases on user-owned packages. Put a classic PAT (`write:packages` + `repo`) in `GITHUB_TOKEN`, separate from `GH_TOKEN`. Keep it only in release-flow sessions.
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
  curl -sfLO "https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz"
  tar -xzf "vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -C /usr/local/bin vale
  chmod +x /usr/local/bin/vale
fi

apt-get update -qq && apt-get install -y --no-install-recommends gh

corepack enable && corepack prepare pnpm@10.33.0 --activate

echo "bkit-shared ready: $(vale --version), $(gh --version | head -1), pnpm $(pnpm -v)"
```

What this does and why it's split from the in-repo hook:

- **Vale + gh** install once into the snapshot — they are binaries the cloud lacks but your laptop already has, so they do not belong in a repo-level hook.
- **pnpm corepack pin** ensures the snapshot matches `packageManager` in `package.json`.
- `pnpm install` and `vale sync` are **not** here — they belong in `.claude/hooks/cloud-bootstrap.sh` so they re-run on resumed sessions when the lockfile or styles have drifted, and so each repo can install its own deps.

Keep total runtime under ~5 minutes or the snapshot won't build.

## Environment variables

Token management splits by session type:

- **Local sessions** — bkit seeds `.bkit/.env.example` (token placeholders) and `.envrc` (`dotenv_if_exists .bkit/.env`) on first install. Copy `.env.example` to `.bkit/.env`, fill in your tokens, then run `direnv allow`. direnv auto-exports `GH_TOKEN`, `GH_BKIT_TOKEN`, and `LINEAR_API_KEY` into your shell whenever you enter the repo — no manual `source` or shell-rc export needed. `.bkit/.env` is gitignored; never commit it.

  ```bash
  cp .bkit/.env.example .bkit/.env
  # edit .bkit/.env — fill in GH_TOKEN, GH_BKIT_TOKEN, LINEAR_API_KEY
  direnv allow
  ```

- **Cloud sessions** (Claude Code on the web, Cursor Background Agents) — the `.bkit/.env` file is not present in cloud containers. Set the same names (`GH_TOKEN`, `GH_BKIT_TOKEN`, `LINEAR_API_KEY`) in the respective online dashboards: Claude app → environment selector → Environment variables; Cursor → Settings → Background Agents → Environment Variables. The dashboard list in the sections below is the canonical reference for which names to set.

## MCP issue-tracker integration

bkit wires two MCP servers into `.mcp.json` at the repo root (project-shared, read by Claude Code's `/mcp` UI). Cursor reads the same shape from `.cursor/mcp.json`. Both are **remote HTTP MCPs with OAuth-on-first-use** — no PATs, no env vars, no docker. Claude Code launches a browser auth flow the first time each server is touched, and stores the resulting token in its own secret store.

> Note: `mcpServers` declared inside `.claude/settings.json` is silently ignored by Claude Code — server definitions only take effect from `.mcp.json` (project) or `claude mcp add` (user scope). The `mcp__<name>__*` entries in `.claude/settings.json` `permissions.allow` are tool-permission allowlists, which is a different concern and remain there.

```json
"mcpServers": {
  "linear": { "type": "http", "url": "https://mcp.linear.app/mcp" },
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": { "Authorization": "Bearer ${GH_TOKEN}" }
  }
}
```

`"type": "http"` is required — without it Claude Code defaults to stdio transport and rejects the entry for missing `command`.

- **Linear** — full Linear workspace surface (`get_issue`, `save_issue`, `save_comment`, `list_*`). Used by workflows when `bkit.issueTracker` is set to `linear`. Authenticates via OAuth (Dynamic Client Registration) — browser flow on first use, no env var needed.
- **GitHub** — official GitHub MCP server at `api.githubcopilot.com` (not gated by a Copilot subscription). Surface includes `issue_write`, `add_issue_comment`, `label_write`, `projects_write`, etc. Used by workflows under the GitHub provider (default once migration #39 lands). The endpoint does **not** support OAuth DCR, so authentication is via `Authorization: Bearer ${GH_TOKEN}` — reusing the same fine-grained PAT bkit already requires for the `gh` CLI surface (see § Environment variables).

**Auth flow per server:**

- **Linear:** Claude Code prompts a browser authorize on first use; token stored in Claude's local secret store. No further action.
- **GitHub:** Claude Code substitutes `${GH_TOKEN}` from the environment at session start. If `GH_TOKEN` is unset, the server fails to connect. Set it in the shell (`export GH_TOKEN=...`) or, for cloud sessions, in the dashboard env vars.

**`gh auth login` is still required separately** for the gh CLI surface (PR creation, branch ops, git push). `GH_TOKEN` is read automatically by both `gh` and the GitHub MCP — they share the PAT but exercise different surfaces.

**Cloud sessions** (Claude on the web, Cursor Background Agents): Linear MCP runs its OAuth flow on first touch, same as local. GitHub MCP reads `GH_TOKEN` from the dashboard env vars — make sure it's set there alongside `LINEAR_API_KEY` and `GH_BKIT_TOKEN`.

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
| `.cursor/Dockerfile` | Cloud image — vale + gh + Node 22 + pnpm `10.33.0` + Playwright chromium | Tier 3 seed; consumer-owned after first install |
| `.cursor/environment.json` | Build pointer + per-snapshot `install` hook (`pnpm install --frozen-lockfile` + `vale sync` if `.vale.ini`) | Tier 3 seed |
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
GH_TOKEN=<fine-grained PAT — same permissions as the Claude side>
```

`GITHUB_ISSUE_ID` is injected per-session — do not hardcode. No `LINEAR_API_KEY`, `LINEAR_ISSUE_ID`, or `GH_BKIT_TOKEN` needed for tracker calls (MCP auth is browser OAuth; `gh auth login` covers the CLI surface and is satisfied by `GH_TOKEN`).

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
GH_TOKEN=<fine-grained PAT — same permissions as the Claude side>
GH_BKIT_TOKEN=<classic PAT with read:packages — consumer repos only>
```

`LINEAR_ISSUE_ID` is injected per-session by the Cursor / Linear integration — do not hardcode.

## After modifying `.cursor/*`

1. Run `pnpm bkit install` (in this repo) or `pnpm install && pnpm bkit install` (consumer) to regenerate mirrors.
2. Commit the changes.
3. **First Cursor session after Dockerfile changes is slow** — the image rebuilds. Subsequent sessions reuse the cached layers.
4. To verify in-session: `vale --version && gh --version && pnpm -v && python3 --version`.

# Sharing across repos

## Claude — one env, many repos

The Claude environment lives in your Claude account, not in a repo. The setup script installs **only generic binaries** (vale, gh, pnpm). Per-repo work happens via the repo's `cloud-bootstrap.sh`. That separation means:

- One named env (`bkit-shared`) covers bkit + every consumer repo (current and future).
- Each repo's `package.json` lockfile drives `pnpm install`; each repo's `.vale.ini` drives `vale sync`.
- No per-repo Claude env juggling.

The only thing that changes per repo is your **fine-grained PAT scope** — if a single PAT covers all the repos you'll work on from cloud, one env is enough.

## Cursor — byte-identical Dockerfile

Cursor's environment-resolution order is: (1) `.cursor/environment.json` in the repo, (2) a personal saved environment in your Cursor account, (3) a team saved environment. Three viable sharing patterns follow from that precedence:

1. **In-repo Tier 2 markered (bkit default).** Each consumer repo carries `.cursor/Dockerfile` + `.cursor/environment.json`. bkit owns the toolchain block inside `# <!-- bkit:start -->` / `# <!-- bkit:end -->` markers; consumers customise outside. Result: functionally equivalent Cursor envs across all consumer repos, with bkit able to ship base-toolchain updates without trampling consumer changes.
2. **Personal saved environment (cross-repo).** Don't commit `.cursor/environment.json` to any repo and configure a single environment in the Cursor account-level dashboard. Cursor falls back to it for any session. Same model as Claude's `bkit-shared` env.
3. **Multi-repo environment.** Cursor supports binding one environment to multiple selected repositories that get cloned into the same agent VM. Useful for cross-repo work but the agent sees all selected repos at once — different security boundary.

When bkit's reference Dockerfile changes (e.g. vale version bump):

- Consumer's `.cursor/Dockerfile` is **not** auto-overwritten (Tier 3 seed-only).
- `pnpm bkit install` prints the new reference with merge instructions.
- Consumer merges manually (or deletes their copy and lets bkit re-seed if they have no local edits).

## What every consumer repo needs to do

1. `pnpm bkit install` — picks up bkit-managed toolchain updates inside the `# <!-- bkit:start -->` / `# <!-- bkit:end -->` blocks of `.cursor/Dockerfile` and `.claude/hooks/cloud-bootstrap.sh` without touching consumer customisations outside the markers.
2. Set `LINEAR_API_KEY`, `GH_TOKEN`, `GH_BKIT_TOKEN` in Cursor → Settings → Background Agents → Environment Variables.
3. Add the `bkit-shared` Claude env (or a per-repo Claude env) at `claude.ai/code` and paste the recipe in this doc.
4. Customise `.cursor/Dockerfile` Node major / Playwright / extra system deps **outside** the bkit-managed block; the file is byte-stable for bkit's bytes inside the markers, fully consumer-owned outside.

# Post-CI auto-routing

After `bkit-build` Step 18 close-workflow pushes its CI-trigger commit (`chore({FID}): close-workflow`, no skip tags) and exits, the post-CI router decides ship vs. debug and dispatches the matching skill in a fresh cloud session — no operator action between CI completion and the dispatched session starting.

The routing **logic** lives in a single bkit-managed slash-command orchestrator (`.bkit/workflows/bkit-cloud.md`, mirrored to `.claude/commands/bkit-cloud.md` + `.cursor/commands/bkit-cloud.md` on each `pnpm bkit install`). The routing **trigger** is wired separately per IDE because the two clouds use different event surfaces.

## What lives where (post-CI half)

<!-- prettier-ignore -->
|  | Lives in the repo (bkit-managed) | Lives in the online dashboard / GitHub (manual, one-time) |
| --- | --- | --- |
| **Claude** | `.github/workflows/bkit-cloud.yml` (thin plumbing — canonical, opt-in via `bkit install --cloud=claude`; GitHub-tracker only). On CI completion, two-tier gate fires: (1) free tier — job `if: contains(head_commit.message, 'bkit [auto route]')` (zero runner minutes for non-opted-in commits); (2) cheap tier — in-job `gh issue view {ISSUE} --json labels` re-checks `bkit:auto` (live kill switch); then dispatches `claude-code-action@v1` as the Claude GitHub App (OIDC, `id-token: write`). | GitHub repo secret: `ANTHROPIC_API_KEY`. Claude GitHub App required (`/install-github-app`). The linked **GitHub issue** must carry `bkit:auto`. No `LINEAR_API_KEY` — GitHub-tracker only. |
| **Cursor** | Nothing — Cursor cloud agents have native triggers. | Cursor → Cloud Agents dashboard → Triggers → + Add trigger. Event: CI workflow completion on `feat/**` branches. Prompt (paste **literally**, no edits): `/bkit-cloud $CI_STATUS $PR_NUMBER`. Concurrency: latest-supersedes. |

**Why the dashboard prompt never needs re-pasting:** Cursor substitutes `$CI_STATUS` and `$PR_NUMBER` from the event payload at dispatch time. The pasted string is generic and timeless. When bkit's routing logic evolves (new edge cases, new gates), only the mirrored `.cursor/commands/bkit-cloud.md` changes — the dashboard config is untouched.

## Cursor dashboard — exact paste

```
/bkit-cloud $CI_STATUS $PR_NUMBER
```

## Claude — required GitHub Actions permissions

Flip **both** org and repo before the first router run, otherwise `actions/checkout@v4` 403s with `Write access to repository not granted`. The workflow declares `permissions: contents: write` at workflow scope, but the org/repo "Workflow permissions" ceiling overrides it — repo cannot exceed org.

- **Org**: `https://github.com/organizations/{ORG}/settings/actions` → Workflow permissions → **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.
- **Repo**: `https://github.com/{ORG}/{REPO}/settings/actions` → same section, same two settings. Apply at the repo too — inheriting from org is not automatic.

`workflow_run`-triggered runs do **not** inherit the parent CI workflow's `permissions:` block (only fork-PR tokens get narrowed), so the parent CI staying at `contents: read` is fine.

## Claude — required GitHub repo secrets

<!-- prettier-ignore -->
| Secret | Why | Scope |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | `claude-code-action@v1` authenticates against Anthropic. | API key with Claude Code access. |

`ANTHROPIC_API_KEY` is the only required secret. **No `LINEAR_API_KEY`** — the Claude `bkit-cloud` path is GitHub-tracker only. The workflow grants `id-token: write` so `claude-code-action@v1` can authenticate as the Claude GitHub App via OIDC — the App is a base requirement (`/install-github-app`). Repo git/gh access uses the auto-provided `github.token` scoped by the `permissions:` block.

The router does **not** need `GH_BKIT_TOKEN`. The slash command body is already in the checked-out repo (mirrored to `.claude/commands/bkit-cloud.md` at dev time via `bkit install`), and the workflow has no `pnpm install` step that would pull `@cbartens/bkit`. Repo git/gh operations (checkout, `gh pr list`, status.jsonl push) use the auto-provided `github.token` scoped by the workflow's `permissions:` block (which in turn is capped by the org/repo Workflow permissions setting above).

## Routing decision (router orchestrator)

The slash command takes two args: `$CI_STATUS` ∈ `{success, failure, pass, fail}` (normalised) and `$PR_NUMBER`. It then:

1. Reads `gh pr view $PR_NUMBER` for `headRefName`, `headRefOid`, `state`. Refuses non-OPEN PRs.
2. Extracts `{FID}` from the head branch (`feat/{FID}` convention).
3. Stale-run guard: compares the latest CI run's `headSha` against the PR's current `headRefOid`. Skips on mismatch (newer commit already in flight).
4. Opt-in gate: refuses to dispatch unless the linked GitHub issue carries the `bkit:auto` label.
5. Appends a `bkit-cloud → /bkit-{ship,debug}` line to the GitHub issue / PR comment thread.
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

# Sources

- Anthropic docs: <https://code.claude.com/docs/en/claude-code-on-the-web>
- Cursor Background Agents: <https://cursor.com/docs/background-agent>
- Zenn article on Claude env-var/setup-script gotcha: <https://zenn.dev/harieshokunin/articles/b1064354319ce2?locale=en>
- Managed Agents environments (separate product, similar shape): <https://platform.claude.com/docs/en/managed-agents/environments>
- Linear BAR-191 (initial research and design)
