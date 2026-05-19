# Cloud agent environments — Claude Code on the web + Cursor Background Agents

> [!CAUTION]
> **Purpose:** Single source of truth for both Claude Code on the web (mobile / web) and Cursor Background Agents (Linear @cursor dispatch). Optimised so the two stacks ship the **same toolchain** and the **same Linear preflight** — switch IDE without re-learning anything.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent + maintainer readers.
> - Claude's env config lives in the Claude app; Cursor's lives in `.cursor/` in-repo. Both have an in-repo SessionStart guard.
> - Update this doc when either cloud's pre-installed toolchain or default allowlist changes. Sources: `code.claude.com/docs/en/claude-code-on-the-web` + `cursor.com/docs/background-agent`.

## Scope

> **Host-delta matrix:** `.agents/IDEs.md` § Runtime environment (cloud agents). That table is the canonical "what differs" reference for Claude vs Cursor cloud agents. This file = paste-in setup recipe, alignment guarantees, sharing-across-repos pattern, and caveats.

## What lives where (orient first)

<!-- prettier-ignore -->
| Configuration | Lives in the repo (bkit-managed) | Lives in the online dashboard (manual, one-time) |
| --- | --- | --- |
| **Claude Code on the web** | `.claude/hooks/preflight.sh` (Linear guard) + `.claude/hooks/cloud-bootstrap.sh` (per-session install — Tier 2 markered, customise outside markers) | `claude.ai/code` → environment selector → **+ Add environment**: name, **setup script** (paste from § Setup script), **environment variables** (`GH_TOKEN`, `GH_BKIT_TOKEN`, `LINEAR_API_KEY`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`), **network access** (`Trusted`) |
| **Cursor Background Agents** | `.cursor/Dockerfile` (Tier 2 markered toolchain block + consumer extensions) + `.cursor/environment.json` (consumer-owned `install` / `start` / `terminals[]` / `env`) + `.cursor/hooks.json` (wires preflight `failClosed: true`) + `.cursor/hooks/preflight.sh` (Linear guard) | Cursor → **Settings → Background Agents → Environment Variables**: `LINEAR_API_KEY`, `GH_TOKEN`, `GH_BKIT_TOKEN`. (`LINEAR_ISSUE_ID` injected per-session by the integration — don't hardcode.) |

**Rule of thumb:** if it's an env var or auth token, it goes in the online dashboard (out of git). If it's a script / Dockerfile / install hook, it lives in the repo.

**Alignment guarantees bkit enforces:**

- Same vale version (3.9.1) pre-installed on both clouds.
- Same pinned pnpm (`10.33.0`, matching `packageManager`) on both.
- Same gh CLI install path (apt repo on Ubuntu 24.04).
- Same Linear guard semantics — Auto label + non-terminal status — wrapped in `<!-- bkit:start --> ... <!-- bkit:end -->` so it stays bkit-managed in consumer repos.

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

- `.claude/hooks/preflight.sh` — Linear guard. Skips silently when `LINEAR_ISSUE_ID` is unset (i.e. IDE sessions). Non-zero exit is informational only on Claude (`SessionStart` cannot block); the agent reads the `HARD STOP` text from `additionalContext`.
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
LINEAR_API_KEY=<Linear personal API key, for preflight.sh>
LINEAR_ISSUE_ID=<set per-session via CLI / iOS launch; leave blank in env config>
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70
```

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
| Metadata | Read | mandatory, auto-included |

`gh` reads `GH_TOKEN` automatically; no `gh auth login`.

#### When classic is still required

- **`pnpm publish` to GitHub Packages.** Fine-grained packages support has edge cases on user-owned packages. Put a classic PAT (`write:packages` + `repo`) in `GITHUB_TOKEN`, separate from `GH_TOKEN`. Keep it only in release-flow sessions.
- **Cross-repo work in a single cloud session.** Fine-grained PATs only see their allowlist; classic sees everything your user can.

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
| `.cursor/hooks/preflight.sh` | Linear guard — Auto label + non-terminal status. Skips silently on IDE sessions | Tier 2 contained (bkit:start/end markers) |

## How Linear dispatch works

1. You assign a Linear issue to **Cursor** (the integration user) or comment `@cursor /design BAR-NNN`.
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

The routing **logic** lives in a single bkit-managed slash-command orchestrator (`.agents/workflows/bkit-ci-router.md`, mirrored to `.claude/commands/bkit-ci-router.md` + `.cursor/commands/bkit-ci-router.md` on each `pnpm bkit install`). The routing **trigger** is wired separately per IDE because the two clouds use different event surfaces.

## What lives where (post-CI half)

<!-- prettier-ignore -->
|  | Lives in the repo (bkit-managed) | Lives in the online dashboard / GitHub (manual, one-time) |
| --- | --- | --- |
| **Claude** | `.github/workflows/bkit-ci-router.yml` (thin plumbing — Tier 3 seed via `bkit install`). On CI completion, dispatches `claude-code-action@v1` with prompt `/bkit-ci-router $CI_STATUS $PR_NUMBER`. | GitHub repo secrets: `ANTHROPIC_API_KEY`, `LINEAR_API_KEY`. Linear issue must carry the `Auto` label (opt-in). |
| **Cursor** | Nothing — Cursor cloud agents have native triggers. | Cursor → Cloud Agents dashboard → Triggers → + Add trigger. Event: CI workflow completion on `feat/**` branches. Prompt (paste **literally**, no edits): `/bkit-ci-router $CI_STATUS $PR_NUMBER`. Concurrency: latest-supersedes. |

**Why the dashboard prompt never needs re-pasting:** Cursor substitutes `$CI_STATUS` and `$PR_NUMBER` from the event payload at dispatch time. The pasted string is generic and timeless. When bkit's routing logic evolves (new edge cases, new gates), only the mirrored `.cursor/commands/bkit-ci-router.md` changes — the dashboard config is untouched.

## Cursor dashboard — exact paste

```
/bkit-ci-router $CI_STATUS $PR_NUMBER
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
| `LINEAR_API_KEY` | Router reads issue labels (Linear `Auto` opt-in gate) + appends comments. Already present for the Linear webhook flow. | Linear personal API key. |

The router does **not** need `GH_BKIT_TOKEN`. The slash command body is already in the checked-out repo (mirrored to `.claude/commands/bkit-ci-router.md` at dev time via `bkit install`), and the workflow has no `pnpm install` step that would pull `@cbartens/bkit`. Repo git/gh operations (checkout, `gh pr list`, status.json push) use the auto-provided `github.token` scoped by the workflow's `permissions:` block (which in turn is capped by the org/repo Workflow permissions setting above).

## Routing decision (router orchestrator)

The slash command takes two args: `$CI_STATUS` ∈ `{success, failure, pass, fail}` (normalised) and `$PR_NUMBER`. It then:

1. Reads `gh pr view $PR_NUMBER` for `headRefName`, `headRefOid`, `state`. Refuses non-OPEN PRs.
2. Extracts `{FID}` from the head branch (`feat/{FID}` convention).
3. Stale-run guard: compares the latest CI run's `headSha` against the PR's current `headRefOid`. Skips on mismatch (newer commit already in flight).
4. Linear opt-in gate: refuses to dispatch unless the Linear issue carries the `Auto` label.
5. Appends a `bkit-ci-router → /bkit-{ship,debug}` line to the existing Linear comment thread.
6. Invokes `/bkit-ship {FID}` (CI pass) or `/bkit-debug {FID} DEBUG_MODE=pr` (CI fail) via the `Skill` / `Task` tool. The dispatched skill owns its session lifecycle from there.

Skip conditions emit a single Linear no-op line and exit 0 — only real failures (missing args, Linear API unreachable, malformed state) take the Failure Path.

## Operating notes

- **Loop bound:** `/bkit-debug` enforces `MAX_DEBUG_ATTEMPT = 3` internally; the router never counts attempts. After three red CI runs, debug fires its handover path and stops dispatching.
- **GHA 6 h cap:** `3 × ~3600s` per debug attempt = well under the GHA runner ceiling. Ship is short.
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
