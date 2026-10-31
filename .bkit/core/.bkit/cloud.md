# Cloud agent environments — Claude Code on the web + Cursor Cloud Agents + Codex Cloud + opencode

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** The canonical reference for Claude Code on the web (mobile / web), Cursor Cloud Agents, Codex Cloud and opencode cloud runners. Environments do not depend on the tracker: every generated `<host>/bkit-cloud.md` carries the same env block (`BKIT_GH_TOKEN` plus whatever `.envrc` resolves, tracker keys included) for any tracker. Dispatch pairs each agent with one tracker: Claude and opencode with GitHub (one unified `bkit-cloud.yml`), and Cursor with Linear. Jira and Codex Cloud have no bkit dispatch, so you launch those runs by hand (§ Cloud-agent support matrix).
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - This file ships to every project that installs bkit. Describe the current setup only.
> - Leave out internal labels, such as tracker issue numbers, ledger keys and review-finding ids, and leave out project history. Decisions go in `docs/decisions.jsonl`, and incidents go in `docs/knowledge.jsonl`.
> - Claude's environment config lives in the Claude app, and Cursor's lives in `.cursor/` in the repo. Both have an in-repo SessionStart guard.
> - Update this file when any of the three clouds' pre-installed toolchain or default allowlist changes. The sources are `code.claude.com/docs/en/claude-code-on-the-web`, `cursor.com/docs/cloud-agent/setup` and `learn.chatgpt.com/docs/environments/cloud-environments`.

## Scope

> **Host-delta matrix:** `.bkit/providers.md` § Runtime environment (cloud agents) is the canonical home for what differs between Claude and Cursor cloud agents. This file holds the paste-in setup recipe, the alignment guarantees, the pattern for sharing across repos, and the caveats.

## Cloud-agent support matrix (read first)

Dispatch pairs each agent with one tracker, while the environments (`<host>/bkit-cloud.md`) work with any tracker. Pick the row for the agent you run:

<!-- prettier-ignore -->
| Agent (the agent, not the editor) | Ways to launch a cloud agent | Tracker | not supported |
| --- | --- | --- | --- |
| **Claude Code** (terminal — any IDE host) | **A)** Claude iOS / desktop app → Claude-on-web env (`.claude/hooks/bkit-cloud-bootstrap.sh` + the env defined in `claude.ai/code`) · **B)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick phase + issue) · **C)** GitHub CI pass / fail → `bkit-cloud.yml` claude job · **D)** `@claude` mention on a GitHub issue / PR (needs `/install-github-app`, the base requirement for `cloud=claude`) | GitHub | Linear |
| **opencode** (GitHub runner) | **A)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick phase + issue) · **B)** GitHub CI pass / fail → `bkit-cloud.yml` opencode job (requires `OPENCODE_PROVIDER_KEY` secret) · **C)** reactive `/oc` comment handler (self-installed, not bkit's: § Reactive comment handlers) | GitHub | Linear |
| **Cursor** (native agent) | **A)** Cursor's built-in cloud-agent launch · **B)** Cursor's GitHub integration on PR events (CI pass / fail) · **C)** Linear → Cursor integration | Linear (+ GitHub PR events) | GitHub Projects / Issues |
| **Codex** (Codex Cloud) | **A)** ChatGPT Codex → task on the env from `.codex/bkit-cloud.md` (manual; no bkit dispatch) | any (tracker MCP + env block) | bkit-triggered runs |

**Unified file — additive coexistence:** Claude and opencode share one `bkit-cloud.yml`. A `context` job resolves the phase once, and two runner jobs follow, each gated at run time on its own credential: the claude job on the `ANTHROPIC_API_KEY` secret or the federation variables, and the opencode job on `OPENCODE_PROVIDER_KEY`. Both jobs can fire on the same CI event. With both credentials set, both agents run, and with one set, only that agent runs. Cursor is separate: it has no GitHub Action and uses its native triggers. Cursor cloud pairs with Linear.

**Manual dispatch (Claude or opencode, path A):** GitHub → **Actions** → **bkit-cloud** → **Run workflow**, then pick `phase` (`ship` / `debug` / `design` / `plan` / `build`) and `issue`. Use it on demand, or as a smoke test, for `design` / `plan` / `build`. `ship` / `debug` normally fire from CI. A dispatched `design` runs headless (`runtimeHeadless` = true on a GitHub runner): Grill asks nothing, records each recommended answer as `Assumed, not confirmed`, and records the draft acceptance scenario as not reviewed by a human. A dispatched `/bkit-auto` orchestrator hands off to the matching phase skill, which takes its brief from the GitHub issue through the MCP.

### Reactive comment handlers (`claude.yml` + `opencode.yml`) — separately managed, not bkit

`.github/workflows/claude.yml` (the `@claude` handler) and `.github/workflows/opencode.yml` (the `/oc` handler) are not bkit's. Each is generated, and regenerated, by its own vendor tool. bkit ships no template for either, and `bkit install` / `upgrade` never writes, rewrites or drift-gates them: neither is in the bkit manifest. They coexist additively with `bkit-cloud.yml`, the CI-completion and `workflow_dispatch` lane, which bkit ships as a template. A comment fires the vendor handler, and a CI run fires `bkit-cloud.yml`.

<!-- prettier-ignore -->
| Reactive handler (not bkit) | Installed by (vendor tool) | Auth | Launch a bkit phase |
| --- | --- | --- | --- |
| `.github/workflows/claude.yml` | `/install-github-app` (Claude Code CLI → official Claude GitHub App) | OIDC as the App (`bkit-cloud.yml` grants `id-token: write`; no App installed → OIDC error at boot) | comment `@claude /bkit-plan` (or any phase) on an issue / PR |
| `.github/workflows/opencode.yml` | `opencode github install` (opencode CLI) | your provider key (`BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / etc.) — no App, no OIDC | comment `/oc` or `/opencode` on an issue / PR |

You maintain these files, not bkit. `opencode.yml` hardcodes a `model:` and a provider-secret `env:`. Keep both in sync with your installed opencode provider. `bkit check` and postinstall raise a non-fatal advisory when they drift. Fix the file by hand, because bkit will not rewrite it. `claude.yml` has no equivalent check, because its `@claude` handler is fixed to Claude as its provider. For Claude, the `@claude` path is the base requirement for `cloud=claude`. Enable it with `bkit install --auto=claude`, which works with the GitHub tracker only. The App also gives the runner a GitHub identity for the `mcp__github__*` surface.

## What lives where (orient first)

<!-- prettier-ignore -->
| Configuration | Lives in the repo (bkit-managed) | Lives in the online dashboard (manual, one-time) |
| --- | --- | --- |
| **Claude Code on the web** | `.claude/hooks/bkit-preflight.sh` (tracker opt-in guard) + `.claude/hooks/bkit-cloud-bootstrap.sh` (per-session install — copy-and-own template, adopt it from `.bkit/templates/`) | `claude.ai/code` → environment selector → **+ Add environment**: name, **setup script** (paste from § Setup script), **environment variables** (paste block from `.claude/bkit-cloud.md`), **network access** (`Custom`, list from the same doc) |
| **Cursor Cloud Agents** | `.cursor/Dockerfile` + `.cursor/environment.json` (`install` / `start` / `terminals[]` / `env`), both copied from bkit's templates and owned by the repo, + `.cursor/hooks.json` (wires preflight `failClosed: true`) + `.cursor/hooks/bkit-preflight.sh` (Linear guard) | Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents`) → your environment → **Secrets** tab, as **Runtime Secret**s: paste block from `.cursor/bkit-cloud.md`. (The integration injects `LINEAR_ISSUE_ID` / `GITHUB_ISSUE_ID` per session, so don't hardcode them.) |
| **Codex Cloud** | `.codex/hooks.json` + `.codex/hooks/*` (unproven in cloud tasks — § Codex Cloud) + `.agents/skills/bkit-*` | ChatGPT → **Settings > Codex Cloud > Environments** → **Create environment**: repo, **Install script**, **Environment variables**, **Internet access** — all pasted from `.codex/bkit-cloud.md` |

**Rule of thumb:** env vars and auth tokens go in the online dashboard, out of git. Scripts, the Dockerfile and install hooks go in the repo.

**Alignment guarantees bkit enforces:**

- Both clouds run the same Node (24.21.0, sha256-checked, from nodejs.org): the web setup script and `.cursor/Dockerfile` carry the identical `NODE_VERSION` + `NODE_SHA256` pair.
- Both clouds have the same vale version (3.9.1) pre-installed.
- Both get pnpm through corepack. The web setup script pre-warms the pnpm version in your `package.json` `packageManager`, and `.cursor/Dockerfile` pre-warms its `PNPM_VERSION` build argument. Inside the repo, corepack resolves the repo's own `packageManager` either way, so one setup script serves any pnpm pin, and the pre-warmed version only warms the cache.
- Both have the gh CLI. The web setup script installs a pinned, sha256-checked binary (`GH_VERSION`, downloaded from a `github.com` release the same way as vale), and the GitHub-Actions runner ships with it pre-installed. Auth is shared through `bkit-cloud-bootstrap.sh`, which runs `gh auth login --with-token` with `BKIT_GH_TOKEN` and skips it when `GITHUB_TOKEN` already authenticates on the runner.
- Both use the same opt-in guard pattern, keyed on the opt-in label `bkit:auto` and wrapped in `<!-- bkit:start --> ... <!-- bkit:end -->` (bkit-managed in consumer repos). The label is `bkit:auto` on both trackers.

## Background

Both clouds run Ubuntu 24.04 (4 vCPU / 16 GB RAM / 30 GB disk class). What comes pre-installed differs:

<!-- prettier-ignore -->
| Pre-installed | Claude Code on the web | Cursor Cloud Agents (after bkit Dockerfile) |
| --- | --- | --- |
| Node | 20 + 22 — setup script adds 24 (checksum-pinned, into `/usr/local`, first on `PATH`) | 24 (template default, checksum-pinned; match your `engines.node` / `.nvmrc`) |
| Package manager | pnpm + bun (latest) | pnpm (corepack-pinned in `.cursor/Dockerfile`; each repo's `packageManager` honored in-repo) |
| Python | Yes + ruff | Yes (system `python3` only) |
| Databases | Postgres 16, Redis 7 | Not installed (add to Dockerfile if needed) |
| Docker | Yes (host engine) | N/A — we are inside Docker |
| Utilities | git, jq, ripgrep | git, jq |
| `gh` CLI | Not pre-installed: the setup script adds it | Added via Dockerfile (pinned release tarball, sha256-checked) |
| `vale` | Not pre-installed: the setup script adds 3.9.1 | Added via Dockerfile (3.9.1) |
| Playwright | Not pre-installed | Not installed (commented example in the consumer section of `.cursor/Dockerfile`) |

Customisation comes in two halves:

- **Cloud-side install** (one-time, cached): Claude uses the setup script in the app, and Cursor uses `.cursor/Dockerfile`.
- **Repo-side install** (per-session, lockfile-aware): Claude uses `.claude/hooks/bkit-cloud-bootstrap.sh`, and Cursor uses the `install` field of `.cursor/environment.json`.

**Failed provision recipes:** Every host runs each `context-fetch:provision` recipe on its own. The Claude setup script and the Codex install script run them inline, and the Claude session hook and the Cursor `install` run them through `bkit context provision`. A failing recipe never fails setup. Setup names it, with its last error line, in the setup log and in the closing `cloud setup done` line, and lists it in `.bkit/.unavailable`, one `<name>: <reason>` line per recipe. The file is removed when no recipe fails. The Claude session hook prints that file into the session's context, and `.agents/rules.md` § Cloud setup gaps tells every agent to read it.

# Claude Code on the web

> [!TIP]
> **No manual copy needed.** `bkit install --claude` writes `.claude/bkit-cloud.md`: this recipe, with the repo's env-var values resolved from `.envrc`. Variables that file `unset`s are dropped, and `BKIT_ANTHROPIC_API_KEY` is left out to protect subscription billing. Open the file and paste each block into the Claude app. The file is gitignored because it holds real secrets, and it regenerates on every install and upgrade. The reference below documents each field it fills.

## Where config lives

Open `claude.ai/code` → environment selector → **+ Add environment**. It has three surfaces: the setup script (bash, run as root, once, then snapshotted), environment variables (`.env` format, plaintext, visible to anyone with edit access) and network access (`None` / `Trusted` / `Full` / `Custom`).

## In-repo side

- `.claude/hooks/bkit-preflight.sh` — the tracker opt-in guard plus the rules-read advisory, as one JSON document (`.bkit/providers.md` § Rules-read advisory). When the tracker issue ID env var is unset, as in an IDE session, it prints the advisory alone and exits 0. On Claude a non-zero exit is informational only, because `SessionStart` cannot block. The agent reads the `HARD STOP` text from `additionalContext`.
- `.claude/hooks/bkit-cloud-bootstrap.sh` — when `CLAUDE_CODE_REMOTE=true`, runs `pnpm install --frozen-lockfile` and `vale sync`, then gh auth, then context-fetch CLI provisioning through the just-installed bkit (`bkit context provision`). When bkit is missing, it skips provisioning with a loud log line. A failed recipe's `.bkit/.unavailable` line goes to stdout, and so into the session's context. Locally the hook does nothing.
- Both are registered in `.claude/settings.json` under `hooks.SessionStart`.

These ship with the repo. Do not paste them into the app.

## What to paste into the Claude app

### Name

Name the environment after the repo: one environment per repo keeps secrets isolated (§ Sharing across repos). The setup script is identical across repos.

The setup-script body, the network policy and bkit's baseline token name (`BKIT_GH_TOKEN`) are identical across repos, and only the values change. The rest of the env-vars box is this repo's own, copied from the env-var files that `.envrc` follows (§ Tokens by session type).

### Network access

Always choose `Custom`, because the rendered list carries bkit's own shipped hosts (trackers, registries, agent and provider APIs, and the search host a `context=web` block calls) whether or not the repo declares anything:

1. Select **Custom**.
2. Tick **Also include default list of common package managers**. It extends the trusted defaults (package registries, GitHub, cloud SDKs) and never replaces them.
3. Paste the domains bkit renders into `.claude/bkit-cloud.md` § Network access into **Allowed domains**.

Declare only what bkit cannot see: the log-backend and API hosts that the implicit CLI blocks reach (`vercel` / `gcloud`), plus the app's production and preview / dev domains. Declare apex domains only. `bkit install` expands each one to `<domain>` + `*.<domain>` and unions them with the derived set. Under `Trusted` those hosts are unreachable, so a cloud `/bkit-debug` gets no runtime logs and e2e tests can't reach the deployment.

A repo with no `allowed-domains` block still needs `Custom`, because `Trusted` does not reach bkit's own tracker MCP, provider catalog or search hosts. Ticking **Also include default list of common package managers** keeps npm, the vale tarball on `objects.githubusercontent.com`, Docker Hub and PyPI. Raise the setting to `Full` only for open-internet tasks.

### Setup script

`bkit install` generates a copy-paste-ready setup script into `.claude/bkit-cloud.md` § Setup script. It is resolved for this repo, with the cache-bust line, the base-tool installs and any `context-fetch:provision` recipes. Paste that, not a hand-copied snippet, because a stale copy drifts: a hard-pinned pnpm can seed a version known to break the `bkit` download, and `apt install gh` is unreliable because gh is not in the default repos.

What the script does, and why it is split from the in-repo hook:

- **`# cache-bust <date>-<n>`** is the first line the generator writes, and `bkit install` / `bkit upgrade` re-stamp it. The snapshot is keyed on the setup script's exact text, so the line's only job is to change. A new date, or a bumped same-day counter, forces a fresh snapshot on the next paste. That re-pulls any unpinned tool a `context-fetch:provision` recipe installs, and picks up base-image drift, even when the rest of the script is byte-identical. Leave the line in place, and do not edit it by hand.
- **Base tools (Node, vale, gh, jq)** install once into the snapshot from upstream releases. Each is pinned to a version and checked with `sha256sum -c` before it is unpacked or made executable. The `# renovate:` comment above each `*_VERSION` lets Renovate bump the pin.
  - Node 24 comes from the nodejs.org `linux-x64` tarball into `/usr/local`, and `/usr/local/bin` is prepended to `PATH` so corepack and every later step run on it. bkit needs Node >=24, and the image ships 20 + 22.
  - `gh` comes from the `cli/cli` release tarball, not `apt`.
  - `jq` is installed because `curl`-based context-fetch blocks pipe through it.
  - The Node, gh and vale pins match `.cursor/Dockerfile`.
  - These are binaries the cloud lacks but a laptop has, so they belong here, not in a repo-level hook.
- **pnpm corepack pre-warm** seeds one pnpm into the snapshot: `corepack enable && corepack prepare pnpm@<version> --activate`, with the version read from your `package.json` `packageManager`. With no `packageManager` pin, the line is a bare `corepack enable`. Inside the repo, corepack resolves the repo's `packageManager` and fetches it if it differs, so one setup script serves any pnpm pin. The pre-warm only warms the cache.
- `pnpm install` and `vale sync` are not here. They belong in `.claude/hooks/bkit-cloud-bootstrap.sh`, so a resumed session picks up a drifted lockfile or styles, and each repo installs its own deps.

Keep the total runtime under ~5 minutes, or the snapshot won't build.

#### Workspace trust + auto-mode config

`permissions.allow` / `permissions.additionalDirectories` in `.claude/settings.json` grant capability. Claude Code applies them only after the workspace trust dialog, which a cloud (`-p` / SDK) session never shows. `deny` / `ask` are unaffected, because they only restrict. In an untrusted workspace every `allow` row is ignored, and the only notice is one stderr line that no cloud session surfaces.

The setup script writes both of these on the host side, after the `jq` install:

<!-- prettier-ignore -->
| Written | Where | Why setup script |
| --- | --- | --- |
| `projects[<repo path>].hasTrustDialogAccepted = true` | `~/.claude.json` | Settings resolve before `SessionStart`, so a hook is too late, and `.claude/` is a protected path, so an in-session write is refused. The setup script runs as root, before the clone and before Claude, and is snapshotted. |
| `autoMode.environment` — `"$defaults"` first, `Host containment` entry, network-allowlist hosts | `~/.claude/settings.json` | The classifier reads `autoMode` from user / managed settings only, never from `.claude/settings.json` / `.claude/settings.local.json`, so it cannot ship in the repo. |

Both writes merge with `jq` and never clobber. `autoMode.environment` is seeded with `//=`, so a consumer's list is never overwritten. If `"$defaults"` is omitted, the whole built-in list for that section is discarded, `Trusted repo` included, so the renderer always emits it.

Neither file can be committed. `~/.claude/settings.json` resolves outside the repo tree, and a git-tracked `.claude/settings.local.json` counts as repository-supplied, so it sits behind the same trust gate.

The baked path `/home/user/<repo-name>` is an observation of the current image, not a contract: no env var names the repo root. `.claude/hooks/bkit-cloud-bootstrap.sh` re-checks the discovered git root each session and warns on a mismatch. It only diagnoses, and does not repair. To fix a mismatch, re-paste the setup script.

Auto mode drops a blanket `Bash(*)` on entry, while narrow rows survive, so cloud auto-mode sessions run on the classifier's verdicts and `autoMode.environment`, not on the allow list. By default the classifier trusts the working repo and its remotes, and every context-fetch host counts as external until it is named. The default `Host containment` entry assumes an open-internet dev machine.

### Environment variables

The minimum:

```
BKIT_GH_TOKEN=<PAT — fine-grained for one owner, classic across owners; see permissions below>
```

Tracker keys (`BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`) join the block whenever `.envrc` resolves them, so the block is the same for every tracker. Set `BKIT_GH_TOKEN` for the GitHub MCP, and authenticate `gh` with `gh auth login --with-token` in the bootstrap hook, because env vars are not visible during the setup script (see § Notes).

Optional, for context-fetch:

- You need these only if you use `.agents/context.md` blocks, for example ones copied from `.bkit/templates/context/`.
- The tokens below are examples. Set whatever operator creds your enabled blocks need.
- They are cloud-dashboard entries, not `.bkit/.env` entries, because that file is for bkit / agent tooling only.
- Non-secret selectors (`VERCEL_SCOPE` / `SUPABASE_PROJECT_ID`) are committed in the copied block, so cloud agents inherit them without a dashboard entry.
- The CLIs install from each block's `context-fetch:provision` sibling.

```
VERCEL_TOKEN=<Vercel access token — https://vercel.com/account/settings/tokens>
SUPABASE_ACCESS_TOKEN=<Supabase Management API token — https://supabase.com/dashboard/account/tokens>
```

#### `BKIT_GH_TOKEN` — token permissions

**Choose the token type by how many owners it covers:** A fine-grained PAT reaches only resources under one resource owner (a user or an org). Use it when every target repo is under that owner. Use a classic PAT when one token must span more than one owner (two or more orgs, or a user + an org), since fine-grained PATs cannot access multiple organizations.

- **Fine-grained:** It has a mandatory expiry and a repo-scoped blast radius. Prefer it when it fits, because env vars are plaintext.
- **Classic:** Give it the scopes `repo`, `workflow`, `read:org`, `project`, `security_events` (+ `user:email` for Renovate authorship), and keep the expiry short. An org may block classic tokens (403), and SAML SSO orgs need the token authorized per org.

<!-- prettier-ignore -->
| Permission | Level | What it unlocks |
| --- | --- | --- |
| Contents | Read & write | `git push`, branch creation |
| Pull requests | Read & write | `gh pr create / view / merge / comment` |
| Issues | Read & write | `gh issue` |
| Actions | Read & write | `gh run view` logs, `gh workflow run` |
| Workflows | Read & write | `gh workflow` (edit `.github/workflows/*`) |
| Projects (org) | Read & write | GitHub Projects v2 board status sync (`bkit.tracker.github.project`) — org-owned boards only; see note |
| Metadata | Read | mandatory, auto-included |

`gh` does not read `BKIT_GH_TOKEN`. Pipe it in once after the session starts: `printf '%s' "$BKIT_GH_TOKEN" | gh auth login --with-token` (for example in `.claude/hooks/bkit-cloud-bootstrap.sh`). Locally, run `gh auth login` and leave `GH_TOKEN` unset, so the keyring is not overridden.

> **Projects v2 board sync (`bkit.tracker.github.project`):** The Projects permission is an Organization permission (table row above). It appears only when the token's resource owner is the org, not a personal account, and the org may require the token to be approved. It sits under the token UI's Organizations tab, not under Repository permissions, and it governs `…/orgs/{org}/projectsV2/…`. Fine-grained PATs cannot reach user-owned (personal-account) boards (see below).

#### When classic is still required

- **More than one repo across owners.** A fine-grained PAT is limited to a single resource owner (one user or one org), so it cannot cover two or more orgs, or a user plus an org. Classic reaches every repo your user can.
- **Cross-repo work in single cloud session.** Fine-grained PATs see only their allowlist, while classic sees everything your user can.
- **User-owned (personal-account) Projects v2 boards.** Fine-grained PATs expose Projects only as an organization permission, so personal boards are unreachable. Use a classic PAT with `project` scope, or move the board under an org.

#### Notes

- The Claude app warns "don't add secrets", because env vars are visible to anyone with edit rights. On a personal account that is just you. Treat a team account as low-trust.
- For earlier auto-compaction, set `autoCompactWindow` in the committed `.claude/settings.json` (`.bkit/providers.md` § Context compaction). It applies to cloud sessions as-is, with no env var.
- **Env vars set in the Claude app are not visible inside the setup script.** They are injected only after Claude Code starts, so they reach `SessionStart` hooks and the interactive shell, not the snapshot build. A tool that needs a token to bootstrap would have to inline it, which is the leak you want to avoid. Today that is avoided, because vale / gh / corepack don't need auth.

## Tokens by session type

Token management by session type:

- **Local sessions** — bkit writes `.bkit/.env.example` (token placeholders). `.envrc` (`dotenv_if_exists .bkit/.env`) is a template: copy `.bkit/templates/.envrc`. Copy `.env.example` → `.bkit/.env`, fill in the tokens and run `direnv allow`. direnv auto-exports `BKIT_GH_TOKEN` and `BKIT_LINEAR_API_KEY` when you enter the repo, with no manual `source` or shell-rc export. `.bkit/.env` is gitignored. NEVER commit it.

  ```bash
  cp .bkit/.env.example .bkit/.env
  # edit .bkit/.env — fill in BKIT_GH_TOKEN, BKIT_LINEAR_API_KEY
  direnv allow
  ```

- **Cloud sessions** (Claude Code on the web, Cursor Cloud Agents, Codex Cloud) — `.bkit/.env` is absent in cloud containers. Set the same names (`BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY`) in each host's dashboard:
  - Claude app → environment selector → Environment variables.
  - Cursor Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents`) → your environment → **Secrets** tab (as **Runtime Secret**s).
  - ChatGPT → **Settings > Codex Cloud > Environments** → **Environment variables**.

  Each host's generated `<host>/bkit-cloud.md` is the paste-ready block.

**Beyond bkit tokens:** Fill in the rest from the env-var files that the repo's `.envrc` sources (for example `.bkit/.env`, then the app's `.env.local`). Don't hand-pick from memory. Copy from those files, following `.envrc`:

- **Drop every var `.envrc` `unset`s.** These are kept out of the repo shell on purpose (for example prod cache creds that flip unit tests off the mock branch, or a project ref that mis-names the local stack), and they have no place in the cloud env.
- **Skip session-hijacking keys — notably `BKIT_ANTHROPIC_API_KEY`.** It redirects Claude Code model calls onto API-key billing instead of the subscription. The same goes for any var that re-points the agent's own auth.
- **Values, not selectors.** Non-secret selectors (`VERCEL_SCOPE`, `SUPABASE_PROJECT_ID`, …) stay committed in the repo (§ observability / MCP blocks) and get no dashboard entry.

## MCP issue-tracker integration

bkit wires the chosen tracker's MCP server (`bkit.tracker.default`) into `.mcp.json` at the repo root (project-shared, read by the Claude Code `/mcp` UI). Cursor reads the same shape from `.cursor/mcp.json`. All of them are remote HTTP MCPs, with no docker:

- GitHub: the `BKIT_GH_TOKEN` PAT in the `Authorization` header, with no OAuth.
- Linear: OAuth on first use. Claude Code launches browser auth the first time it touches the server and stores the token in its own secret store.
- Jira: the `BKIT_JIRA_API_KEY` scoped token in the `Authorization` header, with no OAuth.

> Note: Claude Code silently ignores `mcpServers` in `.claude/settings.json`. It takes definitions only from `.mcp.json` (project) or `claude mcp add` (user scope). The `mcp__<name>__*` entries in `.claude/settings.json` `permissions.allow` are tool-permission allowlists, a different concern, and they stay there.

```json
"mcpServers": {
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": { "Authorization": "Bearer ${BKIT_GH_TOKEN}" }
  },
  "linear": { "type": "http", "url": "https://mcp.linear.app/mcp" },
  "jira": {
    "type": "http",
    "url": "https://mcp.atlassian.com/v2/mcp",
    "headers": { "Authorization": "Bearer ${BKIT_JIRA_API_KEY}" }
  }
}
```

`"type": "http"` is required. Without it, Claude Code defaults to the stdio transport and rejects the entry for a missing `command`.

- **GitHub** — the official GitHub MCP at `api.githubcopilot.com` (not gated by a Copilot subscription). Its surface includes `issue_write`, `add_issue_comment`, `label_write`, `projects_write` and more. It is used under the GitHub provider. The endpoint does not support OAuth DCR, so auth goes through `Authorization: Bearer ${BKIT_GH_TOKEN}` (an MCP-only env var, see § Environment variables).
- **Linear** — the full Linear workspace surface (`get_issue`, `save_issue`, `save_comment`, `list_*`). It is used when `bkit.tracker.default` = `linear`. Auth is OAuth (Dynamic Client Registration): a browser flow on first use, with no env var.
- **Jira** — the Atlassian Rovo MCP at `mcp.atlassian.com/v2/mcp`. Its surface is `getJiraIssue`, `editJiraIssue`, `transitionJiraIssue`, `addOrEditJiraIssueComment`, `searchJiraIssuesUsingJql` and `executeRead` / `executeWrite`. It is used when `bkit.tracker.default` = `jira`. Auth goes through `Authorization: Bearer ${BKIT_JIRA_API_KEY}`, a scoped **Atlassian MCP V2** token, and the org admin must allow API-token sign-in (`.bkit/trackers.md` § jira — setup and notes).

**Auth flow per server:**

- **GitHub:** Claude Code substitutes `${BKIT_GH_TOKEN}` from the environment at session start. If it is unset, the server fails. Set it in the shell (`export BKIT_GH_TOKEN=...`) or the cloud dashboard.
- **Linear:** Claude Code asks you to authorize in the browser on first use, and keeps the token in Claude's secret store. No further action is needed.
- **Jira:** Claude Code substitutes `${BKIT_JIRA_API_KEY}` from the environment at session start. If it is unset or a classic token, every Jira call fails.

**`gh auth login` is required for the gh CLI surface** (PR creation, branch ops, git push). Locally, gh uses the keyring, so do not export `GH_TOKEN` from `.bkit/.env`. In cloud / headless sessions, `bkit-cloud-bootstrap.sh` runs `printf '%s' "$BKIT_GH_TOKEN" | gh auth login --with-token` at SessionStart, so there is no manual step. The `bkit runtime detect` gh probe guards that step, and it does nothing on an Actions runner, where `GITHUB_TOKEN` authenticates. The same PAT value is fine. The different env-var name keeps the local `gh` on the keyring.

**Cloud sessions** (Claude on the web, Cursor Cloud Agents, Codex Cloud): The GitHub MCP reads `BKIT_GH_TOKEN`, and the Jira MCP reads `BKIT_JIRA_API_KEY`, from the dashboard env vars. The Linear MCP runs OAuth on first touch, the same as locally. Jira has no cloud dispatch, so a manually launched session reaches Jira once `BKIT_JIRA_API_KEY` is set.

## After saving the Claude env

1. Trigger a session: run `claude --remote "echo ready"` from the repo, or tap the environment in the iOS app.
2. The first session is slow (setup script + snapshot). Later sessions start from the snapshot.
3. Verify in the session: `vale --version && gh --version && pnpm -v && which corepack`.
4. Verify workspace trust on the discovered root. `true` means the `allow` rows apply, and `MISSING` means the clone path differs from the baked one (§ Workspace trust + auto-mode config):

   ```bash
   jq -r --arg p "$(git rev-parse --show-toplevel)" \
     '.projects[$p].hasTrustDialogAccepted // "MISSING"' "${CLAUDE_CONFIG_DIR:-$HOME}/.claude.json"
   ```

5. The snapshot rebuilds when the setup-script body changes, the allowed-hosts list changes, or the ~7-day TTL expires. Editing env vars or in-repo hook scripts does not invalidate the snapshot.
6. **Force rebuild without semantic changes**: run `bkit install` or `bkit upgrade`, which re-stamps the `# cache-bust` line, then paste the new setup script.

# Cursor Cloud Agents

> Cursor calls these **Cloud Agents**. Secrets live in the **Secrets tab** of the Cloud
> Agents dashboard (`cursor.com/dashboard/cloud-agents`). The webhook field is
> `is_background_agent`. This doc uses "Cloud Agents" throughout.

> [!TIP]
> **No manual copy needed for the dashboard secrets.** `bkit install --cursor` writes
> `.cursor/bkit-cloud.md`, the twin of `.claude/bkit-cloud.md`, with the Cursor secrets block
> resolved from `.envrc` (the same block as the Claude side, for any tracker). Open it, then in the
> Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents`) → your environment → **Secrets**
> tab, add each entry as a **Runtime Secret** (loaded as an env var, redacted from the agent's transcript).
> The file is gitignored because it holds real secrets, and it regenerates on every install/upgrade. The toolchain
> half is the committed `.cursor/Dockerfile` + `.cursor/environment.json`, with nothing to
> paste. It has the same tools, at the same versions, as the Claude setup script.

## Where config lives

Everything lives in the repo under `.cursor/`. bkit ships canonical content for all four files:

<!-- prettier-ignore -->
| File | Role | bkit ownership |
| --- | --- | --- |
| `.cursor/Dockerfile` | Cloud image — vale + gh + Node 24 (template default) + pnpm (corepack-pinned); Node, gh and vale are version-pinned and sha256-checked; browsers etc. added by the consumer | Template: copy from `.bkit/templates/.cursor/Dockerfile`; yours after |
| `.cursor/environment.json` | Build pointer + per-snapshot `install` hook (`pnpm install --frozen-lockfile` + `vale sync` if `.vale.ini` + `pnpm exec bkit context provision`) | Template: copy from `.bkit/templates/.cursor/environment.json`; yours after |
| `.cursor/hooks.json` | Wires `sessionStart` → `bkit-preflight.sh` (`failClosed: true`) | Tier 2 contained JSON |
| `.cursor/hooks/bkit-preflight.sh` | Tracker opt-in guard — `bkit:auto` label + non-terminal status — plus the rules-read advisory (`.bkit/providers.md` § Rules-read advisory). IDE session → the advisory alone, exit 0 | Tier 2 contained (bkit:start / end markers) |

## How GitHub dispatch works

GitHub dispatch uses the Cursor Automations "Pull request label changed" trigger, with no Linear webhook.

**Prerequisites:** The Cursor GitHub App is installed on the consumer repo or org.

**Trigger flow:**

1. `bkit-build` writes `bkit:auto` as a static PR label (the opt-in marker). The matching GitHub issue must also carry `bkit:auto`, which is the runtime kill switch: remove it to stop dispatch.
2. The workflow adds the phase label (`bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`) to the PR. Cursor reads the label for workflow dispatch.
3. Cursor Automations fires on "Pull request label changed" → spawns a Background Agent session against the repo. The Automation's prompt must contain `bkit-auto`, because `AGENTS.md` routes only a `bkit-{command}` prompt, and `.bkit/router.md` reads the phase from the issue's labels.
4. `sessionStart` fires `bkit-preflight.sh`. With `failClosed: true`, a non-zero exit hard-stops the agent.
5. `GITHUB_ISSUE_ID` is injected from the PR body metadata marker `<!-- bkit:issue=#NNN -->`, which the router extracts at dispatch time.

**Constraint:** `/bkit-design` and `/bkit-plan` have no PR, so on Cursor cloud with the GitHub tracker they are local-IDE-only. Run them locally through Claude Code or the Cursor IDE.

**Required env vars (GitHub tracker):**

```
BKIT_GH_TOKEN=<PAT — fine-grained for one owner, classic across owners; same permissions as the Claude side>
```

`GITHUB_ISSUE_ID` is injected per session, so do not hardcode it. Tracker calls need no `BKIT_LINEAR_API_KEY` or `LINEAR_ISSUE_ID`: the GitHub MCP authenticates with `BKIT_GH_TOKEN` above, and `gh` uses `gh auth login` locally or `--with-token` in the cloud bootstrap.

## How Linear dispatch works

`@cursor` is Cursor's native Linear integration, not bkit. bkit does not intercept the mention or run its own Linear webhook. The spawned agent picks up bkit because every Cursor cloud agent reads the root `AGENTS.md`, which sends a `bkit-{command}` prompt to `.bkit/router.md` → matching workflow.

1. Comment `@cursor bkit-auto ISSUE-NNN` (phase from the issue's labels) or `@cursor /bkit-design ISSUE-NNN`, which is Cursor's standard Linear integration. Assigning the issue to **Cursor** alone starts no workflow, because its prompt names no `bkit-{command}`.
2. The Cursor webhook → a background agent against the repo, with `is_background_agent: true` and `LINEAR_ISSUE_ID` set.
3. `sessionStart` fires `bkit-preflight.sh`. With `failClosed: true`, a non-zero exit hard-stops the agent before work.
4. Preflight skips IDE sessions (`is_background_agent !== true`), so the local Cursor IDE is unaffected.

## Required env vars (Cursor side)

Set these in the Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents` → your environment → **Secrets** tab) as **Runtime Secret**s (loaded as env vars, redacted from the agent's transcript), not in `.cursor/environment.json`:

```
BKIT_GH_TOKEN=<PAT — fine-grained for one owner, classic across owners; same permissions as the Claude side>
```

Add every tracker key `.envrc` resolves. Under Linear that is `BKIT_LINEAR_API_KEY` (a Linear personal API key, because `bkit-preflight.sh` calls the GraphQL API). The Cursor / Linear integration injects `LINEAR_ISSUE_ID` per session, so do not hardcode it.

Optional, for context-fetch:

- You need these only if you use `.agents/context.md` blocks, for example ones copied from `.bkit/templates/context/`.
- The tokens below are examples. Set whatever operator creds your enabled blocks need.
- They are cloud-dashboard entries, not `.bkit/.env` entries, because that file is for bkit / agent tooling only.
- Non-secret selectors (`VERCEL_SCOPE` / `SUPABASE_PROJECT_ID`) are committed in the copied block, so cloud agents inherit them without a dashboard entry.
- The CLIs install from each block's `context-fetch:provision` sibling.

```
VERCEL_TOKEN=<Vercel access token — https://vercel.com/account/settings/tokens>
SUPABASE_ACCESS_TOKEN=<Supabase Management API token — https://supabase.com/dashboard/account/tokens>
```

## Network access (Cursor side)

Cloud Agents get network access by default. Egress is configurable in the dashboard → **Security**: **Allow all** / **Default + allowlist** / **Allowlist only**, at user / environment / team scope. This is the analogue of Claude's `Trusted` / `Custom`. `.cursor/bkit-cloud.md` § Network access lists bkit's derived hosts exactly, and each declared `allowed-domains` entry as the domain plus its `*.` wildcard, like the Claude side, so the subdomains a declared CLI or API calls (`api.vercel.com` under `vercel.com`) are reachable. A declared shared hosting platform (`vercel.app`, `supabase.co`, the rest of `MULTI_TENANT_APEXES` in `.bkit/core/engine/shared/egress.ts`) is widened too, with a note: its wildcard reaches every tenant on the platform, the exfiltration path Cursor's docs warn about. To narrow it, declare the exact hosts you call there instead (`myapp.vercel.app`, `logging.googleapis.com`).

## After modifying `.cursor/*`

1. Run `pnpm install && pnpm bkit install` to regenerate the mirrors.
2. Commit the changes.
3. **The first Cursor session after Dockerfile changes is slow**, because the image rebuilds. Later sessions reuse the cached layers.
4. Verify in the session: `vale --version && gh --version && pnpm -v && python3 --version`.

# Codex Cloud

> [!TIP]
> **Nothing to hand-assemble.** `bkit install --codex` writes `.codex/bkit-cloud.md`, the
> twin of `.claude/bkit-cloud.md`: the install script, the env block resolved from `.envrc` (the same
> block as the other hosts, for any tracker) and the network list. The file is gitignored and chmod 600 because it holds real
> secrets. It regenerates on every install / upgrade, and `bkit uninstall --codex` deletes it.

## What to paste

ChatGPT → **Settings > Codex Cloud > Environments** → **Create environment** → pick the repo → name it after the repo (one env per repo, § Sharing across repos):

<!-- prettier-ignore -->
| Field | Paste from `.codex/bkit-cloud.md` |
| --- | --- |
| **Install script** | § Install script — Claude setup script's pinned toolchain (Node, vale, gh, jq; sliced from the Claude template at install, never a second copy of the pins), corepack pnpm, context-fetch provision recipes, then `pnpm install --frozen-lockfile`, `vale sync` (if `.vale.ini`), non-blocking `gh auth login --with-token` from `BKIT_GH_TOKEN` |
| **Environment variables** | § Environment variables — `.env` block (**Paste your .env or type a key**) |
| **Internet access** | § Network access — keep **Enable package manager domains**, paste the list into **Additional allowed domains** (`*.` entries untested on Codex: its docs list exact hosts, and a root domain also allows `www`). **Enable all public internet access** = open egress |

## Env vars vs network secrets

- **Environment variables** reach every program as-is, so put every bkit token here (MCP servers, `gh`, `pnpm` and bkit read the process env).
- **Network secrets** (Key / Value / **Allowed domains**): Programs see a placeholder. The proxy substitutes the real value only on requests to allowed domains, during setup and tasks. This fits a token used only in HTTP headers to known hosts, and breaks any token a program reads directly (`gh auth login --with-token`).
- **Personal vault** shares a secret across **All environments** or **Selected environments**, for a token several repos reuse.

## Hooks in cloud tasks

Repo skills (`.agents/skills/bkit-*`, `$bkit-design`) load in cloud tasks. Codex's cloud docs do not say whether `.codex/hooks.json` runs there, so GateGuard, ReadGuard, guardrails and the rules advisory are unproven in cloud tasks. Review cloud diffs as unguarded. Locally they fire only once the `.codex/` layer is trusted (`.bkit/providers.md` § Codex CLI — three deviations).

# Sharing across repos

## Claude — one environment per repo

Each repo gets its own Claude environment, named after the repo. The reason is secrets, not mechanics.

**Secrets are per-repo.** App tokens (Supabase, Stripe, Vercel, …) differ per repo. Even bkit tokens differ in scope: a fine-grained `BKIT_GH_TOKEN` is scoped to one resource owner / repo, and covering different owners needs one classic PAT, which cannot be per-repo. One Claude environment holds one value per name, so a shared environment forces either a mega-scoped PAT across repos (a wide blast radius) or one repo's secrets leaking into the rest. Per-repo environments isolate secrets.

Shared across repos (copy, don't re-derive), non-secret only:

- **Setup script** — generic binaries only (Node, vale, gh, jq, pnpm via corepack). The repo-specific install is left to the committed `bkit-cloud-bootstrap.sh` (lockfile → `pnpm install`, `.vale.ini` → `vale sync`). One body fits every repo.
- **bkit baseline token name** (`BKIT_GH_TOKEN`) + **network policy** (`Custom`) — the same everywhere, while the values differ. The repo's other env vars are not shared. Copy them from the repo's own env files, following `.envrc`: drop the `unset`s and skip `BKIT_ANTHROPIC_API_KEY` (§ Tokens by session type).
- **Non-secret selectors** (`VERCEL_SCOPE`, `SUPABASE_PROJECT_ID`) stay committed in the repo (§ Tokens by session type), never in the dashboard.

## Codex — one environment per repo

The rule is the same as for Claude: a per-repo environment with per-repo secrets. The install script is identical across repos, because the repo-specific steps guard themselves on `pnpm-lock.yaml` / `.vale.ini`. For a token shared on purpose, use the **Personal vault** scoped to **Selected environments**, not a mega-scoped PAT.

## Cursor — byte-identical Dockerfile

Cursor resolves the environment in this order: (1) `.cursor/environment.json` in the repo, (2) a personal saved environment in the Cursor account, (3) a team saved environment. There are three sharing patterns:

1. **In-repo copy (bkit default).** Each consumer repo carries `.cursor/Dockerfile` + `.cursor/environment.json`, copied from bkit's templates and owned by the repo. Cursor environments are functionally equivalent across consumers, and bkit ships base-toolchain updates as template changes the consumer adopts.
2. **Personal saved environment (cross-repo).** Don't commit `.cursor/environment.json`. Configure a single environment in the Cursor account dashboard, and Cursor falls back to it for any session. Like any cross-repo environment, it holds one secret set for all repos. Prefer the per-repo default (#1) when repos have distinct secrets.
3. **Multi-repo environment.** Cursor binds one environment to multiple repos cloned into the same agent VM. This allows cross-repo work, but the agent sees all selected repos, which is a different security boundary.

When bkit's reference Dockerfile changes (for example a vale bump):

- bkit never writes the consumer's `.cursor/Dockerfile`, because it is the consumer's copy of a template.
- `bkit upgrade` refreshes `.bkit/templates/.cursor/Dockerfile` and names it in its changed-templates list.
- The consumer diffs the refreshed template against their copy and merges what they want.

## What every consumer repo needs to do

1. Run `pnpm bkit install`. bkit-managed toolchain updates land in the written payload.
   - `.claude/hooks/bkit-cloud-bootstrap.sh` is a copy-and-own template. When `bkit upgrade` lists that path, diff your copy against `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` and merge what you want.
   - `.cursor/Dockerfile` is your copy of a template. Diff it against `.bkit/templates/.cursor/Dockerfile` when `bkit upgrade` lists that path.
2. Set the `.cursor/bkit-cloud.md` block as **Runtime Secret**s in the Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents` → your environment → **Secrets** tab).
3. Add a Claude environment named after the repo at `claude.ai/code`, and paste the recipe from § Claude Code on the web (one environment per repo, because secrets are per-repo).
   Codex: do the same at **Settings > Codex Cloud > Environments**, pasted from `.codex/bkit-cloud.md` (§ Codex Cloud).
4. Customise `.cursor/Dockerfile` Node version (`NODE_VERSION` + `NODE_SHA256`) / Playwright / extra system deps. Keep the `bkit toolchain` section as the template ships it, so a template diff stays readable.

# Post-CI auto-routing

After `bkit-build` Step 16 close-workflow pushes the CI-trigger commit (`chore({FID}): close-workflow`, no skip tags) and exits, the post-CI router decides ship vs. debug and dispatches the matching skill in a fresh cloud session. No operator action is needed between CI completion and the dispatched session.

The routing logic lives in a single bkit-managed slash-command orchestrator (`.bkit/core/workflows/bkit-auto.md`, mirrored to `.claude/commands/bkit-auto.md` + `.cursor/commands/bkit-auto.md` on each `pnpm bkit install`). The routing trigger is wired separately per IDE, because each IDE has different event surfaces.

## What lives where (post-CI half)

<!-- prettier-ignore -->
|  | Lives in the repo (bkit-managed) | Lives in the online dashboard / GitHub (manual, one-time) |
| --- | --- | --- |
| **Claude** | `.github/workflows/bkit-cloud.yml` — `claude` job (opt-in via `bkit install --auto=claude`; GitHub-tracker only). Two-tier gate: (1) free tier — job `if: contains(head_commit.message, 'bkit [auto route]')` (zero runner minutes for non-opted-in commits); (2) cheap tier — in-job `gh issue view {ISSUE} --json labels` re-checks `bkit:auto` (live kill switch); then dispatches `claude-code-action` as the Claude GitHub App (OIDC, `id-token: write`). | Claude credential: GitHub repo secret `ANTHROPIC_API_KEY` (`.bkit/.env` holds the same value as `BKIT_ANTHROPIC_API_KEY`) or keyless federation repo variables (§ Claude — workload identity federation). Claude GitHub App required (`/install-github-app`). The linked **GitHub issue** must carry `bkit:auto`. |
| **opencode** | Same `.github/workflows/bkit-cloud.yml` — `opencode` job (opt-in via `bkit install --auto=opencode`; GitHub-tracker only). Same two-tier gate (same file, separate job). Dispatches via `opencode run "/bkit-auto $PHASE $ARG"`. No `id-token: write` — no OIDC; uses `github.token` for repo ops. | GitHub repo secret: `OPENCODE_PROVIDER_KEY` (set to your provider API key). Provider model committed in `.opencode/opencode.json`. The linked **GitHub issue** must carry `bkit:auto`. |
| **Cursor** | Nothing — Cursor cloud agents have native triggers. | Cursor → Cloud Agents dashboard → Triggers → + Add trigger. Event: CI workflow completion on `feat/**` branches. Prompt (paste literally, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`. Concurrency: latest-supersedes. |

**Why the dashboard prompt never needs re-pasting:** Cursor substitutes `$CI_STATUS` and `$PR_NUMBER` from the event payload at dispatch, so the pasted string is generic and timeless. When bkit's routing logic evolves, only the mirrored `.cursor/commands/bkit-auto.md` changes, and the dashboard stays untouched.

## Cursor dashboard — exact paste

```
/bkit-auto $CI_STATUS $PR_NUMBER
```

## Claude — required GitHub Actions permissions

Flip the setting on both the org and the repo before the first router run. Otherwise `actions/checkout` 403s with `Write access to repository not granted`. The workflow declares `permissions: contents: write` at workflow scope, but the org / repo "Workflow permissions" ceiling overrides it, and the repo cannot exceed the org.

- **Org**: `https://github.com/organizations/{ORG}/settings/actions` → Workflow permissions → **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.
- **Repo**: `https://github.com/{ORG}/{REPO}/settings/actions` → the same section, the same two settings. Apply them at the repo too, because inheriting from the org is not automatic.

`workflow_run`-triggered runs do not inherit the parent CI workflow's `permissions:` block (only fork-PR tokens get narrowed), so a parent CI at `contents: read` is fine.

## bkit-cloud.yml — required GitHub repo credentials

<!-- prettier-ignore -->
| Secret / variable | Job | Why | Scope |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` secret | `claude` | `claude-code-action` authenticates against Anthropic. | API key with Claude Code access. Omit when using federation. |
| `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` variables | `claude` | Keyless alternative: the action trades the job's GitHub OIDC token for a short-lived Claude API token. | IDs, not secrets — repo **variables**. Optional `ANTHROPIC_SERVICE_ACCOUNT_ID` / `ANTHROPIC_WORKSPACE_ID`. § Claude — workload identity federation. |
| `OPENCODE_PROVIDER_KEY` | `opencode` | Fanned out to every cloud provider's env var name (`BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`, `BKIT_OPENCODE_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider is installed. | Provider API key for whichever provider you configured. |

A `context` job (`Check runner credentials` step) checks both credentials and resolves the phase + arg once. It does nothing unless `package.json` `bkit.tracker.default` is `github` or unset, because Linear cloud runs start from Cursor's Linear integration and Jira runs locally only. Each runner job needs it, and runs only when its own credential is set:

- The Claude credential is `ANTHROPIC_API_KEY`, or both federation variables. With only one of the two variables set, the job prints a `::notice::` naming the missing one, and the claude job does nothing.
- Only the claude credential set → only the claude job runs.
- Only `OPENCODE_PROVIDER_KEY` set → only the opencode job runs.
- Both set → both jobs run (additive coexistence).

No `BKIT_LINEAR_API_KEY` is needed, because `bkit-cloud.yml` is GitHub-tracker only for both jobs. The workflow grants `id-token: write` per job, for claude only (Claude GitHub App + federation token exchange). opencode has no OIDC.

## Claude — workload identity federation

The keyless claude job stores no long-lived `ANTHROPIC_API_KEY` in GitHub. `claude-code-action` asks GitHub for the job's OIDC token (issuer `https://token.actions.githubusercontent.com`, audience `https://api.anthropic.com`). Anthropic checks it against a federation rule and returns a short-lived Claude API token. The action refreshes it in the background on long runs.

**Setup (one-time):**

1. Claude Console → **Settings → Workload identity → Connect workload → GitHub Actions**. This creates the federation issuer, a service account, and a federation rule.
2. Scope the rule to this repo's default branch, because `bkit-cloud.yml` runs from it (`workflow_run` + `workflow_dispatch`):
   - `subject_prefix`: `repo:<owner>/<repo>:ref:refs/heads/<default-branch>`
   - claims: `repository_owner` = `<owner>`, `ref` = `refs/heads/<default-branch>`
   - to limit the rule to `bkit-cloud.yml`, add claim `workflow_ref` = `<owner>/<repo>/.github/workflows/bkit-cloud.yml@refs/heads/<default-branch>`. GitHub's token carries it; Anthropic's docs do not list it as matchable. Without it, every workflow on the default branch matches the rule.
3. Set repo **variables** (IDs, not secrets):
   ```sh
   gh variable set ANTHROPIC_FEDERATION_RULE_ID --body='fdrl_...'
   gh variable set ANTHROPIC_ORGANIZATION_ID --body='<organization-uuid>'
   # optional: ANTHROPIC_SERVICE_ACCOUNT_ID (svac_...), ANTHROPIC_WORKSPACE_ID
   ```
4. Delete the key if one is set: `gh secret delete ANTHROPIC_API_KEY`. **A set key wins over federation:** the action uses the key, and federation never runs. `bkit check` flags both being set (`anthropic-api-key-shadows-federation`).

**Adopted copy predates federation:** The variables are set, but `.github/workflows/bkit-cloud.yml` lacks the `anthropic_federation_rule_id:` input, so the claude job sees no credential. `bkit check` flags it (`anthropic-federation-template-stale`). Re-copy from `.bkit/templates/.github/workflows/bkit-cloud.yml`, then re-apply your local edits (`runs-on`).

**401 from token exchange:** Anthropic returns `401 Authentication failed` whichever check failed. Console → Workload identity → authentication history shows the deny reason per attempt. `match_subject_prefix` means the run's `sub` doesn't match the rule's `subject_prefix`: fix or widen the rule. A job on a non-default branch or an `environment:` has a different subject (`...:ref:refs/heads/<branch>` / `...:environment:<name>`).

The slash command body is already in the checked-out repo (mirrored to `.claude/commands/bkit-auto.md` and `.opencode/commands/bkit-auto.md` at dev time by `bkit install`). Repo git / gh ops use the auto-provided `github.token`, scoped by the workflow's `permissions:` block.

## Branch-aware routing

`bkit-cloud.yml`'s `workflow_run` trigger covers `feat/**` and `dev`. `main` is never auto-routed, so `dev` → `main` promotion stays manual.

<!-- prettier-ignore -->
| CI trigger | success | failure |
| --- | --- | --- |
| `feat/**` (pre-merge) | → `/bkit-ship` | → `/bkit-debug` |
| `dev` (post-merge) | no-op — the merge already happened | → `/bkit-debug {FID}` (capped) |
| `main` | manual only | manual only |

**Build still running (`feat/**`):** Before dispatch, read the branch's `docs/plans/*/logs/{FID}/status.jsonl` from `origin`:

- A `build` `workflow-started` row with no later `workflow-done` / `workflow-failed`, and the newest build row < 30 min old → `/bkit-build` owns the branch → no-op.
- The newest build row >= 30 min old → abandoned → dispatch.
- No file, or an unreadable one → dispatch.

The post-merge `dev` surface reuses the same free-tier gate. When the issue carries `bkit:auto`, `/bkit-ship` threads ` bkit [auto route]` onto the PR squash-merge `--subject`, so the commit that lands on `dev`, and triggers post-merge CI, already carries the marker the gate checks.

## Routing decision (router orchestrator)

The slash command takes two args: `$CI_STATUS` in `success|failure|pass|fail` (normalised), and `$ARG`, which is a PR number (pre-merge) or a `{FID}` slug (post-merge `dev`, no open PR). Then:

1. With a PR-number arg, it reads `gh pr view $ARG` for `headRefName`, `headRefOid`, `state`, and refuses non-open PRs. With a slug arg, it skips the PR lookup entirely.
2. It extracts `{FID}` from the head branch (`feat/{FID}` convention). With a slug arg, `{ARG}` is the `{FID}`, allowlist-asserted before use. On the `dev` surface the workflow recovers it from the squash-merge commit scope (`feat({FID}): …`, tracker-agnostic), and falls back to the linked PR body's `bkit:fid=` marker. If either path fails → no-op, no dispatch.
3. Stale-run guard. Pre-merge, it compares the latest CI run's `headSha` against the PR's current `headRefOid`. Post-merge on `dev`, it compares the most recently completed `dev` CI run's `headSha` against the triggering run's head SHA. A `git rev-parse origin/dev` comparison would mismatch on every legitimate dispatch, because ship's terminal close commit lands on `dev` while that CI run is still going. Close commits carry `[skip ci]`, so they never trigger CI and never become that most-recent-completed head. An empty run list fails open (dispatches).
4. Opt-in gate: it refuses dispatch unless the linked GitHub issue carries the `bkit:auto` label.
5. It appends a `bkit-auto → /bkit-{ship,debug}` line to the GitHub issue / PR comment thread.
6. It invokes `/bkit-ship {FID}` (CI pass) or `/bkit-debug {FID} DEBUG_MODE=pr` (CI fail) through the `Skill` / `Task` tool. The dispatched skill owns the session lifecycle from there.

Skip conditions emit a single GitHub-comment no-op line and exit 0. Only real failures (missing args, GitHub API unreachable, malformed state) take the Failure Path.

## Operating notes

- **Loop bound (pre-merge `feat/**`):** `/bkit-debug` enforces `bkit.workflows.debug.fix` and `.soak` `maxAttempts` internally, counted across every debug run of the feature. The router never counts attempts. Once the fix attempts are used up, debug switches to soak. Once the soak attempts are used up, it takes the Failure Path (handover) and stops.
- **Loop bound (`dev`):** The cap is `bkit.workflows.debug.fix.maxAttempts` + `bkit.workflows.debug.soak.maxAttempts` (2 + 2 by default) distinct failed CI SHAs per `{FID}`, all-time. Every debug run makes at least one attempt, so more dispatches could never run one.
  - The router reads both values from `package.json` with `jq`, because bkit is not installed at that point. It falls back to 2 for a missing or bad value, as the engine does.
  - This is the surface that needs a cross-session cap. `/bkit-debug` adopts `dev` in place, so its fix push re-reds `dev` CI and re-triggers this same router.
  - The ctx step of `bkit-cloud.yml`'s `context` job checks and writes the cap immediately before dispatch, so a run that could not record its own attempts is still bounded.
  - The counter row (`type: "dev-dispatch"`) is committed to `dev` with `[skip ci]` before dispatch, and its presence on `origin/dev` is verified after one retry. A row that lands nowhere durable would make the cap unbounded.
  - When the cap is used up → no-op + `::notice::` for operator review. Delete the rows in `status.jsonl` to reset it.
- **GHA 6 h cap:** `3 x ~3600s` per debug attempt is well under the GHA runner ceiling. Ship is short.
- **Concurrency:** `cancel-in-progress` is `true` for `feat/**` (latest-wins) and `false` for `dev`, so an in-flight `/bkit-debug` finishes instead of being cancelled mid-run with a half-written `status.jsonl` or a held worktree lock. GHA queues at most one pending run per group. The queued run re-checks the dispatch cap when it starts, so the same `{FID}` needs no manual re-trigger. The Cursor dashboard trigger is "latest-supersedes." The ship squash-merge is atomic, so mid-run cancels cannot corrupt PR state.
- **`bkit-auto-dev` is one concurrency group for all FIDs.** GHA resolves `concurrency.group` from the trigger-payload context before the ctx step derives the `{FID}`, so the group cannot be keyed on it. When two different FIDs fail `dev` CI near-simultaneously, queue-collapse can drop the older, different FID's pending run. The stale-run guard detects it (its head SHA no longer matches the most-recent-completed `dev` CI run) and writes a `dev-dispatch-dropped` row to the job summary plus a `::warning::`, rather than discarding it silently. The row goes to the job summary, not a committed `status.jsonl`, because this branch is reached only when `dev` has already advanced. Committing the row would usually be a non-fast-forward, and the row would be lost in exactly the case it records.
- **Both clouds together:** Nothing stops Claude + Cursor from dispatching against the same PR, and they would race. Pick one IDE per repo as the auto-router. The recommendation is Claude via GHA, which is runner-resident and Anthropic-maintained. Leave Cursor for ad-hoc Linear-dispatch work.

# Caveats (both clouds)

- **No secrets store yet (Claude).** Env vars and the setup-script body are plaintext in the Claude app. Rotate PATs regularly.
- **Env vars do not reach Claude setup script.** Auth at snapshot-build time would have to be inlined, which is the leak you want to avoid. Design around it: put public binaries in the setup script, and leave auth-bearing work to the SessionStart hook.
- **Cache invalidation is body-based (Claude).** Editing the env-vars block or the repo-side hook scripts doesn't trigger a rebuild. To force one, run `bkit install` or `bkit upgrade`, which re-stamps the `# cache-bust` line, then paste the new setup script.
- **Husky runs on `pnpm install`** (repos that adopted the `.husky/*` templates). `prepare` registers git hooks during install. The pre-commit hook (`bkit:gate:format` → `lint-staged`) runs when the agent commits. The `slop-scan` devDep reaches PATH through `node_modules/.bin`. The `vale` system binary comes from the setup script (Claude) or the Dockerfile (Cursor).
- **Bun proxy issues (Claude).** Bun has known proxy issues with the cloud security proxy. bkit uses pnpm, so it is unaffected. Flag this for bun consumers.
- **Custom base image not supported (Claude).** The escape hatch is `docker compose` sidecars. The bkit stack does not need it today.
- **Cursor image cache layer-based.** Reorder `RUN` lines carefully, because a frequently-changing line above a slow one invalidates the cache below it.
- **GitHub App vs `/web-setup` (Claude).** Auto-fix PRs require the GitHub App. `/web-setup` (syncs the `gh` token to the Claude account) is enough for clone + push, but not for auto-fix.
- **IP allowlists** on org GitHub / Anthropic accounts block cloud sessions. Contact support to exempt managed infra.
- **Hooks unproven (Codex Cloud).** Cloud tasks have no documented hook support, so there is no GateGuard / guardrails guarantee there (§ Codex Cloud → Hooks in cloud tasks).

# Sources

- Anthropic docs: <https://code.claude.com/docs/en/claude-code-on-the-web>
- Cursor Cloud Agents: <https://cursor.com/docs/cloud-agent/setup>
- Codex Cloud environments: <https://learn.chatgpt.com/docs/environments/cloud-environments>
- Zenn article on Claude env-var / setup-script gotcha: <https://zenn.dev/harieshokunin/articles/b1064354319ce2?locale=en>
- Managed Agents environments (separate product, similar shape): <https://platform.claude.com/docs/en/managed-agents/environments>
